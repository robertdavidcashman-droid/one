#!/usr/bin/env node

/**
 * Import blog posts from Wix site: https://robertdcashman.wixsite.com/website/blog
 * 
 * This script:
 * 1. Crawls all blog posts from the Wix blog
 * 2. Extracts title, content, images, dates, slugs
 * 3. Downloads images to public/blog-images/
 * 4. Imports posts into the database
 * 5. Marks as published
 */

const puppeteer = require('puppeteer');
const Database = require('better-sqlite3');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const WIX_BLOG_URL = 'https://robertdcashman.wixsite.com/website/blog';
const DB_PATH = path.join(process.cwd(), 'data', 'web44ai.db');
const IMAGE_DIR = path.join(process.cwd(), 'public', 'blog-images');

// Ensure directories exist
async function ensureDirectories() {
  const dirs = [path.dirname(DB_PATH), IMAGE_DIR];
  for (const dir of dirs) {
    try {
      await fsPromises.mkdir(dir, { recursive: true });
    } catch (e) {
      // Directory may already exist
    }
  }
}

// Download image and return local path
async function downloadImage(imageUrl, slug, index = 0) {
  try {
    const url = new URL(imageUrl);
    const ext = path.extname(url.pathname) || '.jpg';
    const filename = `${slug}-${index}${ext}`.replace(/[^a-z0-9.-]/gi, '-');
    const filepath = path.join(IMAGE_DIR, filename);
    
    // Skip if already exists
    try {
      await fsPromises.access(filepath);
      console.log(`    Image already exists: ${filename}`);
      return `/blog-images/${filename}`;
    } catch {
      // File doesn't exist, download it
    }

    return new Promise((resolve, reject) => {
      const protocol = url.protocol === 'https:' ? https : http;
      const file = fs.createWriteStream(filepath);
      
      protocol.get(imageUrl, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Follow redirect
          return downloadImage(response.headers.location, slug, index)
            .then(resolve)
            .catch(reject);
        }
        
        if (response.statusCode !== 200) {
          file.close();
          fsPromises.unlink(filepath).catch(() => {});
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`    Downloaded: ${filename}`);
          resolve(`/blog-images/${filename}`);
        });
      }).on('error', (err) => {
        file.close();
        fsPromises.unlink(filepath).catch(() => {});
        reject(err);
      });
    });
  } catch (error) {
    console.warn(`    Could not download image ${imageUrl}: ${error.message}`);
    return imageUrl; // Return original URL as fallback
  }
}

// Extract and process images from HTML
async function processImages(html, slug) {
  if (!html) return html;
  
  const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const images = [];
  let match;
  
  while ((match = imageRegex.exec(html)) !== null) {
    images.push(match[1]);
  }
  
  let processedHtml = html;
  let imageIndex = 0;
  
  for (const imageUrl of images) {
    try {
      // Skip data URIs and already local images
      if (imageUrl.startsWith('data:') || imageUrl.startsWith('/')) {
        continue;
      }
      
      const localPath = await downloadImage(imageUrl, slug, imageIndex);
      processedHtml = processedHtml.replace(imageUrl, localPath);
      imageIndex++;
    } catch (error) {
      console.warn(`    Could not process image: ${error.message}`);
    }
  }
  
  return processedHtml;
}

