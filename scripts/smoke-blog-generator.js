/**
 * Smoke test for blog DB + rendering.
 *
 * Usage (two terminals):
 * 1) Start server with a disposable DB:
 *    BLOG_DB_PATH=/tmp/web44ai-smoke.db npm run dev
 *
 * 2) In another terminal:
 *    node scripts/smoke-blog-generator.js
 *
 * This script:
 * - seeds the DB with a published post (including a stored featured image URL)
 * - verifies /api/blog/posts returns it
 * - verifies /blog/:slug returns 200
 */

const Database = require('better-sqlite3');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DB_PATH = process.env.BLOG_DB_PATH || '/tmp/web44ai-smoke.db';

async function fetchJson(url) {
  const res = await fetch(url);
  const json = await res.json();
  return { res, json };
}

async function fetchText(url) {
  const res = await fetch(url);
  const text = await res.text();
  return { res, text };
}

function seedDb() {
  const db = new Database(DB_PATH);
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

  const slug = `smoke-${Date.now()}`;
  const content = `<p>Smoke test content.</p>`;
  const image = '/blog-images/blog-listing-0.jpg'; // known public asset in this repo

  db.prepare(
    `INSERT INTO blog_posts
      (title, slug, content, excerpt, published, published_at, image, updated_at)
     VALUES
      (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP)`
  ).run('Smoke Test Post', slug, content, 'Smoke excerpt', image);

  db.close();
  return slug;
}

async function main() {
  console.log(`BASE_URL = ${BASE_URL}`);
  console.log(`BLOG_DB_PATH = ${DB_PATH}`);

  const slug = seedDb();
  console.log(`Seeded post: /blog/${slug}`);

  const api = await fetchJson(`${BASE_URL}/api/blog/posts`);
  if (api.res.status !== 200) throw new Error(`/api/blog/posts returned ${api.res.status}`);
  if (!api.json.posts || !Array.isArray(api.json.posts)) throw new Error('Invalid /api/blog/posts payload');
  const found = api.json.posts.find(p => p.slug === slug);
  if (!found) throw new Error('Seeded post not found in /api/blog/posts');

  const page = await fetchText(`${BASE_URL}/blog/${slug}`);
  if (page.res.status !== 200) throw new Error(`/blog/${slug} returned ${page.res.status}`);
  if (!page.text.includes('Smoke Test Post')) throw new Error('Blog page did not include expected title');

  console.log('✅ Smoke test passed');
}

main().catch((err) => {
  console.error('❌ Smoke test failed:', err);
  process.exit(1);
});

