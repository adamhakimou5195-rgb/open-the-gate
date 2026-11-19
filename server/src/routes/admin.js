const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { randomUUID: uuidv4 } = require('crypto');
const { dbRun, dbGet, dbAll } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'open-the-gate-super-secret-key-2026';

// Middleware for Admin JWT authentication
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accès non autorisé. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Droits administrateur requis.' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expirée ou invalide. Veuillez vous reconnecter.' });
  }
};

/**
 * POST /api/v1/admin/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    const admin = await dbGet(`SELECT * FROM users WHERE email = ? AND role = 'ADMIN'`, [email.toLowerCase().trim()]);
    if (!admin) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    const isMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, full_name: admin.full_name, role: 'ADMIN' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name
      }
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
});

/**
 * GET /api/v1/admin/analytics
 */
router.get('/analytics', requireAdmin, async (req, res) => {
  try {
    const totalSessionsRow = await dbGet(`SELECT COUNT(*) as total FROM test_sessions`);
    const completedSessionsRow = await dbGet(`SELECT COUNT(*) as total FROM test_sessions WHERE status = 'COMPLETED'`);
    const totalStudentsRow = await dbGet(`SELECT COUNT(*) as total FROM users WHERE role = 'STUDENT'`);

    // Level distribution
    const levelRows = await dbAll(`
      SELECT assigned_cefr_level, COUNT(*) as count 
      FROM test_sessions 
      WHERE status = 'COMPLETED' AND assigned_cefr_level IS NOT NULL 
      GROUP BY assigned_cefr_level
    `);

    const levelDistribution = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    levelRows.forEach((r) => {
      if (levelDistribution[r.assigned_cefr_level] !== undefined) {
        levelDistribution[r.assigned_cefr_level] = r.count;
      }
    });

    // Average score
    const avgScoreRow = await dbGet(`
      SELECT AVG(total_score) as avgScore 
      FROM test_sessions 
      WHERE status = 'COMPLETED'
    `);

    const totalSessions = totalSessionsRow?.total || 0;
    const completedSessions = completedSessionsRow?.total || 0;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    res.json({
      totalSessions,
      completedSessions,
      totalStudents: totalStudentsRow?.total || 0,
      completionRate,
      averageScore: Math.round(avgScoreRow?.avgScore || 0),
      levelDistribution
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des analytics.' });
  }
});

/**
 * GET /api/v1/admin/sessions
 * List all sessions with user data and filters
 */
router.get('/sessions', requireAdmin, async (req, res) => {
  try {
    const { level, search } = req.query;
    let sql = `
      SELECT ts.id, ts.status, ts.started_at, ts.completed_at, ts.total_score,
             ts.assigned_cefr_level, ts.skill_scores, ts.certificate_id,
             u.full_name, u.email, u.phone, u.learning_goal
      FROM test_sessions ts
      JOIN users u ON ts.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (level && level !== 'ALL') {
      sql += ` AND ts.assigned_cefr_level = ?`;
      params.push(level);
    }

    if (search) {
      sql += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    sql += ` ORDER BY ts.started_at DESC LIMIT 200`;

    const sessions = await dbAll(sql, params);
    const parsedSessions = sessions.map((s) => ({
      ...s,
      skill_scores: s.skill_scores ? JSON.parse(s.skill_scores) : null
    }));

    res.json({ sessions: parsedSessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des sessions.' });
  }
});

/**
 * GET /api/v1/admin/export-csv
 * CSV export of students/leads and test scores
 */
router.get('/export-csv', requireAdmin, async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT u.full_name, u.email, u.phone, u.learning_goal,
             ts.status, ts.started_at, ts.completed_at, ts.total_score,
             ts.assigned_cefr_level, ts.certificate_id
      FROM test_sessions ts
      JOIN users u ON ts.user_id = u.id
      ORDER BY ts.started_at DESC
    `);

    // Build CSV with UTF-8 BOM
    let csv = '\uFEFFNom Complet,Email,Telephone,Objectif,Statut Test,Niveau CECRL,Score,Identifiant Certificat,Date Debut,Date Fin\n';

    rows.forEach((r) => {
      const clean = (val) => (val ? `"${String(val).replace(/"/g, '""')}"` : '""');
      csv += `${clean(r.full_name)},${clean(r.email)},${clean(r.phone)},${clean(r.learning_goal)},${clean(r.status)},${clean(r.assigned_cefr_level || 'N/A')},${r.total_score || 0},${clean(r.certificate_id || 'N/A')},${clean(r.started_at)},${clean(r.completed_at || '')}\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Candidats_Open_The_Gate.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Erreur lors de l\'exportation CSV.' });
  }
});

/**
 * Question Bank Management (CRUD)
 */
router.get('/questions', requireAdmin, async (req, res) => {
  try {
    const { skill, level } = req.query;
    let sql = `SELECT * FROM questions WHERE 1=1`;
    const params = [];

    if (skill && skill !== 'ALL') {
      sql += ` AND skill_type = ?`;
      params.push(skill);
    }
    if (level && level !== 'ALL') {
      sql += ` AND cefr_level = ?`;
      params.push(level);
    }

    sql += ` ORDER BY skill_type, cefr_level`;
    const questions = await dbAll(sql, params);

    const parsed = questions.map((q) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));

    res.json({ questions: parsed });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des questions.' });
  }
});

router.post('/questions', requireAdmin, async (req, res) => {
  try {
    const { skill_type, cefr_level, question_text, context_text, media_url, audio_text, options, correct_option_id, points } = req.body;
    if (!skill_type || !cefr_level || !question_text || !options || !correct_option_id) {
      return res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires.' });
    }

    const id = uuidv4();
    await dbRun(
      `INSERT INTO questions (id, skill_type, cefr_level, question_text, context_text, media_url, audio_text, options, correct_option_id, points, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        id,
        skill_type,
        cefr_level,
        question_text,
        context_text || null,
        media_url || null,
        audio_text || null,
        JSON.stringify(options),
        correct_option_id,
        points || 1
      ]
    );

    res.json({ success: true, id });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la question.' });
  }
});

router.put('/questions/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { skill_type, cefr_level, question_text, context_text, media_url, audio_text, options, correct_option_id, points, is_active } = req.body;

    await dbRun(
      `UPDATE questions
       SET skill_type = ?, cefr_level = ?, question_text = ?, context_text = ?,
           media_url = ?, audio_text = ?, options = ?, correct_option_id = ?,
           points = ?, is_active = ?
       WHERE id = ?`,
      [
        skill_type,
        cefr_level,
        question_text,
        context_text || null,
        media_url || null,
        audio_text || null,
        JSON.stringify(options),
        correct_option_id,
        points || 1,
        is_active !== undefined ? is_active : 1,
        id
      ]
    );

    res.json({ success: true, id });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la question.' });
  }
});

router.delete('/questions/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun(`DELETE FROM questions WHERE id = ?`, [id]);
    res.json({ success: true, deleted: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

module.exports = router;
