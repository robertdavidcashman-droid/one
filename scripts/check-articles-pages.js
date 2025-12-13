#!/usr/bin/env node

/**
 * Check for missing article pages from the Articles menu
 */

const fs = require('fs').promises;
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'app');

// Articles from the dropdown menu in the screenshot
const ARTICLE_PAGES = [
  'vulnerable-adults-in-custody',
  'preparing-for-police-interview',
  'importance-of-early-legal-advice',
  'arrival-times-delays',
  'booking-in-procedure-in-kent',
  'what-to-do-if-a-loved-one-is-arrested',
];

async function checkLocalPage(route) {
  const filePath = path.join(__dirname, '..', `app/${route}/page.tsx`);
  try {
    await fs.access(filePath);
    const content = await fs.readFile(filePath, 'utf-8');
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
  console.log(`  CHECKING ARTICLE PAGES`);
  console.log(`${'═'.repeat(70)}\n`);

  const missing = [];
  const existing = [];
  
  for (const route of ARTICLE_PAGES) {
    const local = await checkLocalPage(route);
    
    if (!local.exists) {
      console.log(`  ❌ MISSING: ${route}`);
      missing.push(route);
    } else if (!local.hasContent) {
      console.log(`  ⚠️  EXISTS BUT EMPTY: ${route}`);
      missing.push(route);
    } else {
      console.log(`  ✅ EXISTS: ${route}`);
      existing.push(route);
    }
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
}

main().catch(console.error);













