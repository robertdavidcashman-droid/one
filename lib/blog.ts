/**
 * AUTHORITATIVE BLOG SYSTEM
 * 
 * This module provides the SINGLE SOURCE OF TRUTH for all blog-related data.
 * All blog pages, API routes, and menu dropdowns MUST use these functions.
 * 
 * Core Principles:
 * 1. The URL is derived, not trusted - slugs are normalized deterministically
 * 2. All queries go directly to the SQL database
 * 3. No static JSON files, no hardcoded arrays
 * 4. Runtime-driven, no rebuild required for new posts
 * 
 * @module lib/blog
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// ============================================================================
// TYPES
// ============================================================================

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
  image: string | null;
  schema_json: string | null;
}

export interface BlogPostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
  image: string | null;
}

// ============================================================================
// SLUG NORMALIZATION (CRITICAL)
// ============================================================================

/**
 * Normalizes a slug to ensure it's URL-safe and deterministic.
 * 
 * Rules:
 * - Lowercase
 * - Trim whitespace
 * - Replace spaces & punctuation with hyphens
 * - Collapse multiple hyphens
 * - Remove leading/trailing hyphens
 * 
 * @example
 * normalizeSlug("My First Blog Post!!!") // "my-first-blog-post"
 * normalizeSlug("  HELLO   WORLD  ") // "hello-world"
 * normalizeSlug("What's A Voluntary Police Interview?") // "whats-a-voluntary-police-interview"
 */
export function normalizeSlug(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .toLowerCase()                           // lowercase
    .trim()                                  // trim whitespace
    .normalize('NFD')                        // decompose unicode (é → e + ́)
    .replace(/[\u0300-\u036f]/g, '')         // remove diacritical marks
    .replace(/['']/g, '')                    // remove smart quotes
    .replace(/[^\w\s-]/g, '')                // remove non-word chars except spaces and hyphens
    .replace(/[\s_]+/g, '-')                 // replace spaces and underscores with hyphens
    .replace(/-+/g, '-')                     // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');                // remove leading/trailing hyphens
}

/**
 * Derives a slug from a title if the existing slug is invalid.
 * A slug is considered invalid if it's null, empty, contains spaces,
 * contains uppercase, or has invalid URL characters.
 */
export function deriveSlugIfNeeded(existingSlug: string | null | undefined, title: string): string {
  const isValid = existingSlug && 
    typeof existingSlug === 'string' &&
    existingSlug.length > 0 &&
    !/\s/.test(existingSlug) &&             // no spaces
    existingSlug === existingSlug.toLowerCase() && // all lowercase
    /^[a-z0-9-]+$/.test(existingSlug);      // only valid URL chars

  if (isValid) {
    return existingSlug;
  }

  // Derive from title
  const derived = normalizeSlug(title);
  
  if (!derived) {
    // Fallback: generate from ID would be handled by caller
    return 'untitled';
  }

  return derived;
}

// ============================================================================
// EXCERPT GENERATION (FROM HTML CONTENT)
// ============================================================================

/**
 * Generates an excerpt from HTML content by stripping tags and taking first N characters.
 * 
 * @param content The HTML content
 * @param maxLength Maximum length of excerpt (default: 160)
 * @returns Plain text excerpt, or null if content is empty
 */
