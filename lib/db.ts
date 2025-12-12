import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Lazy database initialization for serverless compatibility
let db: Database.Database | null = null;
let dbInitialized = false;

function getDatabase(): Database.Database {
  // Skip database initialization during build time (Vercel)
  // This prevents build failures - database will initialize at runtime
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    // Return a minimal mock for build time
    throw new Error('Database not available during build. Use runtime queries only.');
  }

  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'web44ai.db');
    const dbDir = path.dirname(dbPath);

    // Ensure data directory exists
    if (!fs.existsSync(dbDir)) {
      try {
        fs.mkdirSync(dbDir, { recursive: true });
      } catch (error) {
        // Directory creation may fail in serverless - use in-memory fallback
        console.warn('Could not create data directory, using in-memory database');
        db = new Database(':memory:');
        if (!dbInitialized) {
          initDatabase();
          dbInitialized = true;
        }
        return db;
      }
    }

    try {
      db = new Database(dbPath);
      // Enable foreign keys
      db.pragma('foreign_keys = ON');
    } catch (error) {
      console.error('Database initialization error:', error);
      // Fallback to in-memory database if file system is not available
      db = new Database(':memory:');
    }
  }

  if (!dbInitialized) {
    initDatabase();
    dbInitialized = true;
  }

  return db;
}

// Initialize database tables
function initDatabase() {
  if (!db) return;

  try {
    // Users table for admin authentication
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Blog posts table
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
        faq_content TEXT,
        location TEXT DEFAULT 'Kent',
        FOREIGN KEY (author_id) REFERENCES users(id)
      )
    `);
    
    // Add new columns if they don't exist (for existing databases)
    try {
      db.exec(`ALTER TABLE blog_posts ADD COLUMN faq_content TEXT`);
    } catch (e: any) {
      // Column already exists, ignore
    }
    try {
      db.exec(`ALTER TABLE blog_posts ADD COLUMN location TEXT DEFAULT 'Kent'`);
    } catch (e: any) {
      // Column already exists, ignore
    }

    // Police stations table
    db.exec(`
      CREATE TABLE IF NOT EXISTS police_stations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        address TEXT,
        phone TEXT,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Services table
    db.exec(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
      CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published, published_at);
      CREATE INDEX IF NOT EXISTS idx_police_station_slug ON police_stations(slug);
      CREATE INDEX IF NOT EXISTS idx_service_slug ON services(slug);
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Export proxy that initializes lazily
const dbProxy = new Proxy({} as Database.Database, {
  get(_target, prop) {
    const dbInstance = getDatabase();
    const value = (dbInstance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(dbInstance);
    }
    return value;
  }
});

export default dbProxy;

