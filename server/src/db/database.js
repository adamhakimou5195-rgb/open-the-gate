const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const jsonDbPath = path.join(dbDir, 'openthegate_store.json');

// In-Memory Data Store with JSON Persistence
class JsonDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {
      users: [],
      questions: [],
      test_sessions: [],
      user_answers: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (e) {
      console.warn('Initializing fresh JSON data store:', e.message);
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving data store:', e);
    }
  }
}

const memoryDb = new JsonDatabase(jsonDbPath);

let useSqlite = false;
let sqliteDb = null;

try {
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(dbDir, 'openthegate.db');
  sqliteDb = new sqlite3.Database(dbPath);
  useSqlite = true;
  console.log('📦 Using native SQLite engine.');
} catch (err) {
  console.log('ℹ️ Native SQLite not available (GLIBC mismatch or serverless environment). Using Pure-JS zero-dependency storage engine.');
  useSqlite = false;
}

// Helper methods for SQLite
const sqliteRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const sqliteGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const sqliteAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Pure-JS query interpreter for robust cloud compatibility
async function pureJsRun(sql, params = []) {
  const trimmed = sql.trim();
  const upper = trimmed.toUpperCase();

  if (upper.startsWith('CREATE') || upper.startsWith('PRAGMA')) {
    return { changes: 0 };
  }

  // INSERT INTO users (...) VALUES (...)
  if (upper.startsWith('INSERT INTO USERS')) {
    const user = {
      id: params[0],
      full_name: params[1],
      email: params[2],
      phone: params[3],
      role: params[4] || 'STUDENT',
      password_hash: params[5] || null,
      learning_goal: params[6] || null,
      created_at: new Date().toISOString()
    };
    memoryDb.data.users.push(user);
    memoryDb.save();
    return { changes: 1 };
  }

  // INSERT INTO questions (...)
  if (upper.startsWith('INSERT INTO QUESTIONS')) {
    const q = {
      id: params[0],
      skill_type: params[1],
      cefr_level: params[2],
      question_text: params[3],
      context_text: params[4] || null,
      media_url: params[5] || null,
      audio_text: params[6] || null,
      options: params[7],
      correct_option_id: params[8],
      points: params[9] || 1,
      is_active: params[10] !== undefined ? params[10] : 1,
      created_at: new Date().toISOString()
    };
    memoryDb.data.questions.push(q);
    memoryDb.save();
    return { changes: 1 };
  }

  // INSERT INTO test_sessions (...)
  if (upper.startsWith('INSERT INTO TEST_SESSIONS')) {
    const session = {
      id: params[0],
      user_id: params[1],
      status: 'IN_PROGRESS',
      started_at: new Date().toISOString(),
      completed_at: null,
      total_score: 0,
      assigned_cefr_level: null,
      skill_scores: null,
      certificate_id: null,
      certificate_url: null
    };
    memoryDb.data.test_sessions.push(session);
    memoryDb.save();
    return { changes: 1 };
  }

  // INSERT INTO user_answers (...)
  if (upper.startsWith('INSERT INTO USER_ANSWERS')) {
    const ans = {
      id: params[0],
      session_id: params[1],
      question_id: params[2],
      selected_option_id: params[3],
      is_correct: params[4] || 0,
      answered_at: new Date().toISOString()
    };
    memoryDb.data.user_answers.push(ans);
    memoryDb.save();
    return { changes: 1 };
  }

  // UPDATE users SET full_name = ?, phone = ?, learning_goal = ? WHERE id = ?
  if (upper.startsWith('UPDATE USERS')) {
    const idx = memoryDb.data.users.findIndex(u => u.id === params[3]);
    if (idx !== -1) {
      memoryDb.data.users[idx].full_name = params[0];
      memoryDb.data.users[idx].phone = params[1];
      memoryDb.data.users[idx].learning_goal = params[2];
      memoryDb.save();
    }
    return { changes: 1 };
  }

  // UPDATE user_answers SET selected_option_id = ?, is_correct = ?, answered_at = ... WHERE id = ?
  if (upper.startsWith('UPDATE USER_ANSWERS')) {
    const idx = memoryDb.data.user_answers.findIndex(a => a.id === params[2]);
    if (idx !== -1) {
      memoryDb.data.user_answers[idx].selected_option_id = params[0];
      memoryDb.data.user_answers[idx].is_correct = params[1];
      memoryDb.data.user_answers[idx].answered_at = new Date().toISOString();
      memoryDb.save();
    }
    return { changes: 1 };
  }

  // UPDATE test_sessions SET status = 'COMPLETED', completed_at = ..., total_score = ?, assigned_cefr_level = ?, skill_scores = ?, certificate_id = ?, certificate_url = ? WHERE id = ?
  if (upper.startsWith('UPDATE TEST_SESSIONS')) {
    const idx = memoryDb.data.test_sessions.findIndex(s => s.id === params[5]);
    if (idx !== -1) {
      memoryDb.data.test_sessions[idx].status = 'COMPLETED';
      memoryDb.data.test_sessions[idx].completed_at = new Date().toISOString();
      memoryDb.data.test_sessions[idx].total_score = params[0];
      memoryDb.data.test_sessions[idx].assigned_cefr_level = params[1];
      memoryDb.data.test_sessions[idx].skill_scores = params[2];
      memoryDb.data.test_sessions[idx].certificate_id = params[3];
      memoryDb.data.test_sessions[idx].certificate_url = params[4];
      memoryDb.save();
    }
    return { changes: 1 };
  }

  // UPDATE questions SET skill_type = ?, cefr_level = ?, question_text = ?, context_text = ?, media_url = ?, audio_text = ?, options = ?, correct_option_id = ?, points = ?, is_active = ? WHERE id = ?
  if (upper.startsWith('UPDATE QUESTIONS')) {
    const idx = memoryDb.data.questions.findIndex(q => q.id === params[10]);
    if (idx !== -1) {
      memoryDb.data.questions[idx] = {
        ...memoryDb.data.questions[idx],
        skill_type: params[0],
        cefr_level: params[1],
        question_text: params[2],
        context_text: params[3],
        media_url: params[4],
        audio_text: params[5],
        options: params[6],
        correct_option_id: params[7],
        points: params[8],
        is_active: params[9]
      };
      memoryDb.save();
    }
    return { changes: 1 };
  }

  // DELETE FROM questions WHERE id = ?
  if (upper.startsWith('DELETE FROM QUESTIONS')) {
    memoryDb.data.questions = memoryDb.data.questions.filter(q => q.id !== params[0]);
    memoryDb.save();
    return { changes: 1 };
  }

  return { changes: 0 };
}

