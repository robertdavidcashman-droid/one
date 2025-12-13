#!/usr/bin/env node

/**
 * Exact Blog Clone from policestationagent.com/blog
 * Creates pixel-accurate, content-accurate copy at /criminaldefencekent/blog
 * Preserves original blog identity for future multi-domain resolution
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const PSA_URL = 'https://policestationagent.com';
const APP_DIR = path.join(__dirname, '..', 'app');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const BLOG_IMAGES_DIR = path.join(PUBLIC_DIR, 'blog-images');
const BLOG_DATA_FILE = path.join(__dirname, '..', 'data', 'blog-posts.json');

// Ensure directories exist
async function ensureDirs() {
  await fs.mkdir(BLOG_IMAGES_DIR, { recursive: true });
  await fs.mkdir(path.join(APP_DIR, 'criminaldefencekent', 'blog'), { recursive: true });
  await fs.mkdir(path.join(APP_DIR, 'criminaldefencekent', 'blog', '[slug]'), { recursive: true });
  await fs.mkdir(path.join(__dirname, '..', 'data'), { recursive: true });
}

// Download image and return local path
async function downloadImage(imageUrl, slug, imageIndex = 0) {
  try {
    const url = new URL(imageUrl);
    const ext = path.extname(url.pathname) || '.jpg';
    const filename = `${slug}-${imageIndex}${ext}`;
    const filepath = path.join(BLOG_IMAGES_DIR, filename);
    
    // Check if already downloaded
    try {
      await fs.access(filepath);
      return `/blog-images/${filename}`;
    } catch {
      // File doesn't exist, download it
    }
    
    return new Promise((resolve, reject) => {
      const client = url.protocol === 'https:' ? https : http;
      const file = require('fs').createWriteStream(filepath);
      
      client.get(imageUrl, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(`/blog-images/${filename}`);
          });
        } else if (response.statusCode === 301 || response.statusCode === 302) {
          // Handle redirects
          file.close();
          require('fs').unlinkSync(filepath);
          downloadImage(response.headers.location, slug, imageIndex).then(resolve).catch(reject);
        } else {
          file.close();
          require('fs').unlinkSync(filepath);
          reject(new Error(`Failed to download: ${response.statusCode}`));
        }
      }).on('error', (err) => {
        file.close();
        require('fs').unlinkSync(filepath).catch(() => {});
        reject(err);
      });
    });
  } catch (error) {
    console.error(`    ⚠️  Image download failed: ${error.message}`);
    return imageUrl; // Return original URL if download fails
  }
}

// Extract all blog post slugs from the blog listing page
async function getAllBlogSlugs(browser) {
  const page = await browser.newPage();
  const slugs = new Set();
  
  try {
    const url = `${PSA_URL}/blog`;
    console.log(`  📄 Fetching blog listing page...`);
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    
    const pageSlugs = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/blog/"], a[href*="/post?slug="]'));
      const found = new Set();
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          // Handle /post?slug= format
          if (href.includes('slug=')) {
            const match = href.match(/slug=([^&]+)/);
            if (match) {
              found.add(decodeURIComponent(match[1]));
            }
          }
          // Handle /blog/slug format
          else if (href.includes('/blog/')) {
            const slug = href.replace(/^.*\/blog\//, '').replace(/\/$/, '').split('?')[0].split('#')[0];
            if (slug && slug !== 'blog' && !slug.includes('#')) {
              found.add(slug);
            }
          }
        }
      });
      
      return Array.from(found);
    });
    
    pageSlugs.forEach(slug => slugs.add(slug));
    
    // Check for pagination and get more pages
    let hasNext = await page.evaluate(() => {
      const nextBtn = document.querySelector('button:not([disabled])');
      return nextBtn && (nextBtn.textContent.includes('Next') || !nextBtn.disabled);
    });
    
    let pageNum = 2;
    while (hasNext && pageNum <= 10) { // Limit to 10 pages
      const nextUrl = `${PSA_URL}/blog?page=${pageNum}`;
      await page.goto(nextUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));
      
      const moreSlugs = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/blog/"], a[href*="/post?slug="]'));
        const found = new Set();
        
        links.forEach(link => {
          const href = link.getAttribute('href');
          if (href) {
            if (href.includes('slug=')) {
              const match = href.match(/slug=([^&]+)/);
              if (match) {
                found.add(decodeURIComponent(match[1]));
              }
            } else if (href.includes('/blog/')) {
              const slug = href.replace(/^.*\/blog\//, '').replace(/\/$/, '').split('?')[0].split('#')[0];
              if (slug && slug !== 'blog' && !slug.includes('#')) {
                found.add(slug);
              }
            }
          }
        });
        
        return Array.from(found);
      });
      
      if (moreSlugs.length === 0) {
        hasNext = false;
      } else {
        moreSlugs.forEach(slug => slugs.add(slug));
        pageNum++;
      }
      
      hasNext = await page.evaluate(() => {
        const nextBtn = document.querySelector('button:not([disabled])');
        return nextBtn && (nextBtn.textContent.includes('Next') || !nextBtn.disabled);
      });
    }
    
    await page.close();
    return Array.from(slugs);
  } catch (error) {
    await page.close();
    throw error;
  }
}

// Scrape individual blog post
async function scrapeBlogPost(browser, slug) {
  const page = await browser.newPage();
  
  try {
    // Try /blog/slug first, then /post?slug=slug
    let url = `${PSA_URL}/blog/${slug}`;
    let response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    if (response.status() === 404) {
      url = `${PSA_URL}/post?slug=${slug}`;
      response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    }
    
    await new Promise(r => setTimeout(r, 3000));
    
    const data = await page.evaluate(() => {
      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]');
      const description = metaDesc ? metaDesc.getAttribute('content') || '' : '';
      
      // Get main content - preserve exact structure
      const main = document.querySelector('main') || 
                   document.querySelector('article') ||
                   document.querySelector('#content') ||
                   document.querySelector('.content') ||
                   document.body;
      
      let html = '';
      if (main) {
        const clone = main.cloneNode(true);
        // Remove only navigation, headers, footers - preserve all content structure
        clone.querySelectorAll('script, style, noscript, nav, header, footer, .header, .footer, .nav, .cookie-banner, [class*="cookie"], [id*="cookie"]').forEach(el => el.remove());
        html = clone.innerHTML;
      }
      
      // Extract images with full metadata
      const images = Array.from(main?.querySelectorAll('img') || []);
      const imageData = images.map(img => ({
        src: img.src || img.getAttribute('src'),
        alt: img.alt || '',
        width: img.width || img.getAttribute('width') || '',
        height: img.height || img.getAttribute('height') || '',
        loading: img.getAttribute('loading') || 'lazy',
        decoding: img.getAttribute('decoding') || 'async',
      }));
      
      // Extract published date
      const dateText = document.querySelector('[class*="date"], [class*="published"], time, [datetime]')?.textContent || 
                       document.querySelector('[datetime]')?.getAttribute('datetime') || '';
      let publishedAt = null;
      if (dateText) {
        const dateMatch = dateText.match(/(\d{1,2}\s+\w+\s+\d{4})|(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          try {
            publishedAt = new Date(dateMatch[0]).toISOString();
          } catch {}
        }
      }
      
      // Extract author
      const authorEl = document.querySelector('[class*="author"], [class*="by"], [itemprop="author"]');
      const author = authorEl?.textContent.replace(/by|author|:/gi, '').trim() || 'Police Station Agent';
      
      return { title, description, html, images: imageData, publishedAt, author };
    });
    
    await page.close();
    
    if (!data.html || data.html.length < 200) {
      return null;
    }
    
    return data;
  } catch (error) {
    await page.close();
    throw error;
  }
}

// Process images in HTML content
async function processImagesInHtml(html, slug) {
  const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let processedHtml = html;
  let imageIndex = 0;
  const replacements = [];
  
  let match;
  while ((match = imageRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    const imageUrl = match[1];
    
    if (imageUrl && !imageUrl.startsWith('/blog-images/') && !imageUrl.startsWith('data:') && !imageUrl.startsWith('#')) {
      try {
        const localPath = await downloadImage(imageUrl, slug, imageIndex);
        replacements.push({ original: imageUrl, local: localPath, fullMatch });
        imageIndex++;
      } catch (error) {
        console.error(`    ⚠️  Failed to process image: ${imageUrl}`);
      }
    }
  }
  
  // Apply replacements
  replacements.forEach(({ original, local, fullMatch }) => {
    processedHtml = processedHtml.replace(original, local);
  });
  
  return processedHtml;
}

// Scrape blog listing page
async function scrapeBlogListing(browser) {
  const page = await browser.newPage();
  
  try {
    console.log(`  📥 Scraping blog listing page...`);
    await page.goto(`${PSA_URL}/blog`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    
    const data = await page.evaluate(() => {
      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]');
      const description = metaDesc ? metaDesc.getAttribute('content') || '' : '';
      
      // Get main content - preserve exact structure
      const main = document.querySelector('main') || 
                   document.querySelector('#content') ||
                   document.querySelector('.content') ||
                   document.body;
      
      let html = '';
      if (main) {
        const clone = main.cloneNode(true);
        clone.querySelectorAll('script, style, noscript, nav, header, footer, .header, .footer, .nav, .cookie-banner, [class*="cookie"], [id*="cookie"]').forEach(el => el.remove());
        html = clone.innerHTML;
      }
      
      return { title, description, html };
    });
    
    await page.close();
    return data;
  } catch (error) {
    await page.close();
    throw error;
  }
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  EXACT BLOG CLONE - policestationagent.com/blog`);
  console.log(`  Target: /criminaldefencekent/blog`);
  console.log(`${'═'.repeat(70)}\n`);

  await ensureDirs();
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Step 1: Scrape blog listing page
    console.log('Step 1: Scraping blog listing page...\n');
    const listingData = await scrapeBlogListing(browser);
    
    // Process images in listing page
    const processedListingHtml = await processImagesInHtml(listingData.html, 'blog-listing');
    
    // Step 2: Get all blog post slugs
    console.log('\nStep 2: Discovering all blog posts...\n');
    const slugs = await getAllBlogSlugs(browser);
    console.log(`  Found ${slugs.length} blog posts\n`);
    
    // Step 3: Scrape each blog post
    console.log('Step 3: Scraping individual blog posts...\n');
    const blogPosts = {};
    let success = 0;
    let failed = 0;
    
    for (let i = 0; i < slugs.length; i++) {
      const slug = slugs[i];
      console.log(`[${i + 1}/${slugs.length}] Processing: ${slug}`);
      
      try {
        const postData = await scrapeBlogPost(browser, slug);
        
        if (postData) {
          // Process images in content
          const processedContent = await processImagesInHtml(postData.html, slug);
          
          // Clean content - update internal links but preserve structure
          let cleanContent = processedContent
            .replace(/policestationagent\.com\/blog\//gi, '/criminaldefencekent/blog/')
            .replace(/policestationagent\.com\/post\?slug=/gi, '/criminaldefencekent/blog/')
            .replace(/href=["']\/blog\//gi, 'href="/criminaldefencekent/blog/')
            .replace(/href=["']\/post\?slug=/gi, 'href="/criminaldefencekent/blog/');
          
          blogPosts[slug] = {
            title: postData.title,
            slug: slug,
            content: cleanContent,
            description: postData.description,
            publishedAt: postData.publishedAt,
            author: postData.author,
            metaTitle: postData.title,
            metaDescription: postData.description,
          };
          
          success++;
        } else {
          console.log(`    ⚠️  No content found`);
          failed++;
        }
      } catch (error) {
        console.error(`    ❌ Error: ${error.message}`);
        failed++;
      }
      
      await new Promise(r => setTimeout(r, 1500)); // Rate limiting
    }
    
    // Step 4: Save blog posts data
    console.log('\nStep 4: Saving blog posts data...\n');
    await fs.writeFile(BLOG_DATA_FILE, JSON.stringify(blogPosts, null, 2), 'utf-8');
    console.log(`  ✅ Saved ${Object.keys(blogPosts).length} blog posts to ${BLOG_DATA_FILE}`);
    
    // Step 5: Create blog listing page
    console.log('\nStep 5: Creating blog listing page...\n');
    let cleanListingContent = processedListingHtml
      .replace(/policestationagent\.com\/blog\//gi, '/criminaldefencekent/blog/')
      .replace(/policestationagent\.com\/post\?slug=/gi, '/criminaldefencekent/blog/')
      .replace(/href=["']\/blog\//gi, 'href="/criminaldefencekent/blog/')
      .replace(/href=["']\/post\?slug=/gi, 'href="/criminaldefencekent/blog/');
    
    const listingPageContent = `import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ${JSON.stringify(listingData.title)},
  description: ${JSON.stringify(listingData.description)},
  alternates: {
    canonical: 'https://policestationagent.com/blog',
  },
  openGraph: {
    title: ${JSON.stringify(listingData.title)},
    description: ${JSON.stringify(listingData.description)},
    url: 'https://policestationagent.com/blog',
    siteName: 'Police Station Agent',
    type: 'website',
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen">
          <div 
            className="prose prose-lg max-w-6xl mx-auto px-4 py-16"
            dangerouslySetInnerHTML={{ __html: ${JSON.stringify(cleanListingContent)} }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
`;
    
    const listingFilePath = path.join(APP_DIR, 'criminaldefencekent', 'blog', 'page.tsx');
    await fs.writeFile(listingFilePath, listingPageContent, 'utf-8');
    console.log(`  ✅ Created blog listing page`);
    
    // Step 6: Create dynamic blog post page
    console.log('\nStep 6: Creating dynamic blog post page...\n');
    const dynamicPageContent = `import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import blogPostsData from '@/../../data/blog-posts.json';

interface PageProps {
  params: {
    slug: string;
  };
}

const BLOG_POSTS: Record<string, {
  title: string;
  slug: string;
  content: string;
  description: string;
  publishedAt: string | null;
  author: string;
  metaTitle?: string;
  metaDescription?: string;
}> = blogPostsData;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = BLOG_POSTS[params.slug];
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  
  // Preserve original blog identity - use policestationagent.com for canonical
  // This allows future domain aliasing
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.description,
    alternates: {
      canonical: \`https://policestationagent.com/blog/\${post.slug}\`,
    },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.description,
      url: \`https://policestationagent.com/blog/\${post.slug}\`,
      siteName: 'Police Station Agent',
      type: 'article',
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = BLOG_POSTS[params.slug];
  
  if (!post) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen">
          <div 
            className="prose prose-lg max-w-6xl mx-auto px-4 py-16"
            dangerouslySetInnerHTML={{ __html: \`<div class="fixed right-3 top-4 z-40 text-[10px] text-slate-400 select-none pointer-events-none bg-white/80 backdrop-blur-sm px-2 py-1 rounded border border-slate-200/50" aria-hidden="true">v4.4.0 — 11/12/2025</div>\${post.content}\` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
`;
    
    const dynamicPagePath = path.join(APP_DIR, 'criminaldefencekent', 'blog', '[slug]', 'page.tsx');
    await fs.writeFile(dynamicPagePath, dynamicPageContent, 'utf-8');
    console.log(`  ✅ Created dynamic blog post page`);
    
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  RESULTS`);
    console.log(`${'═'.repeat(70)}`);
    console.log(`  ✅ Successfully cloned: ${success} posts`);
    console.log(`  ❌ Failed: ${failed} posts`);
    console.log(`  📄 Blog listing page: Created`);
    console.log(`  📄 Dynamic post page: Created`);
    console.log(`  📦 Blog data file: ${BLOG_DATA_FILE}`);
    console.log(`${'═'.repeat(70)}\n`);
    
    console.log('✅ Blog clone complete!');
    console.log('   Blog available at: /criminaldefencekent/blog');
    console.log('   Original identity preserved: policestationagent/blog');
    console.log('   All images downloaded to: /public/blog-images/\n');
    
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);



