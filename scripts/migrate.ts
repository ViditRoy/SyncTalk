import sqlite3 from 'sqlite3';
import { promisify } from 'util';

// Create database connection
const db = new sqlite3.Database('synctalk.db');

// Promisify for async/await
const dbRun = promisify(db.run.bind(db));
const dbClose = promisify(db.close.bind(db));

async function createTables() {
  try {
    // Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    // Sessions table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // User settings table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        notifications INTEGER DEFAULT 1,
        sound_enabled INTEGER DEFAULT 1,
        status TEXT DEFAULT 'online',
        private_messages TEXT DEFAULT 'all',
        read_receipts INTEGER DEFAULT 1,
        last_activity_visible INTEGER DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Conversations table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        members TEXT NOT NULL, -- JSON array
        is_direct INTEGER DEFAULT 0,
        recipient_id TEXT
      )
    `);

    // Messages table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        sender_username TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        status TEXT DEFAULT 'sent',
        read_by TEXT DEFAULT '[]', -- JSON array
        FOREIGN KEY (conversation_id) REFERENCES conversations (id),
        FOREIGN KEY (sender_id) REFERENCES users (id)
      )
    `);

    console.log('Database tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await dbClose();
  }
}

createTables();