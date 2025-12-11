#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function scanPages(dir, prefix = '') {
  const emptyPages = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (['api', 'components', '_app', '_document', 'node_modules', '.next'].includes(item)) continue;
      if (item.startsWith('[')) continue;
      
      const pagePath = path.join(fullPath, 'page.tsx');
      if (fs.existsSync(pagePath)) {
        const content = fs.readFileSync(pagePath, 'utf8');
        const route = prefix + '/' + item;
        
        // Check for empty content markers
        if (content.includes('<div id="root">') && content.includes('</div>') && !content.includes('class=')) {
          emptyPages.push({ route, reason: 'Empty root div only' });
        } else if (content.includes('Content coming soon')) {
          emptyPages.push({ route, reason: 'Placeholder content' });
        } else if (content.length < 800) {
          emptyPages.push({ route, reason: 'Very short content' });
        }
      }
      
      // Recurse
      const nested = scanPages(fullPath, prefix + '/' + item);
      emptyPages.push(...nested);
    }
  }
  
  return emptyPages;
}

const appDir = path.join(process.cwd(), 'app');
const emptyPages = scanPages(appDir);

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║              PAGES WITH MISSING/EMPTY CONTENT                      ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

if (emptyPages.length === 0) {
  console.log('✅ All pages have content!');
} else {
  console.log(`Found ${emptyPages.length} pages with empty/missing content:\n`);
  for (const { route, reason } of emptyPages) {
    console.log(`❌ ${route}`);
    console.log(`   Reason: ${reason}\n`);
  }
}

