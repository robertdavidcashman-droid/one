import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyAuth } from '@/lib/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAuth(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(Number(params.id));

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAuth(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, slug, content, excerpt, published, meta_title, meta_description, faq_content, location } = await request.json();

    const existing = db.prepare('SELECT id FROM blog_posts WHERE id = ?').get(Number(params.id));
    
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Auto-generate SEO fields if not provided
    const autoMetaTitle = meta_title || `${title} | Police Station Solicitor ${location || 'Kent'}`;
    const autoMetaDescription = meta_description || (excerpt ? excerpt.substring(0, 155) : `${title}. Expert police station representation in ${location || 'Kent'}. Available 24/7.`);

    const stmt = db.prepare(`
      UPDATE blog_posts 
      SET title = ?, slug = ?, content = ?, excerpt = ?, published = ?, 
          published_at = CASE WHEN published = 0 AND ? = 1 THEN CURRENT_TIMESTAMP ELSE published_at END,
          meta_title = ?, meta_description = ?, faq_content = ?, location = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const publishedAt = published ? new Date().toISOString() : null;
    
    stmt.run(
      title,
      slug,
      content,
      excerpt || null,
      published ? 1 : 0,
      published ? 1 : 0,
      autoMetaTitle,
      autoMetaDescription,
      faq_content || null,
      location || 'Kent',
      Number(params.id)
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAuth(request);
  
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stmt = db.prepare('DELETE FROM blog_posts WHERE id = ?');
  const result = stmt.run(Number(params.id));

  if (result.changes === 0) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

