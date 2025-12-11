// Script to create initial admin user
// Run with: node scripts/init-admin.js

const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const dbPath = path.join(process.cwd(), 'data', 'web44ai.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter admin username: ', (username) => {
  rl.question('Enter admin password: ', async (password) => {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
      stmt.run(username, passwordHash);
      console.log('Admin user created successfully!');
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        console.log('User already exists. Update password? (y/n)');
        rl.question('', async (answer) => {
          if (answer.toLowerCase() === 'y') {
            const passwordHash = await bcrypt.hash(password, 10);
            const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE username = ?');
            stmt.run(passwordHash, username);
            console.log('Password updated successfully!');
          }
          db.close();
          rl.close();
        });
      } else {
        console.error('Error:', error);
        db.close();
        rl.close();
      }
    } finally {
      if (!rl.closed) {
        db.close();
        rl.close();
      }
    }
  });
});

