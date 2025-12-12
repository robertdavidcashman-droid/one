// Migration script to add faq_content and location columns to blog_posts
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'data', 'web44ai.db');

if (!fs.existsSync(dbPath)) {
  console.log('Database does not exist yet. It will be created with the new schema on first use.');
  process.exit(0);
}

const db = new Database(dbPath);

console.log('Migrating database schema...');

try {
  // Check if columns exist
  const tableInfo = db.prepare("PRAGMA table_info(blog_posts)").all();
  const columnNames = tableInfo.map(col => col.name);
  
  if (!columnNames.includes('faq_content')) {
    db.exec('ALTER TABLE blog_posts ADD COLUMN faq_content TEXT');
    console.log('✓ Added faq_content column');
  } else {
    console.log('✓ faq_content column already exists');
  }
  
  if (!columnNames.includes('location')) {
    db.exec('ALTER TABLE blog_posts ADD COLUMN location TEXT DEFAULT "Kent"');
    console.log('✓ Added location column');
  } else {
    console.log('✓ location column already exists');
  }
  
  console.log('\nMigration complete!');
} catch (error) {
  console.error('Migration error:', error.message);
  process.exit(1);
} finally {
  db.close();
}

