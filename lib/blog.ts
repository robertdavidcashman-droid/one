import db from '@/lib/db';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  published: number;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  author_id: number | null;
  faq_content: string | null;
  location: string | null;
}

/**
 * Normalize slug for matching - handles various formats
 */
function normalizeSlug(raw: string): string {
  if (!raw) return '';
  
  // Decode URL encoding
  let normalized = decodeURIComponent(raw);
  
  // Remove leading/trailing slashes and whitespace
  normalized = normalized.trim().replace(/^\/+|\/+$/g, '');
  
  // Convert to lowercase
  normalized = normalized.toLowerCase();
  
  // Remove query parameters
  normalized = normalized.split('?')[0];
  
  // Remove hash fragments
  normalized = normalized.split('#')[0];
  
  return normalized;
}

/**
 * Robust blog post retrieval with multiple matching strategies
 * Based on Base44 getBlogPost improvements
 */
export function getBlogPost(slugOrId: string | number): BlogPost | null {
  if (!slugOrId) return null;

  try {
    // Strategy 1: If numeric, try ID match first
    if (typeof slugOrId === 'number' || /^\d+$/.test(String(slugOrId))) {
      const byId = db.prepare('SELECT * FROM blog_posts WHERE id = ? AND published = 1').get(Number(slugOrId)) as BlogPost | undefined;
      if (byId) return byId;
    }

    // Strategy 2: Exact slug match (case-insensitive)
    const normalized = normalizeSlug(String(slugOrId));
    const exact = db.prepare('SELECT * FROM blog_posts WHERE LOWER(slug) = LOWER(?) AND published = 1').get(normalized) as BlogPost | undefined;
    if (exact) return exact;

    // Strategy 3: Fuzzy match - slug contains the normalized value or vice versa
    const fuzzy = db.prepare(`
      SELECT * FROM blog_posts 
      WHERE published = 1 
      AND (LOWER(slug) LIKE ? OR LOWER(?) LIKE '%' || LOWER(slug) || '%')
      LIMIT 1
    `).get(`%${normalized}%`, normalized) as BlogPost | undefined;
    if (fuzzy) return fuzzy;

    // Strategy 4: Title match (case-insensitive, partial)
    const byTitle = db.prepare(`
      SELECT * FROM blog_posts 
      WHERE published = 1 
      AND LOWER(title) LIKE ?
      LIMIT 1
    `).get(`%${normalized.replace(/-/g, ' ')}%`) as BlogPost | undefined;
    if (byTitle) return byTitle;

    return null;
  } catch (error) {
    console.error('Error retrieving blog post:', error);
    return null;
  }
}

/**
 * Get all published blog posts
 */
export function getAllBlogPosts(limit?: number): BlogPost[] {
  try {
    const query = limit 
      ? 'SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC, created_at DESC LIMIT ?'
      : 'SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC, created_at DESC';
    
    const posts = limit
      ? db.prepare(query).all(limit) as BlogPost[]
      : db.prepare(query).all() as BlogPost[];
    
    return posts;
  } catch (error) {
    console.error('Error retrieving blog posts:', error);
    return [];
  }
}

/**
 * Get blog posts by category (if category field exists in future)
 */
export function getBlogPostsByCategory(category: string): BlogPost[] {
  try {
    // For now, return all posts. Can be extended when category field is added
    return getAllBlogPosts();
  } catch (error) {
    console.error('Error retrieving blog posts by category:', error);
    return [];
  }
}

