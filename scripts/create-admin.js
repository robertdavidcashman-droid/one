// Script to create admin user with provided credentials
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'data', 'web44ai.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize database tables (including users table)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function createAdmin() {
  const username = 'Cashman100';
  const password = 'Bristol120566!';
  
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    stmt.run(username, passwordHash);
    console.log(`✓ Admin user "${username}" created successfully!`);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      const passwordHash = await bcrypt.hash(password, 10);
      const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE username = ?');
      stmt.run(passwordHash, username);
      console.log(`✓ Admin user "${username}" password updated successfully!`);
    } else {
      console.error('Error:', error);
    }
  } finally {
    db.close();
  }
}

createAdmin();

