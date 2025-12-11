/**
 * Re-scrape Pages That Show 404
 * Re-scrapes pages that have 404 content in their scraped files
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'https://policestationagent.com';
const OUTPUT_DIR = path.join(__dirname, '..', 'legacy', 'scraped');

const PAGES_TO_RESCrape = [
  '/police-stations',
  '/for-solicitors',
  '/for-clients',
  '/what-is-a-police-station-rep',
  '/what-is-a-criminal-solicitor',
  '/what-we-do',
  '/why-use-us',
  '/after-a-police-interview',
  '/voluntary-interviews',
  '/terms-and-conditions',
];

function sanitizeFilename(url) {
  try {
    const urlObj = new URL(url);
    let filename = urlObj.pathname.replace(/^\//, '').replace(/\/$/, '') || 'home';
    filename = filename.replace(/\//g, '-').replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-');
    return filename || 'home';
  } catch (e) {
    return 'unknown';
  }
}

async function scrapePage(browser, url) {
  console.log(`Scraping: ${url}`);
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait longer for React to render
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if page loaded correctly
    const title = await page.title();
    const content = await page.content();
    
    // Check for 404
    if (content.includes('404') || content.includes('Page Not Found') || title.includes('404')) {
      console.log(`  ⚠️  Page shows 404: ${url}`);
      await page.close();
      return { success: false, url, error: 'Page shows 404' };
    }
    
    const filename = sanitizeFilename(url) + '.html';
    const outputPath = path.join(OUTPUT_DIR, filename);
    await fs.writeFile(outputPath, content, 'utf8');
    
    console.log(`  ✅ Saved: ${filename} (${title})`);
    
    await page.close();
    return { success: true, title, url, filename };
  } catch (error) {
    console.error(`  ❌ Error scraping ${url}:`, error.message);
    return { success: false, url, error: error.message };
  }
}

async function main() {
  console.log('🔄 Re-scraping broken pages...\n');
  
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    success: [],
    failed: []
  };
  
  try {
    for (const pagePath of PAGES_TO_RESCrape) {
      const url = `${BASE_URL}${pagePath}`;
      const result = await scrapePage(browser, url);
      
      if (result.success) {
        results.success.push(result);
      } else {
        results.failed.push(result);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  } finally {
    await browser.close();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Re-scraping Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successfully scraped: ${results.success.length} pages`);
  console.log(`❌ Failed: ${results.failed.length} pages`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed pages:');
    results.failed.forEach(r => console.log(`   - ${r.url}: ${r.error}`));
  }
  
  if (results.success.length > 0) {
    console.log('\n✅ Now rebuilding pages from re-scraped HTML...');
    // Run the fix script
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    try {
      const { stdout } = await execPromise('node scripts/fix-404-pages.js', {
        cwd: path.join(__dirname, '..'),
        maxBuffer: 10 * 1024 * 1024
      });
      console.log(stdout);
    } catch (error) {
      console.error('Error rebuilding:', error.message);
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { scrapePage };



