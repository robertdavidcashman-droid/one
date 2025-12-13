import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyAdminSession, getOrCreateUserFromSession } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  const session = await verifyAdminSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const posts = db.prepare(`
    SELECT id, title, slug, excerpt, published, published_at, created_at, updated_at
    FROM blog_posts
    ORDER BY created_at DESC
  `).all();

  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get or create user from session
  const authorId = await getOrCreateUserFromSession();
  
  if (!authorId) {
    return NextResponse.json(
      { error: 'Failed to get user ID from session' },
      { status: 500 }
    );
  }

  try {
    const { title, slug, content, excerpt, published, meta_title, meta_description, faq_content, location } = await request.json();

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      );
    }

    // Auto-generate SEO fields if not provided
    const autoMetaTitle = meta_title || `${title} | Police Station Solicitor ${location || 'Kent'}`;
    const autoMetaDescription = meta_description || (excerpt ? excerpt.substring(0, 155) : `${title}. Expert police station representation in ${location || 'Kent'}. Available 24/7.`);

    const stmt = db.prepare(`
      INSERT INTO blog_posts 
      (title, slug, content, excerpt, published, published_at, author_id, meta_title, meta_description, faq_content, location, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const publishedAt = published ? new Date().toISOString() : null;
    
    const result = stmt.run(
      title,
      slug,
      content,
      excerpt || null,
      published ? 1 : 0,
      publishedAt,
      authorId, // Use actual user ID from NextAuth session
      autoMetaTitle,
      autoMetaDescription,
      faq_content || null,
      location || 'Kent'
    );

    return NextResponse.json({
      success: true,
      id: Number(result.lastInsertRowid),
    });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

