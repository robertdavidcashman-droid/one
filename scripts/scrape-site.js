/**
 * Automated Site Scraper for policestationagent.com
 * 
 * This script uses Puppeteer to scrape all pages from the live site
 * and save them as HTML files for rebuilding.
 * 
 * Usage:
 *   node scripts/scrape-site.js                    # Scrape all pages
 *   node scripts/scrape-site.js --page /about      # Scrape specific page
 *   node scripts/scrape-site.js --list             # Show available pages
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'https://policestationagent.com';
const OUTPUT_DIR = path.join(__dirname, '..', 'legacy', 'scraped');

// List of pages to scrape (from sitemap analysis)
const PAGES_TO_SCRAPE = [
  '/',
  '/home',
  '/about',
  '/contact',
  '/blog',
  '/services',
  '/police-stations',
  '/coverage',
  '/faq',
  '/for-solicitors',
  '/for-clients',
  '/voluntary-interviews',
  '/why-use-us',
  '/what-we-do',
  '/what-is-a-police-station-rep',
  '/what-is-a-criminal-solicitor',
  '/after-a-police-interview',
  '/privacy',
  '/terms-and-conditions',
  '/complaints',
  '/accessibility',
  '/cookies',
  '/gdpr',
];

// Blog post slugs (from previous extraction)
const BLOG_POSTS = [
  'what-is-the-police-caution',
  'the-hidden-risks-of-voluntary-police-interviews-or-informal-chats-in-uk-you-need-to-know',
  'what-happens-at-a-police-station-voluntary-interview',
  'voluntary-interviews-with-police',
  'criminal-law-faq-your-rights-and-legal-representation-in-kent',
  'understanding-police-cautions-in-england-and-wales-their-impact-on-employment-and-travel',
  'police-voluntary-interview-questions',
  'can-you-get-free-legal-advice-at-the-police-station',
  'understanding-police-cautions-in-england-a-comprehensive-guide-to-their-meaning-and-consequences',
];

// Police station slugs (from database)
const POLICE_STATIONS = [
  'maidstone',
  'medway',
  'canterbury',
  'gravesend',
  'tonbridge',
  'sittingbourne',
  'swanley',
  'ashford',
  'folkestone',
  'dover',
  'bluewater',
  'sevenoaks',
  'tunbridge-wells',
  'coldharbour',
  'margate',
  'north-kent',
];

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

function sanitizeFilename(url) {
  return url
    .replace(/^\//, '')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9-]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'home';
}

async function scrapePage(browser, url, outputPath) {
  console.log(`Scraping: ${url}`);
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate and wait for content to load
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait a bit more for React to fully render
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get the full HTML
    const html = await page.content();
    
    // Get page title for filename
    const title = await page.title();
    
    // Save HTML
    await fs.writeFile(outputPath, html, 'utf8');
    
    console.log(`✅ Saved: ${outputPath} (${title})`);
    
    await page.close();
    return { success: true, title, url };
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error.message);
    return { success: false, url, error: error.message };
  }
}

async function scrapeAll() {
  console.log('🚀 Starting automated site scrape...\n');
  
  // Ensure output directory exists
  await ensureDir(OUTPUT_DIR);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    success: [],
    failed: []
  };
  
  try {
    // Scrape main pages
    console.log('📄 Scraping main pages...\n');
    for (const pagePath of PAGES_TO_SCRAPE) {
      const url = `${BASE_URL}${pagePath}`;
      const filename = sanitizeFilename(pagePath) + '.html';
      const outputPath = path.join(OUTPUT_DIR, filename);
      
      const result = await scrapePage(browser, url, outputPath);
      if (result.success) {
        results.success.push(result);
      } else {
        results.failed.push(result);
      }
      
      // Be respectful - wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Scrape blog posts
    console.log('\n📝 Scraping blog posts...\n');
    for (const slug of BLOG_POSTS) {
      const url = `${BASE_URL}/post?slug=${slug}`;
      const filename = `blog-${slug}.html`;
      const outputPath = path.join(OUTPUT_DIR, filename);
      
      const result = await scrapePage(browser, url, outputPath);
      if (result.success) {
        results.success.push(result);
      } else {
        results.failed.push(result);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Scrape police station pages
    console.log('\n🏢 Scraping police station pages...\n');
    for (const slug of POLICE_STATIONS) {
      const url = `${BASE_URL}/police-stations/${slug}`;
      const filename = `station-${slug}.html`;
      const outputPath = path.join(OUTPUT_DIR, filename);
      
      const result = await scrapePage(browser, url, outputPath);
      if (result.success) {
        results.success.push(result);
      } else {
        results.failed.push(result);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } finally {
    await browser.close();
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Scraping Summary');
  console.log('='.repeat(50));
  console.log(`✅ Successfully scraped: ${results.success.length} pages`);
  console.log(`❌ Failed: ${results.failed.length} pages`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed pages:');
    results.failed.forEach(r => console.log(`   - ${r.url}: ${r.error}`));
  }
  
  // Save results summary
  const summaryPath = path.join(OUTPUT_DIR, 'scraping-summary.json');
  await fs.writeFile(summaryPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n📄 Summary saved to: ${summaryPath}`);
}

async function scrapeSinglePage(pagePath) {
  console.log(`🚀 Scraping single page: ${pagePath}\n`);
  
  await ensureDir(OUTPUT_DIR);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const url = pagePath.startsWith('http') ? pagePath : `${BASE_URL}${pagePath}`;
    const filename = sanitizeFilename(pagePath) + '.html';
    const outputPath = path.join(OUTPUT_DIR, filename);
    
    const result = await scrapePage(browser, url, outputPath);
    
    if (result.success) {
      console.log(`\n✅ Successfully scraped: ${result.title}`);
      console.log(`📁 Saved to: ${outputPath}`);
    } else {
      console.error(`\n❌ Failed to scrape: ${result.error}`);
    }
  } finally {
    await browser.close();
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--list')) {
  console.log('📋 Available pages to scrape:\n');
  console.log('Main Pages:');
  PAGES_TO_SCRAPE.forEach(p => console.log(`  - ${p}`));
  console.log('\nBlog Posts:');
  BLOG_POSTS.forEach(slug => console.log(`  - /post?slug=${slug}`));
  console.log('\nPolice Stations:');
  POLICE_STATIONS.forEach(slug => console.log(`  - /police-stations/${slug}`));
} else if (args.includes('--page')) {
  const pageIndex = args.indexOf('--page');
  const pagePath = args[pageIndex + 1];
  if (pagePath) {
    scrapeSinglePage(pagePath).catch(console.error);
  } else {
    console.error('❌ Please provide a page path: --page /about');
  }
} else {
  scrapeAll().catch(console.error);
}