async function pureJsGet(sql, params = []) {
  const rows = await pureJsAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

async function pureJsAll(sql, params = []) {
  const upper = sql.trim().toUpperCase();

  // SELECT COUNT(*) as count FROM questions
  if (upper.includes('SELECT COUNT(*) AS COUNT FROM QUESTIONS')) {
    return [{ count: memoryDb.data.questions.length }];
  }

  // SELECT COUNT(*) as total FROM test_sessions
  if (upper.includes('SELECT COUNT(*) AS TOTAL FROM TEST_SESSIONS')) {
    if (upper.includes("STATUS = 'COMPLETED'")) {
      const count = memoryDb.data.test_sessions.filter(s => s.status === 'COMPLETED').length;
      return [{ total: count }];
    }
    return [{ total: memoryDb.data.test_sessions.length }];
  }

  // SELECT COUNT(*) as total FROM users WHERE role = 'STUDENT'
  if (upper.includes('SELECT COUNT(*) AS TOTAL FROM USERS')) {
    const count = memoryDb.data.users.filter(u => u.role === 'STUDENT').length;
    return [{ total: count }];
  }

  // SELECT AVG(total_score) as avgScore FROM test_sessions WHERE status = 'COMPLETED'
  if (upper.includes('AVG(TOTAL_SCORE)')) {
    const completed = memoryDb.data.test_sessions.filter(s => s.status === 'COMPLETED');
    if (completed.length === 0) return [{ avgScore: 0 }];
    const sum = completed.reduce((acc, curr) => acc + (curr.total_score || 0), 0);
    return [{ avgScore: sum / completed.length }];
  }

  // SELECT assigned_cefr_level, COUNT(*) as count FROM test_sessions ... GROUP BY assigned_cefr_level
  if (upper.includes('GROUP BY ASSIGNED_CEFR_LEVEL')) {
    const counts = {};
    memoryDb.data.test_sessions
      .filter(s => s.status === 'COMPLETED' && s.assigned_cefr_level)
      .forEach(s => {
        counts[s.assigned_cefr_level] = (counts[s.assigned_cefr_level] || 0) + 1;
      });
    return Object.entries(counts).map(([assigned_cefr_level, count]) => ({ assigned_cefr_level, count }));
  }

  // SELECT * FROM users WHERE role = 'ADMIN'
  if (upper.includes('FROM USERS WHERE ROLE = \'ADMIN\'')) {
    return memoryDb.data.users.filter(u => u.role === 'ADMIN');
  }

  // SELECT * FROM users WHERE email = ? AND role = 'STUDENT'
  if (upper.includes('FROM USERS WHERE EMAIL = ? AND ROLE = \'STUDENT\'')) {
    return memoryDb.data.users.filter(u => u.email === params[0] && u.role === 'STUDENT');
  }

  // SELECT * FROM users WHERE email = ? AND role = 'ADMIN'
  if (upper.includes('FROM USERS WHERE EMAIL = ? AND ROLE = \'ADMIN\'')) {
    return memoryDb.data.users.filter(u => u.email === params[0] && u.role === 'ADMIN');
  }

  // SELECT * FROM users WHERE id = ?
  if (upper.includes('FROM USERS WHERE ID = ?')) {
    return memoryDb.data.users.filter(u => u.id === params[0]);
  }

  // SELECT * FROM questions WHERE is_active = 1
  if (upper.includes('FROM QUESTIONS WHERE IS_ACTIVE = 1')) {
    return memoryDb.data.questions.filter(q => q.is_active === 1);
  }

  // SELECT * FROM questions WHERE id = ?
  if (upper.includes('FROM QUESTIONS WHERE ID = ?')) {
    return memoryDb.data.questions.filter(q => q.id === params[0]);
  }

  // Questions query with filters
  if (upper.startsWith('SELECT * FROM QUESTIONS')) {
    let res = [...memoryDb.data.questions];
    let pIdx = 0;
    if (upper.includes('SKILL_TYPE = ?')) {
      res = res.filter(q => q.skill_type === params[pIdx++]);
    }
    if (upper.includes('CEFR_LEVEL = ?')) {
      res = res.filter(q => q.cefr_level === params[pIdx++]);
    }
    return res;
  }

  // SELECT * FROM test_sessions WHERE id = ?
  if (upper.includes('FROM TEST_SESSIONS WHERE ID = ?')) {
    return memoryDb.data.test_sessions.filter(s => s.id === params[0]);
  }

  // SELECT * FROM user_answers WHERE session_id = ? AND question_id = ?
  if (upper.includes('FROM USER_ANSWERS WHERE SESSION_ID = ? AND QUESTION_ID = ?')) {
    return memoryDb.data.user_answers.filter(a => a.session_id === params[0] && a.question_id === params[1]);
  }

  // SELECT ua.*, q.skill_type, q.cefr_level, q.points, q.question_text FROM user_answers ua JOIN questions q
  if (upper.includes('FROM USER_ANSWERS UA') && upper.includes('JOIN QUESTIONS Q')) {
    const sessionId = params[0];
    const answers = memoryDb.data.user_answers.filter(a => a.session_id === sessionId);
    return answers.map(a => {
      const q = memoryDb.data.questions.find(item => item.id === a.question_id) || {};
      return {
        ...a,
        skill_type: q.skill_type,
        cefr_level: q.cefr_level,
        points: q.points,
        question_text: q.question_text
      };
    });
  }

  // Admin Sessions Query (JOIN test_sessions and users)
  if (upper.includes('FROM TEST_SESSIONS TS') && upper.includes('JOIN USERS U')) {
    const joined = memoryDb.data.test_sessions.map(s => {
      const user = memoryDb.data.users.find(u => u.id === s.user_id) || {};
      return {
        id: s.id,
        status: s.status,
        started_at: s.started_at,
        completed_at: s.completed_at,
        total_score: s.total_score,
        assigned_cefr_level: s.assigned_cefr_level,
        skill_scores: s.skill_scores,
        certificate_id: s.certificate_id,
        certificate_url: s.certificate_url,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        learning_goal: user.learning_goal
      };
    });

    let res = [...joined];
    let pIdx = 0;
    if (upper.includes('TS.ASSIGNED_CEFR_LEVEL = ?')) {
      res = res.filter(s => s.assigned_cefr_level === params[pIdx++]);
    }
    if (upper.includes('U.FULL_NAME LIKE ?')) {
      const search = (params[pIdx] || '').replace(/%/g, '').toLowerCase();
      res = res.filter(s => 
        (s.full_name && s.full_name.toLowerCase().includes(search)) ||
        (s.email && s.email.toLowerCase().includes(search)) ||
        (s.phone && s.phone.includes(search))
      );
    }

    return res.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
  }

  return [];
}

const dbRun = (sql, params = []) => useSqlite ? sqliteRun(sql, params) : pureJsRun(sql, params);
const dbGet = (sql, params = []) => useSqlite ? sqliteGet(sql, params) : pureJsGet(sql, params);
const dbAll = (sql, params = []) => useSqlite ? sqliteAll(sql, params) : pureJsAll(sql, params);

async function initDB() {
  if (useSqlite) {
    await dbRun(`PRAGMA foreign_keys = ON;`);
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        role TEXT CHECK(role IN ('ADMIN', 'STUDENT')) DEFAULT 'STUDENT',
        password_hash TEXT,
        learning_goal TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await dbRun(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        skill_type TEXT NOT NULL,
        cefr_level TEXT NOT NULL,
        question_text TEXT NOT NULL,
        context_text TEXT,
        media_url TEXT,
        audio_text TEXT,
        options TEXT NOT NULL,
        correct_option_id TEXT NOT NULL,
        points INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await dbRun(`
      CREATE TABLE IF NOT EXISTS test_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        status TEXT DEFAULT 'IN_PROGRESS',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        total_score INTEGER DEFAULT 0,
        assigned_cefr_level TEXT,
        skill_scores TEXT,
        certificate_id TEXT,
        certificate_url TEXT
      );
    `);
    await dbRun(`
      CREATE TABLE IF NOT EXISTS user_answers (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        selected_option_id TEXT,
        is_correct INTEGER DEFAULT 0,
        answered_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  // Create default admin user if missing
  const admin = await dbGet(`SELECT * FROM users WHERE role = 'ADMIN' LIMIT 1`);
  if (!admin) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('AdminGate2026!', salt);
    await dbRun(
      `INSERT INTO users (id, full_name, email, phone, role, password_hash, learning_goal)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['admin-master-id', 'Administrateur Pédagogique', 'admin@openthegate.com', '+33100000000', 'ADMIN', hash, 'Administration']
    );
    console.log('✅ Default administrator created: admin@openthegate.com / AdminGate2026!');
  }
}

module.exports = {
  dbRun,
  dbGet,
  dbAll,
  initDB
};
