import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';

const dbPath = process.env.DB_PATH || './data/train_records.db';
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trip_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_number TEXT NOT NULL,
      train_type TEXT NOT NULL CHECK(train_type IN ('复兴号', '和谐号', '绿皮车', '其他')),
      departure_station TEXT NOT NULL,
      arrival_station TEXT NOT NULL,
      trip_date DATE NOT NULL,
      scheduled_departure TIME NOT NULL,
      actual_arrival TIME NOT NULL,
      is_delayed BOOLEAN NOT NULL DEFAULT 0,
      delay_minutes INTEGER NOT NULL DEFAULT 0,
      seat_type TEXT NOT NULL CHECK(seat_type IN ('一等座', '二等座', '硬卧', '软卧', '硬座', '其他')),
      ticket_price DECIMAL(10,2) NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trip_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (record_id) REFERENCES trip_records(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_trip_date ON trip_records(trip_date DESC);
    CREATE INDEX IF NOT EXISTS idx_train_number ON trip_records(train_number);
  `);

  const username = process.env.APP_USERNAME || 'trainfan';
  const password = process.env.APP_PASSWORD || 'train123456';

  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (!existingUser) {
    const passwordHash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
    console.log(`Default user created: ${username}`);
  }
}

export default db;