// Sanitize slug
function sanitizeSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// Extract excerpt from content
function extractExcerpt(html, maxLength = 160) {
  if (!html) return '';
  
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

// Scrape Wix blog posts
async function scrapeWixBlog() {
  console.log('Starting Wix blog import...\n');
  
  await ensureDirectories();
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    console.log(`Navigating to: ${WIX_BLOG_URL}`);
    await page.goto(WIX_BLOG_URL, { 
      waitUntil: 'networkidle0', 
      timeout: 60000 
    });
    
    // Wait for blog posts to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Scroll to load more posts if pagination exists
    let previousHeight = 0;
    let scrollAttempts = 0;
    const maxScrolls = 10;
    
    while (scrollAttempts < maxScrolls) {
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newHeight = await page.evaluate('document.body.scrollHeight');
      if (newHeight === previousHeight) break;
      scrollAttempts++;
    }
    
    // Extract all blog post links
    const postLinks = await page.evaluate(() => {
      const links = [];
      const articleLinks = document.querySelectorAll('a[href*="/blog/"], a[href*="/post/"]');
      
      articleLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !links.includes(href)) {
          links.push(href);
        }
      });
      
      return links;
    });
    
    console.log(`Found ${postLinks.length} blog post links\n`);
    
    const posts = [];
    
    // Scrape each post
    for (let i = 0; i < postLinks.length; i++) {
      const postLink = postLinks[i];
      const fullUrl = postLink.startsWith('http') 
        ? postLink 
        : `https://robertdcashman.wixsite.com${postLink}`;
      
      console.log(`[${i + 1}/${postLinks.length}] Scraping: ${fullUrl}`);
      
      try {
        const postPage = await browser.newPage();
        await postPage.goto(fullUrl, { 
          waitUntil: 'networkidle0', 
          timeout: 60000 
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const postData = await postPage.evaluate(() => {
          // Extract title
          const titleEl = document.querySelector('h1, [data-testid="richTextElement"] h1, .blog-post-title');
          const title = titleEl ? titleEl.textContent.trim() : document.title;
          
          // Extract content
          const contentEl = document.querySelector('article, .blog-post-content, [data-testid="richTextElement"]');
          let content = '';
          
          if (contentEl) {
            content = contentEl.innerHTML;
          } else {
            // Fallback: get all paragraph content
            const paragraphs = Array.from(document.querySelectorAll('p, h2, h3, ul, ol, li'));
            content = paragraphs.map(p => p.outerHTML).join('\n');
          }
          
          // Extract date
          const dateEl = document.querySelector('[data-testid="date"], .blog-date, time');
          let date = null;
          if (dateEl) {
            date = dateEl.getAttribute('datetime') || dateEl.textContent.trim();
          }
          
          // Extract images
          const images = Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src,
            alt: img.alt || ''
          }));
          
          return { title, content, date, images };
        });
        
        await postPage.close();
        
        if (!postData.title || !postData.content) {
          console.log(`  ⚠️  Skipping: Missing title or content`);
          continue;
        }
        
        const slug = sanitizeSlug(postData.title);
        
        // Process images in content
        let processedContent = postData.content;
        for (let imgIndex = 0; imgIndex < postData.images.length; imgIndex++) {
          const img = postData.images[imgIndex];
          if (img.src && !img.src.startsWith('data:')) {
            try {
              const localPath = await downloadImage(img.src, slug, imgIndex);
              processedContent = processedContent.replace(img.src, localPath);
            } catch (error) {
              console.warn(`    Could not download image: ${error.message}`);
            }
          }
        }
        
        // Clean up Wix-specific scripts and styles
        processedContent = processedContent
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/data-testid="[^"]*"/g, '')
          .replace(/class="[^"]*"/g, '')
          .replace(/wix-[^"'\s]*/g, '');
        
        // Parse date
        let publishedDate = null;
        if (postData.date) {
          try {
            publishedDate = new Date(postData.date).toISOString();
          } catch (e) {
            // Use current date if parsing fails
            publishedDate = new Date().toISOString();
          }
        } else {
          publishedDate = new Date().toISOString();
        }
        
        posts.push({
          title: postData.title,
          slug: slug,
          content: processedContent,
          excerpt: extractExcerpt(processedContent),
          published: true,
          published_at: publishedDate,
          source_url: fullUrl,
        });
        
        console.log(`  ✓ Extracted: "${postData.title}"`);
        
      } catch (error) {
        console.error(`  ✗ Error scraping ${fullUrl}: ${error.message}`);
      }
    }
    
    await browser.close();
    
    console.log(`\n✓ Scraped ${posts.length} posts\n`);
    return posts;
    
  } catch (error) {
    await browser.close();
    throw error;
  }
}

// Import posts into database
async function importPosts(posts) {
  const db = new Database(DB_PATH);
  
  // Get admin user ID
  const adminUser = db.prepare('SELECT id FROM users LIMIT 1').get();
  const authorId = adminUser ? adminUser.id : 1;
  
  let imported = 0;
  let skipped = 0;
  const errors = [];
  
  console.log('Importing posts into database...\n');
  
  for (const post of posts) {
    try {
      // Check if post already exists
      const existing = db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(post.slug);
      
      if (existing) {
        console.log(`⏭️  Skipping (already exists): ${post.title}`);
        skipped++;
        continue;
      }
      
      // Auto-generate SEO fields
      const metaTitle = `${post.title} | Police Station Solicitor Kent`;
      const metaDescription = post.excerpt || `${post.title}. Expert police station representation in Kent. Available 24/7.`;
      
      const stmt = db.prepare(`
        INSERT INTO blog_posts 
        (title, slug, content, excerpt, published, published_at, author_id, meta_title, meta_description, location, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      
      stmt.run(
        post.title,
        post.slug,
        post.content,
        post.excerpt,
        1, // published
        post.published_at,
        authorId,
        metaTitle,
        metaDescription,
        'Kent'
      );
      
      console.log(`✓ Imported: ${post.title}`);
      imported++;
      
    } catch (error) {
      console.error(`✗ Error importing "${post.title}": ${error.message}`);
      errors.push({ title: post.title, error: error.message });
    }
  }
  
  db.close();
  
  console.log(`\n=== Import Summary ===`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log(`Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log(`\nErrors:`);
    errors.forEach(e => console.log(`  - ${e.title}: ${e.error}`));
  }
  
  return { imported, skipped, errors };
}

// Main execution
async function main() {
  try {
    const posts = await scrapeWixBlog();
    
    if (posts.length === 0) {
      console.log('No posts found to import.');
      process.exit(0);
    }
    
    const result = await importPosts(posts);
    
    console.log(`\n✓ Import complete!`);
    console.log(`\nNext steps:`);
    console.log(`1. Check /blog to see imported posts`);
    console.log(`2. Review posts in admin area: /admin`);
    console.log(`3. Edit any posts that need adjustments`);
    
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();

