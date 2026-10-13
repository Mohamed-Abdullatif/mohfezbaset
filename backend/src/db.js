const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(process.env.DB_PATH || './database.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    surah_number INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    surah_number INTEGER NOT NULL,
    memorized_ayahs INTEGER DEFAULT 0,
    total_ayahs INTEGER NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, surah_number),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    surah_number INTEGER NOT NULL,
    reciter TEXT NOT NULL,
    downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, surah_number, reciter),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

/* Safe migrations */
try { db.exec(`ALTER TABLE users ADD COLUMN avatar TEXT`); } catch {}
try { db.exec(`ALTER TABLE users ADD COLUMN google_id TEXT`); } catch {}

/* Reading position, daily goal & daily activity */
db.exec(`
  CREATE TABLE IF NOT EXISTS user_prefs (
    user_id INTEGER PRIMARY KEY,
    last_page INTEGER DEFAULT 1,
    daily_goal INTEGER DEFAULT 5,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS daily_log (
    user_id INTEGER NOT NULL,
    day TEXT NOT NULL,
    ayahs INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, day),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

/* Visitor stats */
db.exec(`
  CREATE TABLE IF NOT EXISTS site_stats (
    key   TEXT PRIMARY KEY,
    value INTEGER DEFAULT 0
  );
  INSERT OR IGNORE INTO site_stats (key, value) VALUES ('visitors', 0);
`);

module.exports = db;
