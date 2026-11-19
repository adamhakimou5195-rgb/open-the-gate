/**
 * Adaptive Scoring & Placement Engine for OPEN THE GATE
 * Based on CEFR (Common European Framework of Reference for Languages)
 */

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const CEFR_DESCRIPTIONS = {
  A1: {
    title: 'A1 - Niveau Découverte (Beginner)',
    summary: 'Vous comprenez et utilisez des expressions familières et quotidiennes ainsi que des énoncés très simples pour satisfaire des besoins concrets.',
    recommendation: 'Programme OPEN THE GATE : "English Starter Pack - Découverte & Confiance"'
  },
  A2: {
    title: 'A2 - Niveau Élémentaire (Elementary)',
    summary: 'Vous comprenez des phrases isolées et des expressions courantes relatives à des domaines de priorité immédiate (famille, achats, travail proche).',
    recommendation: 'Programme OPEN THE GATE : "Foundations Fluency - Consolidation & Automatismes"'
  },
  B1: {
    title: 'B1 - Niveau Intermédiaire (Intermediate)',
    summary: 'Vous comprenez les points essentiels dans un langage clair et standard. Vous pouvez vous débrouiller dans la plupart des situations linguistiques courantes.',
    recommendation: 'Programme OPEN THE GATE : "Intermediate Booster - Fluidité & Prise de Parole"'
  },
  B2: {
    title: 'B2 - Niveau Intermédiaire Supérieur (Upper Intermediate)',
    summary: 'Vous comprenez le contenu essentiel de sujets complexes et techniques. Vous vous exprimez avec spontanéité et aisance avec des locuteurs natifs.',
    recommendation: 'Programme OPEN THE GATE : "Professional English Mastery - Communication Pro & Business"'
  },
  C1: {
    title: 'C1 - Niveau Avancé (Advanced)',
    summary: 'Vous vous exprimez spontanément et couramment sans chercher vos mots. Votre utilisation de la langue est souple, riche et efficace dans les contextes professionnels et académiques.',
    recommendation: 'Programme OPEN THE GATE : "Executive English & Global Leadership - C1 Certification"'
  },
  C2: {
    title: 'C2 - Niveau Maîtrise (Proficiency / Mastery)',
    summary: 'Vous comprenez sans effort pratiquement tout ce que vous lisez ou entendez. Vous vous exprimez avec une nuance et une précision digne d\'un locuteur natif très cultivé.',
    recommendation: 'Programme OPEN THE GATE : "Mastery Excellence & Public Speaking Mastery"'
  }
};

/**
 * Calculates final CEFR level based on weighted answers
 * @param {Array} userAnswers - list of answered questions with is_correct, points, cefr_level, skill_type
 */
function calculatePlacement(userAnswers) {
  if (!userAnswers || userAnswers.length === 0) {
    return {
      cefr_level: 'A1',
      total_score: 0,
      max_possible_score: 1,
      percentage: 0,
      skills_breakdown: { GRAMMAR: 0, VOCABULARY: 0, READING: 0, LISTENING: 0 },
      details: CEFR_DESCRIPTIONS.A1
    };
  }

  let totalEarned = 0;
  let maxPossible = 0;

  const skillsData = {
    GRAMMAR: { earned: 0, possible: 0 },
    VOCABULARY: { earned: 0, possible: 0 },
    READING: { earned: 0, possible: 0 },
    LISTENING: { earned: 0, possible: 0 }
  };

  const levelPerformance = {
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
    C1: { correct: 0, total: 0 },
    C2: { correct: 0, total: 0 }
  };

  userAnswers.forEach((ans) => {
    const pts = ans.points || 1;
    const isCorrect = ans.is_correct === 1 || ans.is_correct === true;
    const skill = ans.skill_type || 'GRAMMAR';
    const lvl = ans.cefr_level || 'B1';

    maxPossible += pts;
    if (isCorrect) {
      totalEarned += pts;
    }

    if (skillsData[skill]) {
      skillsData[skill].possible += pts;
      if (isCorrect) skillsData[skill].earned += pts;
    }

    if (levelPerformance[lvl]) {
      levelPerformance[lvl].total += 1;
      if (isCorrect) levelPerformance[lvl].correct += 1;
    }
  });

  const overallRatio = maxPossible > 0 ? totalEarned / maxPossible : 0;
  const overallPercentage = Math.round(overallRatio * 100);

  // Skill percentages
  const skillsBreakdown = {};
  for (const [skill, val] of Object.entries(skillsData)) {
    skillsBreakdown[skill] = val.possible > 0 ? Math.round((val.earned / val.possible) * 100) : 100;
  }

  // Adaptive CEFR derivation:
  // Check success on highest levels and overall score
  let determinedLevel = 'A1';

  if (overallPercentage >= 88 && (levelPerformance.C1.correct >= 1 || levelPerformance.C2.correct >= 1)) {
    determinedLevel = overallPercentage >= 95 ? 'C2' : 'C1';
  } else if (overallPercentage >= 70) {
    determinedLevel = overallPercentage >= 82 ? 'B2' : 'B1';
  } else if (overallPercentage >= 45) {
    determinedLevel = overallPercentage >= 58 ? 'B1' : 'A2';
  } else if (overallPercentage >= 25) {
    determinedLevel = 'A2';
  } else {
    determinedLevel = 'A1';
  }

  return {
    cefr_level: determinedLevel,
    total_score: totalEarned,
    max_possible_score: maxPossible,
    percentage: overallPercentage,
    skills_breakdown: skillsBreakdown,
    details: CEFR_DESCRIPTIONS[determinedLevel]
  };
}

module.exports = {
  CEFR_LEVELS,
  CEFR_DESCRIPTIONS,
  calculatePlacement
};
