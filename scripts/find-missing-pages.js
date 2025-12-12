#!/usr/bin/env node

/**
 * Find missing pages by checking common routes on policestationagent.com
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const PSA_URL = 'https://policestationagent.com';
const APP_DIR = path.join(__dirname, '..', 'app');

// Pages to check based on the screenshot and common patterns
const PAGES_TO_CHECK = [
  'kent-police-station-reps',
  'police-station-reps-kent',
  'kent-police-station-representatives',
  'police-station-representatives-kent',
];

async function checkPageExists(browser, route) {
  const url = `${PSA_URL}/${route}`;
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    const exists = await page.evaluate(() => {
      // Check if page has content (not 404)
      const main = document.querySelector('main') || document.body;
      const text = main ? main.textContent : '';
      
      if (text.includes('404') || text.includes('Page Not Found') || text.length < 200) {
        return false;
      }
      return true;
    });
    
    await page.close();
    return exists;
  } catch (error) {
    await page.close();
    return false;
  }
}

async function checkLocalPage(route) {
  const filePath = path.join(__dirname, '..', `app/${route}/page.tsx`);
  try {
    await fs.access(filePath);
    const content = await fs.readFile(filePath, 'utf-8');
    // Check if it has actual content (not just 404)
    if (content.includes('Page Not Found') || content.includes('404')) {
      return { exists: true, hasContent: false };
    }
    return { exists: true, hasContent: true };
  } catch (error) {
    return { exists: false, hasContent: false };
  }
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  CHECKING FOR MISSING PAGES`);
  console.log(`${'═'.repeat(70)}\n`);

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const missing = [];
    const existing = [];
    
    for (const route of PAGES_TO_CHECK) {
      console.log(`Checking: ${route}`);
      
      const local = await checkLocalPage(route);
      const psaExists = await checkPageExists(browser, route);
      
      if (psaExists && !local.exists) {
        console.log(`  ❌ MISSING: ${route} exists on PSA but not locally`);
        missing.push(route);
      } else if (psaExists && local.exists && !local.hasContent) {
        console.log(`  ⚠️  EXISTS BUT EMPTY: ${route} exists but has no content`);
        missing.push(route);
      } else if (psaExists) {
        console.log(`  ✅ EXISTS: ${route}`);
        existing.push(route);
      } else {
        console.log(`  ℹ️  NOT ON PSA: ${route} doesn't exist on original site`);
      }
      
      await new Promise(r => setTimeout(r, 500));
    }
    
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  SUMMARY`);
    console.log(`${'═'.repeat(70)}`);
    console.log(`  ✅ Existing: ${existing.length} pages`);
    console.log(`  ❌ Missing: ${missing.length} pages`);
    
    if (missing.length > 0) {
      console.log(`\n  Missing pages:`);
      missing.forEach(route => console.log(`    - ${route}`));
    }
    
    console.log(`${'═'.repeat(70)}\n`);
    
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
