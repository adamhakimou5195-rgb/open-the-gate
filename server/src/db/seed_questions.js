const { dbGet, dbRun, dbAll } = require('./database');
const { randomUUID: uuidv4 } = require('crypto');

const sampleQuestions = [
  // ==================== GRAMMAR ====================
  // A1 Grammar
  {
    skill_type: 'GRAMMAR',
    cefr_level: 'A1',
    question_text: 'Choose the correct form of the verb "to be": "She ______ a teacher at Open The Gate."',
    options: [
      { id: 'a', text: 'are' },
      { id: 'b', text: 'is' },
      { id: 'c', text: 'am' },
      { id: 'd', text: 'be' }
    ],
    correct_option_id: 'b',
    points: 1
  },
  {
    skill_type: 'GRAMMAR',
    cefr_level: 'A1',
    question_text: 'Where ______ you live?',
    options: [
      { id: 'a', text: 'do' },
      { id: 'b', text: 'does' },
      { id: 'c', text: 'are' },
      { id: 'd', text: 'is' }
    ],
    correct_option_id: 'a',
    points: 1
  },
  // A2 Grammar
  {
    skill_type: 'GRAMMAR',
    cefr_level: 'A2',
    question_text: 'Yesterday, we ______ to the cinema and watched a great documentary.',
    options: [
      { id: 'a', text: 'go' },
      { id: 'b', text: 'gone' },
      { id: 'c', text: 'went' },
      { id: 'd', text: 'were going' }
    ],
    correct_option_id: 'c',
    points: 1
  },
  {
    skill_type: 'GRAMMAR',
    cefr_level: 'A2',
    question_text: 'This laptop is ______ than my old one.',
    options: [
      { id: 'a', text: 'more fast' },
      { id: 'b', text: 'faster' },
      { id: 'c', text: 'fastest' },
      { id: 'd', text: 'more faster' }
    ],
    correct_option_id: 'b',
    points: 1
  },
  // B1 Grammar
  {
    skill_type: 'GRAMMAR',
    cefr_level: 'B1',
    question_text: 'I have been living in London ______ three years now.',
    options: [
      { id: 'a', text: 'since' },
      { id: 'b', text: 'for' },
      { id: 'c', text: 'during' },
      { id: 'd', text: 'while' }
    ],
    correct_option_id: 'b',
    points: 2
  },
  {
    skill_type: 'GRAMMAR',
    cefr_level: 'B1',
    question_text: 'If I ______ enough money, I would travel around the world.',
    options: [
      { id: 'a', text: 'have' },
      { id: 'b', text: 'had' },
      { id: 'c', text: 'would have' },
      { id: 'd', text: 'had had' }
    ],
    correct_option_id: 'b',
    points: 2
  },
  // B2 Grammar
  {
    skill_type: 'GRAMMAR',
    cefr_level: 'B2',
    question_text: 'By the time the manager arrived, the team ______ the presentation.',
    options: [
      { id: 'a', text: 'already finished' },
      { id: 'b', text: 'had already finished' },
      { id: 'c', text: 'has already finished' },
      { id: 'd', text: 'was already finished' }
    ],
    correct_option_id: 'b',
    points: 2
  },
  {
    skill_type: 'GRAMMAR',
    cefr_level: 'B2',
    question_text: 'The suspect denied ______ anywhere near the bank on Friday evening.',
    options: [
      { id: 'a', text: 'to be' },
      { id: 'b', text: 'having been' },
      { id: 'c', text: 'be' },
      { id: 'd', text: 'to have been' }
    ],
    correct_option_id: 'b',
    points: 2
  },
  // C1 Grammar
  {
    skill_type: 'GRAMMAR',
    cefr_level: 'C1',
    question_text: 'Rarely ______ such a passionate speech in favor of educational equality.',
    options: [
      { id: 'a', text: 'I have heard' },
      { id: 'b', text: 'have I heard' },
      { id: 'c', text: 'did I heard' },
      { id: 'd', text: 'I had heard' }
    ],
    correct_option_id: 'b',
    points: 3
  },
  {
    skill_type: 'GRAMMAR',
    cefr_level: 'C1',
    question_text: 'Had we known about the transit strike, we ______ an alternative route.',
    options: [
      { id: 'a', text: 'would take' },
      { id: 'b', text: 'had taken' },
      { id: 'c', text: 'would have taken' },
      { id: 'd', text: 'will have taken' }
    ],
    correct_option_id: 'c',
    points: 3
  },
  // C2 Grammar
  {
    skill_type: 'GRAMMAR',
    cefr_level: 'C2',
    question_text: 'Be that as it ______, we cannot overlook the compliance breach.',
    options: [
      { id: 'a', text: 'is' },
      { id: 'b', text: 'may' },
      { id: 'c', text: 'might' },
      { id: 'd', text: 'will' }
    ],
    correct_option_id: 'b',
    points: 3
  },

  // ==================== VOCABULARY ====================
  // A1 Vocabulary
  {
    skill_type: 'VOCABULARY',
    cefr_level: 'A1',
    question_text: 'Which word means the opposite of "expensive"?',
    options: [
      { id: 'a', text: 'Fast' },
      { id: 'b', text: 'Cheap' },
      { id: 'c', text: 'Heavy' },
      { id: 'd', text: 'Warm' }
    ],
    correct_option_id: 'b',
    points: 1
  },
  // A2 Vocabulary
  {
    skill_type: 'VOCABULARY',
    cefr_level: 'A2',
    question_text: 'I need to make an ______ with the dentist for tomorrow morning.',
    options: [
      { id: 'a', text: 'interview' },
      { id: 'b', text: 'appointment' },
      { id: 'c', text: 'invitation' },
      { id: 'd', text: 'assignment' }
    ],
    correct_option_id: 'b',
    points: 1
  },
  // B1 Vocabulary
  {
    skill_type: 'VOCABULARY',
    cefr_level: 'B1',
    question_text: 'She managed to ______ her fear of public speaking after joining the course.',
    options: [
      { id: 'a', text: 'overlook' },
      { id: 'b', text: 'overcome' },
      { id: 'c', text: 'overtake' },
      { id: 'd', text: 'overdue' }
    ],
    correct_option_id: 'b',
    points: 2
  },
  // B2 Vocabulary
  {
    skill_type: 'VOCABULARY',
    cefr_level: 'B2',
    question_text: 'The company launched an aggressive marketing campaign to expand its market ______.',
    options: [
      { id: 'a', text: 'share' },
      { id: 'b', text: 'portion' },
      { id: 'c', text: 'stock' },
      { id: 'd', text: 'fraction' }
    ],
    correct_option_id: 'a',
    points: 2
  },
  {
    skill_type: 'VOCABULARY',
    cefr_level: 'B2',
    question_text: 'We had to call ______ the outdoor workshop due to the torrential rain.',
    options: [
      { id: 'a', text: 'out' },
      { id: 'b', text: 'off' },
      { id: 'c', text: 'up' },
      { id: 'd', text: 'in' }
    ],
    correct_option_id: 'b',
    points: 2
  },
  // C1 Vocabulary
  {
    skill_type: 'VOCABULARY',
    cefr_level: 'C1',
    question_text: 'The professor gave a very ______ and detailed explanation of linguistic evolution.',
    options: [
      { id: 'a', text: 'lucid' },
      { id: 'b', text: 'opaque' },
      { id: 'c', text: 'trivial' },
      { id: 'd', text: 'sluggish' }
    ],
    correct_option_id: 'a',
    points: 3
  },
  // C2 Vocabulary
  {
    skill_type: 'VOCABULARY',
    cefr_level: 'C2',
    question_text: 'His subtle arguments helped ______ the fierce tensions between the negotiating parties.',
    options: [
      { id: 'a', text: 'exacerbate' },
      { id: 'b', text: 'assuage' },
      { id: 'c', text: 'instigate' },
      { id: 'd', text: 'foment' }
    ],
    correct_option_id: 'b',
    points: 3
  },

  // ==================== READING ====================
  // A1/A2 Reading
  {
    skill_type: 'READING',
    cefr_level: 'A2',
    context_text: `From: Sophie Laurent <sophie@openthegate.com>
To: All Students
Subject: Library Opening Hours during Exam Week

Dear Students,
Please note that from Monday May 12th to Friday May 16th, the language resource library will open from 8:00 AM to 9:00 PM instead of our usual 6:00 PM closing time. On Saturday, we remain open from 9:00 AM to 1:00 PM. Don't forget your student badges at the entrance.`,
    question_text: 'What is the main change announced in the email?',
    options: [
      { id: 'a', text: 'The library will be closed on Saturday.' },
      { id: 'b', text: 'The library will close three hours later on weekdays.' },
      { id: 'c', text: 'Students do not need badges this week.' },
      { id: 'd', text: 'Opening hours on weekdays will be reduced.' }
    ],
    correct_option_id: 'b',
    points: 2
  },
  // B1 Reading
  {
    skill_type: 'READING',
    cefr_level: 'B1',
    context_text: `Remote work has significantly transformed how international teams collaborate. While video conferencing and instant messaging tools allow seamless coordination across time zones, research reveals that establishing informal social connections remains a challenge. Companies that deliberately schedule "virtual coffee breaks" report up to 35% higher employee satisfaction and reduced feelings of isolation among overseas staff.`,
    question_text: 'According to the passage, what is an effective way companies reduce isolation in remote teams?',
    options: [
      { id: 'a', text: 'Replacing instant messaging with daily phone calls' },
      { id: 'b', text: 'Organizing informal virtual social moments' },
      { id: 'c', text: 'Eliminating time zone differences' },
      { id: 'd', text: 'Reducing the frequency of team meetings' }
    ],
    correct_option_id: 'b',
    points: 2
  },
  // B2 Reading
  {
    skill_type: 'READING',
    cefr_level: 'B2',
    context_text: `Microlearning—the practice of delivering educational content in small, focused bursts lasting 3 to 7 minutes—is rapidly gaining traction in corporate language training. Traditional lengthy seminars often suffer from the "forgetting curve", where participants lose up to 70% of new information within 48 hours unless applied. In contrast, bite-sized modules combined with spaced repetition algorithms improve long-term retention by 40% and accommodate hectic executive schedules.`,
    question_text: 'Why does microlearning lead to better long-term retention compared to traditional seminars?',
    options: [
      { id: 'a', text: 'It completely eliminates the need for repetition.' },
      { id: 'b', text: 'It counters the forgetting curve through compact content and spaced practice.' },
      { id: 'c', text: 'It requires participants to attend longer weekend sessions.' },
      { id: 'd', text: 'It avoids focusing on practical corporate terminology.' }
    ],
    correct_option_id: 'b',
    points: 3
  },
  // C1 Reading
  {
    skill_type: 'READING',
    cefr_level: 'C1',
    context_text: `The pervasive notion that multilingualism induces cognitive fatigue has been thoroughly dismantled by neuroimaging studies over the past decade. Far from overloading executive function, the continuous subconscious arbitration between linguistic systems fortifies cognitive reserve. Bilingual individuals routinely exhibit heightened attentional control and greater resilience against neurodegenerative decline, though the precise inflection point where neurological adaptation translates into measurable career advantages remains fiercely debated.`,
    question_text: 'What does the author suggest regarding bilingualism and cognitive health?',
    options: [
      { id: 'a', text: 'Switching between languages strains cognitive capacity over time.' },
      { id: 'b', text: 'Arbitrating between languages actively strengthens neural reserve and resilience.' },
      { id: 'c', text: 'The career benefits of multilingualism have been conclusively established.' },
      { id: 'd', text: 'Cognitive fatigue is a permanent consequence of language learning.' }
    ],
    correct_option_id: 'b',
    points: 3
  },

  // ==================== LISTENING ====================
  // A1/A2 Listening
  {
    skill_type: 'LISTENING',
    cefr_level: 'A2',
    audio_text: 'Attention passengers on Flight BA340 to London Heathrow. The departure gate has been moved from Gate 12 to Gate 24. Boarding will commence at 3:15 PM. Please have your boarding passes ready.',
    question_text: 'Where should passengers for Flight BA340 now go to board the plane?',
    options: [
      { id: 'a', text: 'Gate 12 at 3:15 PM' },
      { id: 'b', text: 'Gate 24 at 3:15 PM' },
      { id: 'c', text: 'Gate 24 at 4:00 PM' },
      { id: 'd', text: 'Gate 14 immediately' }
    ],
    correct_option_id: 'b',
    points: 2
  },
  // B1 Listening
  {
    skill_type: 'LISTENING',
    cefr_level: 'B1',
    audio_text: 'Hi David! It\'s Sarah from the marketing department. I reviewed the draft for the new brochure. The visuals look fantastic, but we should double-check the client testimonials on page 4 before sending it to the printer on Thursday. Could you call me back when you get a chance?',
    question_text: 'What does Sarah want David to verify before printing the brochure?',
    options: [
      { id: 'a', text: 'The cover design visuals' },
      { id: 'b', text: 'The client testimonials on page 4' },
      { id: 'c', text: 'The printer delivery address' },
      { id: 'd', text: 'The overall project budget' }
    ],
    correct_option_id: 'b',
    points: 2
  },
  // B2 Listening
  {
    skill_type: 'LISTENING',
    cefr_level: 'B2',
    audio_text: 'In today’s quarterly town hall, the leadership team highlighted that our international customer acquisition cost dropped by 18 percent following the rollout of localized bilingual support in our European hubs. However, customer churn in North America ticked up slightly, prompting a strategic review of our onboarding workflows next month.',
    question_text: 'What positive outcome followed the introduction of localized bilingual support?',
    options: [
      { id: 'a', text: 'North American churn was completely resolved.' },
      { id: 'b', text: 'International customer acquisition cost decreased by 18%.' },
      { id: 'c', text: 'Onboarding workflows were eliminated.' },
      { id: 'd', text: 'Leadership reduced European headcount.' }
    ],
    correct_option_id: 'b',
    points: 3
  },
  // C1 Listening
  {
    skill_type: 'LISTENING',
    cefr_level: 'C1',
    audio_text: 'While the preliminary macroeconomic indicators point towards a transient stabilization of bond yields, central bankers maintain an overtly cautious stance. Any premature easing of liquidity could inadvertently reignite core inflationary pressures, particularly given the persistent supply bottlenecks in specialized semiconductors.',
    question_text: 'Why are central bankers maintaining a cautious stance despite stabilizing yields?',
    options: [
      { id: 'a', text: 'Because semiconductor supplies have reached historic surpluses.' },
      { id: 'b', text: 'To avoid prematurely reigniting core inflationary pressures.' },
      { id: 'c', text: 'Because bond yields have dropped to zero.' },
      { id: 'd', text: 'In order to curb international banking transactions.' }
    ],
    correct_option_id: 'b',
    points: 3
  }
];

async function seedDatabase() {
  const countRow = await dbGet(`SELECT COUNT(*) as count FROM questions`);
  if (countRow && countRow.count > 0) {
    console.log(`ℹ️ Question bank already populated (${countRow.count} questions).`);
    return;
  }

  console.log('🌱 Seeding initial question bank...');
  for (const q of sampleQuestions) {
    const id = uuidv4();
    await dbRun(
      `INSERT INTO questions (id, skill_type, cefr_level, question_text, context_text, media_url, audio_text, options, correct_option_id, points, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        q.skill_type,
        q.cefr_level,
        q.question_text,
        q.context_text || null,
        q.media_url || null,
        q.audio_text || null,
        JSON.stringify(q.options),
        q.correct_option_id,
        q.points || 1,
        1
      ]
    );
  }
  console.log(`✅ Seeded ${sampleQuestions.length} comprehensive questions for all CEFR levels.`);
}

module.exports = {
  seedDatabase,
  sampleQuestions
};
