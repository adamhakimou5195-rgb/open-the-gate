const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'openthegate.db');
const db = new sqlite3.Database(dbPath);

// Helper promise methods
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function initDB() {
  await dbRun(`PRAGMA foreign_keys = ON;`);

  // Users table
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

  // Questions table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      skill_type TEXT CHECK(skill_type IN ('GRAMMAR', 'VOCABULARY', 'READING', 'LISTENING')) NOT NULL,
      cefr_level TEXT CHECK(cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')) NOT NULL,
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

  // Test Sessions table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS test_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      status TEXT CHECK(status IN ('IN_PROGRESS', 'COMPLETED', 'EXPIRED')) DEFAULT 'IN_PROGRESS',
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      total_score INTEGER DEFAULT 0,
      assigned_cefr_level TEXT,
      skill_scores TEXT,
      certificate_id TEXT,
      certificate_url TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // User Answers table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS user_answers (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      selected_option_id TEXT,
      is_correct INTEGER DEFAULT 0,
      answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES test_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );
  `);

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
  db,
  dbRun,
  dbGet,
  dbAll,
  initDB
};
