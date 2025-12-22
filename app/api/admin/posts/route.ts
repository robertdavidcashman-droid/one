/**
 * Blog Post Creation API
 * 
 * Saves posts to BOTH:
 * 1. SQLite database (immediate visibility in blog dropdown)
 * 2. GitHub (persistence across deployments) - optional
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveBlogPost, createBlogPost } from '@/lib/blog-persistence';
import db from '@/lib/db';

// =============================================================================
// DATABASE SAVE
// =============================================================================

interface DbPost {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  image: string;
  schemaJson?: string;
}

function saveToDatabase(post: DbPost): { success: boolean; id?: number; error?: string } {
  try {
    const stmt = db.prepare(`
      INSERT INTO blog_posts (
        title, slug, content, excerpt, meta_title, meta_description, 
        image, schema_json, published, published_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `);

    const result = stmt.run(
      post.title,
      post.slug,
      post.content,
      post.excerpt,
      post.metaTitle,
      post.metaDescription,
      post.image,
      post.schemaJson || null
    );

    return { success: true, id: Number(result.lastInsertRowid) };
  } catch (error) {
    console.error('[posts/route] Database error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Database error' };
  }
}

// =============================================================================
// REQUEST VALIDATION
// =============================================================================

interface CreatePostRequest {
  title: string;
  category: string;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  location?: string;
  metaTitle: string;
  metaDescription: string;
  contentHtml: string;
  faq?: Array<{ q: string; a: string }>;
  imageFilename?: string;
}

function validateRequest(data: unknown): { valid: boolean; error?: string; request?: CreatePostRequest } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const req = data as Record<string, unknown>;

  if (!req.title || typeof req.title !== 'string') {
    return { valid: false, error: 'title is required' };
  }
  if (!req.contentHtml || typeof req.contentHtml !== 'string') {
    return { valid: false, error: 'contentHtml is required' };
  }
  if (!req.metaTitle || typeof req.metaTitle !== 'string') {
    return { valid: false, error: 'metaTitle is required' };
  }
  if (!req.metaDescription || typeof req.metaDescription !== 'string') {
    return { valid: false, error: 'metaDescription is required' };
  }

  return {
    valid: true,
    request: {
      title: req.title as string,
      category: (req.category as string) || 'Police Station Advice',
      primaryKeyword: (req.primaryKeyword as string) || '',
      secondaryKeywords: Array.isArray(req.secondaryKeywords) ? req.secondaryKeywords : [],
      location: (req.location as string) || 'Kent',
      metaTitle: req.metaTitle as string,
      metaDescription: req.metaDescription as string,
      contentHtml: req.contentHtml as string,
      faq: Array.isArray(req.faq) ? req.faq : [],
      imageFilename: (req.imageFilename as string) || 'blog-listing-0.jpg',
    },
  };
}

// =============================================================================
// GENERATE EXCERPT FROM HTML
// =============================================================================

function generateExcerpt(html: string, maxLength: number = 160): string {
  const text = html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > maxLength * 0.7 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

// =============================================================================
// POST HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  // 1. Parse and validate request
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const reqCheck = validateRequest(body);
  if (!reqCheck.valid || !reqCheck.request) {
    return NextResponse.json({ success: false, error: reqCheck.error }, { status: 400 });
  }

  const req = reqCheck.request;

  // 2. Create post object for GitHub
  const post = createBlogPost({
    title: req.title,
    category: req.category,
    primaryKeyword: req.primaryKeyword,
    secondaryKeywords: req.secondaryKeywords || [],
    location: req.location || 'Kent',
    metaTitle: req.metaTitle,
    metaDescription: req.metaDescription,
    contentHtml: req.contentHtml,
    faq: req.faq || [],
    imageFilename: req.imageFilename,
  });

  // 3. Save to SQLite database FIRST (for immediate visibility)
  const dbResult = saveToDatabase({
    title: post.title,
    slug: post.slug,
    content: post.contentHtml,
    excerpt: generateExcerpt(post.contentHtml),
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    image: post.featuredImage,
  });

  if (!dbResult.success) {
    return NextResponse.json(
      { success: false, error: `Database error: ${dbResult.error}` },
      { status: 500 }
    );
  }

  // 4. Try to save to GitHub (optional - for cross-deployment persistence)
  let githubResult: { success: boolean; error?: string; filePath?: string } = { 
    success: false, 
    error: 'GitHub not configured', 
    filePath: '' 
  };
  
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
    githubResult = await saveBlogPost(post);
    if (!githubResult.success) {
      console.warn('[posts/route] GitHub save failed:', githubResult.error);
      // Don't fail - database save succeeded
    }
  } else {
    // GitHub persistence is optional; avoid noisy logs in production.
  }

  // 5. Return success
  return NextResponse.json({
    success: true,
    post: {
      id: dbResult.id,
      slug: post.slug,
      title: post.title,
      date: post.date,
      url: `/blog/${post.slug}`,
      image: post.featuredImage,
    },
    database: { saved: true, id: dbResult.id },
    github: { 
      saved: githubResult.success, 
      filePath: githubResult.filePath,
      error: githubResult.success ? undefined : githubResult.error,
    },
  });
}

// =============================================================================
// GET HANDLER
// =============================================================================

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Blog posts API. Use POST to create a new post.',
    github: {
      configured: !!(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO),
      repo: process.env.GITHUB_REPO || 'not set',
    },
  });
}
