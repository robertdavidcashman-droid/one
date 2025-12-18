import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import fs from 'fs';

import { __resetBlogDbForTests, getPublishedBlogPosts, getPostBySlug } from './blog';

const TMP_DB = '/tmp/web44ai-blog-test.db';

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
  return db;
}

beforeEach(() => {
  process.env.BLOG_DB_PATH = TMP_DB;
  __resetBlogDbForTests();
});

afterEach(() => {
  __resetBlogDbForTests();
  if (fs.existsSync(TMP_DB)) fs.unlinkSync(TMP_DB);
});

describe('blog image selection (stored image vs content extraction)', () => {
  test('prefers stored blog_posts.image over extractFirstImage()', () => {
    const db = setupDb();
    db.prepare(
      `INSERT INTO blog_posts (title, slug, content, published, published_at, image)
       VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, ?)`
    ).run('Hello', 'hello', '<p>No inline image</p>', '/blog-images/hello-ai-1.png');
    db.close();

    const posts = getPublishedBlogPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].image).toBe('/blog-images/hello-ai-1.png');

    const post = getPostBySlug('hello');
    expect(post?.image).toBe('/blog-images/hello-ai-1.png');
  });

  test('falls back to first <img> in content when no stored image', () => {
    const db = setupDb();
    db.prepare(
      `INSERT INTO blog_posts (title, slug, content, published, published_at, image)
       VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, NULL)`
    ).run('With Img', 'with-img', '<p>Hi</p><img src="/blog-images/in-content.png" />');
    db.close();

    const posts = getPublishedBlogPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].image).toBe('/blog-images/in-content.png');
  });
});