export function generateExcerpt(content: string | null, maxLength: number = 160): string | null {
  if (!content || typeof content !== 'string') {
    return null;
  }

  // Strip HTML tags
  const textOnly = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
    .replace(/<[^>]+>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&[a-z]+;/gi, ' ') // Replace HTML entities
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();

  if (!textOnly || textOnly.length === 0) {
    return null;
  }

  // Take first maxLength characters
  if (textOnly.length <= maxLength) {
    return textOnly;
  }

  // Truncate at word boundary
  const truncated = textOnly.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.7) {
    // If we found a space reasonably close to the end, cut there
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

// ============================================================================
// IMAGE EXTRACTION (FROM HTML CONTENT)
// ============================================================================

/**
 * Extracts the first image URL from HTML content.
 * Handles various image formats including <img> tags and background images.
 * 
 * @param content The HTML content to search for images
 * @returns The first image URL found, or null if none
 */
export function extractFirstImage(content: string | null): string | null {
  if (!content || typeof content !== 'string') {
    return null;
  }

  // Pattern 1: Standard <img> tags with src attribute
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (imgMatch && imgMatch[1]) {
    return normalizeImageUrl(imgMatch[1]);
  }

  // Pattern 2: <img> with src before other attributes
  const imgMatch2 = content.match(/<img\s+src=["']([^"']+)["']/i);
  if (imgMatch2 && imgMatch2[1]) {
    return normalizeImageUrl(imgMatch2[1]);
  }

  // Pattern 3: Background image in style attribute
  const bgMatch = content.match(/background(?:-image)?:\s*url\(["']?([^"')]+)["']?\)/i);
  if (bgMatch && bgMatch[1]) {
    return normalizeImageUrl(bgMatch[1]);
  }

  // Pattern 4: data-src (lazy loading)
  const dataSrcMatch = content.match(/data-src=["']([^"']+)["']/i);
  if (dataSrcMatch && dataSrcMatch[1]) {
    return normalizeImageUrl(dataSrcMatch[1]);
  }

  return null;
}

/**
 * Normalizes an image URL for use in the application.
 * Handles relative paths, ensures proper formatting.
 * Strips blur parameters from Wix URLs.
 */
function normalizeImageUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Clean up the URL - remove quotes that might be embedded
  let cleanUrl = url.trim().replace(/^["']|["']$/g, '').replace(/&quot;/g, '');

  // Skip data URIs that are too small (likely placeholders)
  if (cleanUrl.startsWith('data:') && cleanUrl.length < 100) {
    return null;
  }

  // Skip empty or placeholder images
  if (cleanUrl === '' || cleanUrl === '#' || cleanUrl.includes('placeholder')) {
    return null;
  }

  // Handle Wix image URLs - clean up blur parameters
  if (cleanUrl.includes('wix.com') || cleanUrl.includes('wixstatic.com')) {
    // Remove blur_* parameters from Wix URLs
    cleanUrl = cleanWixImageUrl(cleanUrl);
    return cleanUrl;
  }

  // For relative URLs, make them absolute
  if (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//')) {
    return cleanUrl; // Keep as relative for Next.js
  }

  // For protocol-relative URLs
  if (cleanUrl.startsWith('//')) {
    return `https:${cleanUrl}`;
  }

  return cleanUrl;
}

/**
 * Clean up Wix image URLs by removing blur parameters and ensuring proper sizing.
 * Wix URLs use comma-separated parameters in the path, e.g.:
 * .../fill/w_63,h_38,al_c,q_80,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/...
 */
export function cleanWixImageUrl(url: string): string {
  if (!url) return url;
  
  // Remove blur_* parameter from the URL path
  // Wix uses format: blur_2 or blur_3 etc. in the path parameters
  let cleanedUrl = url.replace(/,blur_\d+/gi, '');
  
  // Also handle if blur is at the start of a parameter section
  cleanedUrl = cleanedUrl.replace(/blur_\d+,/gi, '');
  
  // Improve image quality by replacing small dimensions with larger ones
  // Only do this for very small images that are clearly thumbnails
  const widthMatch = cleanedUrl.match(/w_(\d+)/);
  const heightMatch = cleanedUrl.match(/h_(\d+)/);
  
  if (widthMatch && heightMatch) {
    const width = parseInt(widthMatch[1]);
    const height = parseInt(heightMatch[1]);
    
    // If image is very small (thumbnail), scale it up
    if (width < 200 && height < 200) {
      const scale = 10; // Scale up by 10x
      cleanedUrl = cleanedUrl.replace(`w_${width}`, `w_${width * scale}`);
      cleanedUrl = cleanedUrl.replace(`h_${height}`, `h_${height * scale}`);
    }
  }
  
  return cleanedUrl;
}

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

let dbInstance: Database.Database | null = null;

/**
 * Test-only helper to clear the cached DB handle.
 * (Vitest runs tests in a single process, so we need a way to swap BLOG_DB_PATH.)
 */
export function __resetBlogDbForTests() {
  try {
    (dbInstance as any)?.close?.();
  } catch {
    // ignore
  }
  dbInstance = null;
}

/**
 * Get or create the database connection.
 * Handles serverless environments (Vercel) by copying to /tmp if needed.
 */
function getDb(): Database.Database {
  // Skip during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Database not available during build. Use runtime queries only.');
  }

  if (dbInstance) {
    return dbInstance;
  }

  const sourceDbPath = process.env.BLOG_DB_PATH || path.join(process.cwd(), 'data', 'web44ai.db');
  let dbPath = sourceDbPath;

  // Serverless environment handling
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = '/tmp/web44ai.db';
    
    try {
      const sourceExists = fs.existsSync(sourceDbPath);
      const tmpExists = fs.existsSync(tmpDbPath);
      
      // Copy if source exists and tmp doesn't, or source is newer
      if (sourceExists && (!tmpExists || needsCopy(sourceDbPath, tmpDbPath))) {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
        console.log('[blog.ts] Copied database to /tmp for serverless');
      }
      
      if (fs.existsSync(tmpDbPath)) {
        dbPath = tmpDbPath;
      }
    } catch (err) {
      console.warn('[blog.ts] Could not copy database to /tmp:', err);
    }
  }

  try {
    dbInstance = new Database(dbPath, { readonly: true });
    console.log('[blog.ts] Database opened:', dbPath);
  } catch (err) {
    console.error('[blog.ts] Failed to open database:', err);
    throw err;
  }

  return dbInstance;
}

