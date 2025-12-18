/**
 * Seeds a published blog post into a SQLite DB for manual UI testing.
 *
 * Usage:
 *   BLOG_DB_PATH=/tmp/web44ai-manual.db node scripts/seed-test-blog-post.js
 *
 * Then start the app with the same BLOG_DB_PATH and visit:
 *   http://localhost:3000/blog/<printed-slug>
 */

const Database = require('better-sqlite3');

const DB_PATH = process.env.BLOG_DB_PATH || '/tmp/web44ai-manual.db';

function ensureSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      author_id INTEGER,
      published BOOLEAN DEFAULT 0,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      meta_title TEXT,
      meta_description TEXT,
      image TEXT,
      schema_json TEXT
    )
  `);
}

function main() {
  const db = new Database(DB_PATH);
  ensureSchema(db);

  const slug = `manual-test-${Date.now()}`;
  const title = 'Manual Test Post (Seeded)';
  const image = '/blog-images/blog-listing-0.jpg';
  const content = `
    <p>This is a seeded post for manual testing.</p>
    <p>If you can see this at <strong>/blog/${slug}</strong>, DB-driven rendering works.</p>
  `.trim();

  db.prepare(
    `INSERT INTO blog_posts
      (title, slug, content, excerpt, published, published_at, meta_title, meta_description, image, updated_at)
     VALUES
      (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, ?, ?, ?, CURRENT_TIMESTAMP)`
  ).run(
    title,
    slug,
    content,
    'Seeded post for manual testing.',
    title,
    'Seeded post for manual testing of /blog/[slug].',
    image
  );

  db.close();

  console.log(`✅ Seeded DB: ${DB_PATH}`);
  console.log(`✅ Slug: ${slug}`);
  console.log(`Next: start the app with BLOG_DB_PATH=${DB_PATH}`);
  console.log(`Then visit: http://localhost:3000/blog/${slug}`);
}

main();

