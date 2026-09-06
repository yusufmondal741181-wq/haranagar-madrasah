const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');
require('dotenv').config();

const dbPath = path.join(__dirname, 'madrasah.sqlite');
const db = new Database(dbPath);

// Enable Foreign Keys & WAL mode for performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Initialize Tables
function initDatabase() {
  // 1. Users / Staff Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('SUPER_ADMIN', 'STAFF')) NOT NULL DEFAULT 'STAFF',
      status TEXT CHECK(status IN ('ACTIVE', 'DISABLED')) NOT NULL DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Students Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      father_name TEXT NOT NULL,
      mother_name TEXT,
      guardian_name TEXT,
      date_of_birth TEXT NOT NULL,
      gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')) NOT NULL,
      class TEXT NOT NULL,
      section TEXT NOT NULL,
      roll_number INTEGER NOT NULL,
      admission_number TEXT UNIQUE NOT NULL,
      admission_date TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      academic_session TEXT NOT NULL,
      photo TEXT,
      status TEXT CHECK(status IN ('Active', 'Inactive', 'Passed', 'Transferred')) NOT NULL DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Notices Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      attachment TEXT,
      attachment_original_name TEXT,
      publish_date TEXT NOT NULL,
      published INTEGER DEFAULT 1,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // 4. Documents Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT CHECK(category IN (
        'Academic Documents', 
        'Admission Documents', 
        'Examination Documents', 
        'Administrative Documents', 
        'Forms', 
        'Other Documents'
      )) NOT NULL,
      description TEXT,
      academic_session TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      is_public INTEGER DEFAULT 1,
      uploaded_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // 5. Activity Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_name TEXT,
      action TEXT NOT NULL,
      description TEXT NOT NULL,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Institutional Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Upload Folders if they do not exist
  const dirs = [
    path.join(__dirname, '../uploads/public/photos'),
    path.join(__dirname, '../uploads/public/attachments'),
    path.join(__dirname, '../uploads/public/documents'),
    path.join(__dirname, '../uploads/private')
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Seed Default Settings
  const defaultSettings = [
    ['institution_name', 'Haranagar Chandipur Senior Madrasah'],
    ['established_year', '1966'],
    ['address', 'Haranagar, Chandipur, West Bengal, India'],
    ['phone', '+91 98765 43210'],
    ['email', 'info@haranagarmadrasah.edu'],
    ['about_text', 'Haranagar Chandipur Senior Madrasah was established in the landmark year of 1966 with an enduring mission to provide exemplary value-based education, intellectual enlightenment, and community empowerment. For over five decades, the institution has nurtured students with high moral grounding and academic excellence.'],
    ['head_message', 'Welcome to Haranagar Chandipur Senior Madrasah. Since 1966, our sanctuary of learning has dedicated itself to holistic development, discipline, and intellectual advancement. We welcome all parents, students, and well-wishers to participate in our ongoing journey of academic and spiritual distinction.'],
    ['footer_text', '© 1966 - 2026 Haranagar Chandipur Senior Madrasah. All Rights Reserved.']
  ];

  const insertSetting = db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`);
  defaultSettings.forEach(([k, v]) => insertSetting.run(k, v));

  // Seed Super Admin if none exists
  const checkAdmin = db.prepare(`SELECT id FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1`).get();
  if (!checkAdmin) {
    const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@haranagarmadrasah.edu';
    const rawPass = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@1966Secure!';
    const name = process.env.INITIAL_ADMIN_NAME || 'Head Administrator';
    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(rawPass, salt);

    db.prepare(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES (?, ?, ?, 'SUPER_ADMIN', 'ACTIVE')
    `).run(name, email, hash);

    console.log(`[DB INIT] Default Super Admin created: ${email}`);
  }
}

initDatabase();

module.exports = db;