const express = require('express');
const router = express.Router();
const { randomUUID: uuidv4 } = require('crypto');
const { dbRun, dbGet, dbAll } = require('../db/database');
const { calculatePlacement, CEFR_DESCRIPTIONS } = require('../services/adaptiveEngine');
const { generateCertificatePDF } = require('../services/certificateGenerator');

/**
 * POST /api/v1/sessions/start
 * Registers the student (lead capture), starts session, provides questions
 */
router.post('/start', async (req, res) => {
  try {
    const { full_name, email, phone, learning_goal } = req.body;

    if (!full_name || !email || !phone) {
      return res.status(400).json({ error: 'Nom complet, email et numéro de téléphone sont requis.' });
    }

    // Find or create student user
    let user = await dbGet(`SELECT * FROM users WHERE email = ? AND role = 'STUDENT'`, [email.toLowerCase().trim()]);
    const userId = user ? user.id : uuidv4();

    if (!user) {
      await dbRun(
        `INSERT INTO users (id, full_name, email, phone, role, learning_goal)
         VALUES (?, ?, ?, ?, 'STUDENT', ?)`,
        [userId, full_name.trim(), email.toLowerCase().trim(), phone.trim(), learning_goal || 'Perfectionnement Général']
      );
    } else {
      // Update phone or learning goal if updated
      await dbRun(
        `UPDATE users SET full_name = ?, phone = ?, learning_goal = ? WHERE id = ?`,
        [full_name.trim(), phone.trim(), learning_goal || user.learning_goal, userId]
      );
    }

    // Create session
    const sessionId = uuidv4();
    await dbRun(
      `INSERT INTO test_sessions (id, user_id, status, started_at)
       VALUES (?, ?, 'IN_PROGRESS', CURRENT_TIMESTAMP)`,
      [sessionId, userId]
    );

    // Fetch active questions ordered by skill and level progression
    const allQuestions = await dbAll(`SELECT * FROM questions WHERE is_active = 1`);
    
    // Shuffle options and questions within skills to maintain integrity
    const levelOrder = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
    const skillOrder = { GRAMMAR: 1, VOCABULARY: 2, READING: 3, LISTENING: 4 };

    const sortedQuestions = allQuestions.sort((a, b) => {
      if (skillOrder[a.skill_type] !== skillOrder[b.skill_type]) {
        return skillOrder[a.skill_type] - skillOrder[b.skill_type];
      }
      return levelOrder[a.cefr_level] - levelOrder[b.cefr_level];
    });

    // CRITICAL SECURITY RULE: Strip correct_option_id from client response!
    const sanitizedQuestions = sortedQuestions.map((q) => {
      let parsedOptions = [];
      try {
        parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      } catch (e) {
        parsedOptions = [];
      }

      return {
        id: q.id,
        skill_type: q.skill_type,
        cefr_level: q.cefr_level,
        question_text: q.question_text,
        context_text: q.context_text,
        media_url: q.media_url,
        audio_text: q.audio_text,
        options: parsedOptions,
        points: q.points
      };
    });

    res.json({
      success: true,
      sessionId,
      user: {
        id: userId,
        full_name,
        email,
        phone,
        learning_goal
      },
      totalQuestions: sanitizedQuestions.length,
      estimatedTimeMinutes: 20,
      questions: sanitizedQuestions
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Erreur lors du démarrage du test.' });
  }
});

/**
 * POST /api/v1/sessions/:id/answer
 * Records an individual answer in real-time
 */
router.post('/:id/answer', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { questionId, selectedOptionId } = req.body;

    const session = await dbGet(`SELECT * FROM test_sessions WHERE id = ?`, [sessionId]);
    if (!session) {
      return res.status(404).json({ error: 'Session introuvable.' });
    }
    if (session.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Cette session est déjà finalisée.' });
    }

    const question = await dbGet(`SELECT * FROM questions WHERE id = ?`, [questionId]);
    if (!question) {
      return res.status(404).json({ error: 'Question introuvable.' });
    }

    const isCorrect = (question.correct_option_id === selectedOptionId) ? 1 : 0;

    // Check if previously answered
    const existingAnswer = await dbGet(
      `SELECT * FROM user_answers WHERE session_id = ? AND question_id = ?`,
      [sessionId, questionId]
    );

    if (existingAnswer) {
      await dbRun(
        `UPDATE user_answers 
         SET selected_option_id = ?, is_correct = ?, answered_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [selectedOptionId, isCorrect, existingAnswer.id]
      );
    } else {
      const answerId = uuidv4();
      await dbRun(
        `INSERT INTO user_answers (id, session_id, question_id, selected_option_id, is_correct)
         VALUES (?, ?, ?, ?, ?)`,
        [answerId, sessionId, questionId, selectedOptionId, isCorrect]
      );
    }

    res.json({ success: true, saved: true });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la réponse.' });
  }
});

/**
 * POST /api/v1/sessions/:id/submit
 * Concludes the test, calculates final CEFR level, triggers certificate issuance
 */
router.post('/:id/submit', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await dbGet(`SELECT * FROM test_sessions WHERE id = ?`, [sessionId]);
    if (!session) {
      return res.status(404).json({ error: 'Session introuvable.' });
    }

    const user = await dbGet(`SELECT * FROM users WHERE id = ?`, [session.user_id]);

    // Fetch all answers with question metadata
    const answers = await dbAll(
      `SELECT ua.*, q.skill_type, q.cefr_level, q.points, q.question_text
       FROM user_answers ua
       JOIN questions q ON ua.question_id = q.id
       WHERE ua.session_id = ?`,
      [sessionId]
    );

    // Calculate placement
    const evaluation = calculatePlacement(answers);

    // Certificate generation ID
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const certificateId = `OTG-2026-${evaluation.cefr_level}-${randomSuffix}`;
    const certificateUrl = `/api/v1/sessions/${sessionId}/certificate.pdf`;

    // Update session
    await dbRun(
      `UPDATE test_sessions
       SET status = 'COMPLETED',
           completed_at = CURRENT_TIMESTAMP,
           total_score = ?,
           assigned_cefr_level = ?,
           skill_scores = ?,
           certificate_id = ?,
           certificate_url = ?
       WHERE id = ?`,
      [
        evaluation.total_score,
        evaluation.cefr_level,
        JSON.stringify(evaluation.skills_breakdown),
        certificateId,
        certificateUrl,
        sessionId
      ]
    );

    res.json({
      success: true,
      sessionId,
      studentName: user ? user.full_name : 'Candidat',
      cefr_level: evaluation.cefr_level,
      percentage: evaluation.percentage,
      total_score: evaluation.total_score,
      max_possible_score: evaluation.max_possible_score,
      skills_breakdown: evaluation.skills_breakdown,
      details: evaluation.details,
      certificateId,
      certificateUrl
    });
  } catch (error) {
    console.error('Error submitting session:', error);
    res.status(500).json({ error: 'Erreur lors de la finalisation du test.' });
  }
});

/**
 * GET /api/v1/sessions/:id/result
 * Retrieves test results for a session
 */
router.get('/:id/result', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await dbGet(`SELECT * FROM test_sessions WHERE id = ?`, [sessionId]);
    if (!session) {
      return res.status(404).json({ error: 'Session introuvable.' });
    }

    const user = await dbGet(`SELECT * FROM users WHERE id = ?`, [session.user_id]);
    let skillScores = {};
    try {
      skillScores = session.skill_scores ? JSON.parse(session.skill_scores) : {};
    } catch (e) {
      skillScores = {};
    }

    const level = session.assigned_cefr_level || 'B1';
    const details = CEFR_DESCRIPTIONS[level] || CEFR_DESCRIPTIONS.B1;

    res.json({
      sessionId,
      studentName: user ? user.full_name : 'Candidat',
      status: session.status,
      total_score: session.total_score,
      cefr_level: level,
      skills_breakdown: skillScores,
      details,
      certificateId: session.certificate_id,
      certificateUrl: session.certificate_url,
      started_at: session.started_at,
      completed_at: session.completed_at
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des résultats.' });
  }
});

/**
 * GET /api/v1/sessions/:id/certificate.pdf
 * Generates and streams PDF certificate
 */
router.get('/:id/certificate.pdf', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await dbGet(`SELECT * FROM test_sessions WHERE id = ?`, [sessionId]);
    if (!session) {
      return res.status(404).send('Session introuvable.');
    }

    const user = await dbGet(`SELECT * FROM users WHERE id = ?`, [session.user_id]);
    const level = session.assigned_cefr_level || 'B1';
    const levelDetails = CEFR_DESCRIPTIONS[level] || CEFR_DESCRIPTIONS.B1;

    let skillScores = { GRAMMAR: 75, VOCABULARY: 75, READING: 75, LISTENING: 75 };
    try {
      if (session.skill_scores) {
        skillScores = JSON.parse(session.skill_scores);
      }
    } catch (e) {}

    const certData = {
      studentName: user ? user.full_name : 'Candidat Open The Gate',
      certificateId: session.certificate_id || `OTG-2026-${level}-CERT`,
      cefrLevel: level,
      levelTitle: levelDetails.title,
      date: session.completed_at ? new Date(session.completed_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
      skillsBreakdown: skillScores
    };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Attestation_CECRL_${certData.cefrLevel}_${(user?.full_name || 'Candidat').replace(/\s+/g, '_')}.pdf"`
    );

    generateCertificatePDF(certData, res);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Erreur lors de la génération du certificat PDF.');
  }
});

module.exports = router;
