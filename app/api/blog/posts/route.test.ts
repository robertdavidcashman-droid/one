import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import fs from 'fs';

import { __resetBlogDbForTests } from '../../../../lib/blog';
import { GET } from './route';

const TMP_DB = '/tmp/web44ai-blog-api-test.db';

function setupDb() {
  if (fs.existsSync(TMP_DB)) fs.unlinkSync(TMP_DB);
  const db = new Database(TMP_DB);
  db.exec(`
    CREATE TABLE blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      published BOOLEAN DEFAULT 0,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      meta_title TEXT,
      meta_description TEXT,
      image TEXT,
      schema_json TEXT
    );
  `);
  db.prepare(
    `INSERT INTO blog_posts (title, slug, content, published, published_at, image)
     VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, ?)`
  ).run('API Post', 'api-post', '<p>Hello</p>', '/blog-images/api.png');
  db.close();
}

beforeEach(() => {
  process.env.BLOG_DB_PATH = TMP_DB;
  __resetBlogDbForTests();
  setupDb();
});

afterEach(() => {
  __resetBlogDbForTests();
  if (fs.existsSync(TMP_DB)) fs.unlinkSync(TMP_DB);
});

describe('GET /api/blog/posts', () => {
  test('returns published posts from database', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.source).toBe('database');
    expect(json.total).toBe(1);
    expect(json.posts[0].slug).toBe('api-post');
    expect(json.posts[0].image).toBe('/blog-images/api.png');
  });
});

