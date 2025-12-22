/**
 * BLOG POSTS API ENDPOINT
 * 
 * Returns published blog posts for client-side components.
 * Uses the new blog-reader module that supports both:
 * - New individual JSON files (/data/blog-posts/)
 * - Legacy JSON file (/data/blog-posts-full.json)
 */

import { NextResponse } from 'next/server';
import { getAllPosts, getPostSummaries } from '@/lib/blog-reader';

// Force dynamic - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/blog/posts
 * 
 * Returns ALL published blog posts for use in menus and listings.
 */
export async function GET() {
  try {
    const posts = getPostSummaries();

    return NextResponse.json({ 
      posts,
      total: posts.length,
    });
  } catch (error) {
    console.error('[API /api/blog/posts] Error:', error);
    
    return NextResponse.json({ 
      posts: [], 
      total: 0,
      error: String(error) 
    }, { status: 200 });
  }
}

/**
 * HEAD /api/blog/posts
 * 
 * Health check endpoint.
 */
export async function HEAD() {
  try {
    const posts = getAllPosts();
    
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'X-Blog-Post-Count': String(posts.length),
        'X-Blog-Status': 'ok'
      }
    });
  } catch (error) {
    return new NextResponse(null, { 
      status: 503,
      headers: {
        'X-Blog-Status': 'error',
        'X-Blog-Error': String(error)
      }
    });
  }
}
