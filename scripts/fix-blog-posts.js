#!/usr/bin/env node

/**
 * Fix blog posts - re-scrape with better content extraction
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const PSA_URL = 'https://policestationagent.com';
const BLOG_DATA_FILE = path.join(__dirname, '..', 'data', 'blog-posts.json');

// List of blog post slugs to scrape
const BLOG_SLUGS = [
  'what-is-the-police-caution',
  'the-hidden-risks-of-voluntary-police-interviews-or-informal-chats-in-the-uk-you-need-to-know',
  'what-happens-at-a-police-station-voluntary-interview',
  'voluntary-interviews-with-police',
  'criminal-law-faq-your-rights-and-legal-representation-in-kent',
  'understanding-police-cautions-in-england-and-wales-their-impact-on-employment-and-travel',
  'police-voluntary-interview-questions',
  'can-you-get-free-legal-advice-at-the-police-station',
  'understanding-police-cautions-in-england-a-comprehensive-guide-to-their-meaning-and-consequences',
];

async function scrapeBlogPost(browser, slug) {
  const page = await browser.newPage();
  
  try {
    // Try /post?slug= format first (this seems to be the actual format)
    const url = `${PSA_URL}/post?slug=${slug}`;
    console.log(`  📥 Scraping: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    
    const data = await page.evaluate(() => {
      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]');
      const description = metaDesc ? metaDesc.getAttribute('content') || '' : '';
      
      // Try to find the actual blog post content
      // Look for article, main, or content containers
      let mainContent = null;
      
      // Try multiple selectors
      const selectors = [
        'article',
        'main article',
        '[role="main"]',
        '.post-content',
        '.article-content',
        '.blog-post',
        'main',
        '#content',
        '.content',
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent && element.textContent.length > 500) {
          mainContent = element;
          break;
        }
      }
      
      // If no main content found, try to find the largest content block
      if (!mainContent) {
        const allDivs = Array.from(document.querySelectorAll('div'));
        mainContent = allDivs.reduce((largest, div) => {
          const text = div.textContent || '';
          return text.length > (largest?.textContent?.length || 0) ? div : largest;
        }, null);
      }
      
      let html = '';
      if (mainContent) {
        const clone = mainContent.cloneNode(true);
        // Remove scripts, styles, navigation, etc.
        clone.querySelectorAll('script, style, noscript, nav, header, footer, .header, .footer, .nav, .cookie-banner, [class*="cookie"], [id*="cookie"], [class*="sidebar"], [class*="widget"]').forEach(el => el.remove());
        html = clone.innerHTML;
      }
      
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
      
      // Check if we got actual content (not a 404)
      const is404 = html.includes('404') || html.includes('Page Not Found') || html.includes('not found') || html.length < 500;
      
      return { title, description, html, publishedAt, author, is404 };
    });
    
    await page.close();
    
    if (data.is404 || !data.html || data.html.length < 500) {
      console.log(`    ⚠️  Content appears to be 404 or too short`);
      return null;
    }
    
    return data;
  } catch (error) {
    await page.close();
    console.error(`    ❌ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  FIXING BLOG POSTS - Re-scraping Content`);
  console.log(`${'═'.repeat(70)}\n`);

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Load existing blog posts
    let blogPosts = {};
    try {
      const existing = await fs.readFile(BLOG_DATA_FILE, 'utf-8');
      blogPosts = JSON.parse(existing);
    } catch {
      // File doesn't exist or is invalid
    }
    
    let success = 0;
    let failed = 0;
    
    for (let i = 0; i < BLOG_SLUGS.length; i++) {
      const slug = BLOG_SLUGS[i];
      console.log(`[${i + 1}/${BLOG_SLUGS.length}] Processing: ${slug}`);
      
      try {
        const postData = await scrapeBlogPost(browser, slug);
        
        if (postData) {
          // Clean content - update internal links
          let cleanContent = postData.html
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
          console.log(`    ✅ Successfully scraped`);
        } else {
          console.log(`    ⚠️  Failed to get content`);
          failed++;
        }
      } catch (error) {
        console.error(`    ❌ Error: ${error.message}`);
        failed++;
      }
      
      await new Promise(r => setTimeout(r, 2000)); // Rate limiting
    }
    
    // Save updated blog posts
    await fs.writeFile(BLOG_DATA_FILE, JSON.stringify(blogPosts, null, 2), 'utf-8');
    
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  RESULTS`);
    console.log(`${'═'.repeat(70)}`);
    console.log(`  ✅ Successfully scraped: ${success} posts`);
    console.log(`  ❌ Failed: ${failed} posts`);
    console.log(`  📦 Blog data saved to: ${BLOG_DATA_FILE}`);
    console.log(`${'═'.repeat(70)}\n`);
    
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);