function needsCopy(sourcePath: string, destPath: string): boolean {
  try {
    const sourceStat = fs.statSync(sourcePath);
    const destStat = fs.statSync(destPath);
    return sourceStat.mtimeMs > destStat.mtimeMs;
  } catch {
    return true;
  }
}

// ============================================================================
// AUTHORITATIVE BLOG QUERIES (MANDATORY)
// ============================================================================

/**
 * SINGLE AUTHORITATIVE FUNCTION for fetching published blog posts.
 * 
 * This function MUST be used by:
 * - /blog page
 * - /blog/[slug] page
 * - Blog menu dropdown
 * - Any other component that needs blog data
 * 
 * @returns Array of published blog posts with normalized slugs, sorted by publishedAt DESC
 */
export function getPublishedBlogPosts(): BlogPostSummary[] {
  try {
    const db = getDb();
    
    // Include content for image extraction
    const posts = db.prepare(`
      SELECT 
        id,
        title,
        slug,
        content,
        excerpt,
        image,
        published_at,
        created_at
      FROM blog_posts 
      WHERE published = 1
      ORDER BY 
        COALESCE(published_at, created_at) DESC
    `).all() as Array<{
      id: number;
      title: string;
      slug: string;
      content: string;
      excerpt: string | null;
      image: string | null;
      published_at: string | null;
      created_at: string;
    }>;

    // Normalize slugs, extract images, and generate excerpts for each post
    const normalizedPosts: BlogPostSummary[] = posts.map(post => {
      // Generate excerpt if missing
      const excerpt = post.excerpt && post.excerpt.trim() 
        ? post.excerpt.trim() 
        : generateExcerpt(post.content, 160);

      // Ensure title is never empty
      const title = post.title && post.title.trim() 
        ? post.title.trim() 
        : 'Untitled Post';

      return {
        id: post.id,
        title,
        slug: deriveSlugIfNeeded(post.slug, post.title || title),
        excerpt,
        published_at: post.published_at,
        created_at: post.created_at,
        // Prefer explicitly stored featured image; fallback to first <img> in content.
        image: normalizeImageUrl(post.image || '') || extractFirstImage(post.content),
      };
    });

    console.log(`[blog.ts] getPublishedBlogPosts: Found ${normalizedPosts.length} published posts`);

    if (normalizedPosts.length === 0) {
      console.warn('[blog.ts] WARNING: Zero published blog posts returned!');
    }

    return normalizedPosts;
  } catch (error) {
    console.error('[blog.ts] Error in getPublishedBlogPosts:', error);
    return [];
  }
}

/**
 * Get full blog post content by slug.
 * Performs case-insensitive matching and normalizes the incoming slug.
 * 
 * @param slug The URL slug (may be case-variant or malformed)
 * @returns The full blog post or null if not found
 */
export function getPostBySlug(slug: string): BlogPost | null {
  if (!slug || typeof slug !== 'string') {
    console.warn('[blog.ts] getPostBySlug called with invalid slug:', slug);
    return null;
  }

  try {
    const db = getDb();
    
    // Normalize the incoming slug for matching
    const normalizedInputSlug = normalizeSlug(slug);
    
    // Get all published posts
    const posts = db.prepare(`
      SELECT 
        id,
        title,
        slug,
        content,
        excerpt,
        meta_title,
        meta_description,
        published_at,
        created_at,
        updated_at,
        image,
        schema_json
      FROM blog_posts 
      WHERE published = 1
    `).all() as BlogPost[];

    // Find matching post by normalized slug (case-insensitive)
    const post = posts.find(p => {
      const postNormalizedSlug = deriveSlugIfNeeded(p.slug, p.title);
      return postNormalizedSlug === normalizedInputSlug || 
             normalizeSlug(p.slug) === normalizedInputSlug;
    });

    if (!post) {
      console.log(`[blog.ts] getPostBySlug: No post found for slug "${slug}" (normalized: "${normalizedInputSlug}")`);
      return null;
    }

    // Return with normalized slug and extracted image
    return {
      ...post,
      slug: deriveSlugIfNeeded(post.slug, post.title),
      // Prefer explicitly stored featured image; fallback to first <img> in content.
      image: normalizeImageUrl(post.image || '') || extractFirstImage(post.content),
    };
  } catch (error) {
    console.error('[blog.ts] Error in getPostBySlug:', error);
    return null;
  }
}

/**
 * Get blog post by ID (for admin purposes).
 */
export function getPostById(id: number): BlogPost | null {
  if (!id || typeof id !== 'number') {
    return null;
  }

  try {
    const db = getDb();
    
    const post = db.prepare(`
      SELECT 
        id,
        title,
        slug,
        content,
        excerpt,
        meta_title,
        meta_description,
        published_at,
        created_at,
        updated_at
      FROM blog_posts 
      WHERE id = ?
    `).get(id) as BlogPost | undefined;

    if (!post) {
      return null;
    }

    return {
      ...post,
      slug: deriveSlugIfNeeded(post.slug, post.title)
    };
  } catch (error) {
    console.error('[blog.ts] Error in getPostById:', error);
    return null;
  }
}

// ============================================================================
// SAFE BACKFILL LOGIC (OPTIONAL)
// ============================================================================

interface BackfillResult {
  updated: number;
  skipped: number;
  errors: string[];
}

/**
 * Safely backfills slugs in the database.
 * Only updates posts where the slug is null, empty, or malformed.
 * Does NOT overwrite valid existing slugs.
 * 
 * This should be run as a one-time migration or maintenance task.
 */
export function backfillSlugs(): BackfillResult {
  const result: BackfillResult = { updated: 0, skipped: 0, errors: [] };

  try {
    // Need write access for backfill
    const sourceDbPath = process.env.BLOG_DB_PATH || path.join(process.cwd(), 'data', 'web44ai.db');
    const db = new Database(sourceDbPath, { readonly: false });

    const posts = db.prepare(`
      SELECT id, title, slug FROM blog_posts
    `).all() as Array<{ id: number; title: string; slug: string | null }>;

    const usedSlugs = new Set<string>();

    // First pass: collect all valid existing slugs
    for (const post of posts) {
      if (post.slug && deriveSlugIfNeeded(post.slug, post.title) === post.slug) {
        usedSlugs.add(post.slug);
      }
    }

    const updateStmt = db.prepare(`
      UPDATE blog_posts SET slug = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);

    // Second pass: update invalid slugs
    for (const post of posts) {
      const derived = deriveSlugIfNeeded(post.slug, post.title);
      
      // Skip if slug is already valid and matches derived
      if (post.slug === derived) {
        result.skipped++;
        continue;
      }

      // Ensure uniqueness
      let finalSlug = derived;
      let counter = 2;
      while (usedSlugs.has(finalSlug)) {
        finalSlug = `${derived}-${counter}`;
        counter++;
      }

      try {
        updateStmt.run(finalSlug, post.id);
        usedSlugs.add(finalSlug);
        result.updated++;
        console.log(`[blog.ts] Backfilled slug for ID ${post.id}: "${post.slug}" -> "${finalSlug}"`);
      } catch (err) {
        const msg = `Failed to update ID ${post.id}: ${err}`;
        result.errors.push(msg);
        console.error('[blog.ts]', msg);
      }
    }

    db.close();
    console.log(`[blog.ts] Backfill complete: ${result.updated} updated, ${result.skipped} skipped`);
  } catch (error) {
    const msg = `Backfill failed: ${error}`;
    result.errors.push(msg);
    console.error('[blog.ts]', msg);
  }

  return result;
}

// ============================================================================
// CONTENT SANITIZATION
// ============================================================================

/**
 * Sanitizes blog post HTML content by:
 * - Removing blur parameters from Wix image URLs
 * - Improving image quality by scaling up small thumbnails
 * - Removing broken/placeholder images
 * - Fixing malformed URLs with embedded quotes
 */
export function sanitizeBlogContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let sanitized = content;

  // Fix malformed URLs with embedded &quot; entities
  sanitized = sanitized.replace(/&quot;/g, '');

  // Find and clean all Wix image URLs in the content
  // Pattern matches src="...wixstatic.com..." or src='...wixstatic.com...'
  sanitized = sanitized.replace(
    /(src=["'])([^"']*(?:wix\.com|wixstatic\.com)[^"']*)(["'])/gi,
    (match, prefix, url, suffix) => {
      const cleanedUrl = cleanWixImageUrl(url);
      return `${prefix}${cleanedUrl}${suffix}`;
    }
  );

  // Also clean background-image URLs
  sanitized = sanitized.replace(
    /(url\(["']?)([^"'()]*(?:wix\.com|wixstatic\.com)[^"'()]*)(["']?\))/gi,
    (match, prefix, url, suffix) => {
      const cleanedUrl = cleanWixImageUrl(url);
      return `${prefix}${cleanedUrl}${suffix}`;
    }
  );

  return sanitized;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format a date for display.
 */
export function formatBlogDate(dateString: string | null): string | null {
  if (!dateString) return null;
  
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

/**
 * Check if the blog system is operational.
 */
export function healthCheck(): { ok: boolean; postCount: number; error?: string } {
  try {
    const posts = getPublishedBlogPosts();
    return { ok: true, postCount: posts.length };
  } catch (error) {
    return { ok: false, postCount: 0, error: String(error) };
  }
}
