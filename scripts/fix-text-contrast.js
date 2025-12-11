#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function fixTextContrast() {
  // Find all page.tsx files
  const files = await glob('app/**/page.tsx', { ignore: ['node_modules/**'] });
  
  let fixedCount = 0;
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Fix bg-card text-card-foreground -> bg-white text-slate-900
    if (content.includes('bg-card text-card-foreground')) {
      content = content.replace(/bg-card text-card-foreground/g, 'bg-white text-slate-900');
      modified = true;
    }
    
    // Fix bg-background (standalone, not bg-background/opacity) -> bg-white
    // But be careful not to replace bg-background/10 etc
    content = content.replace(/bg-background(?![\/\d])/g, 'bg-white');
    if (content !== fs.readFileSync(file, 'utf8')) {
      modified = true;
    }
    
    // Fix text-card-foreground -> text-slate-900
    if (content.includes('text-card-foreground')) {
      content = content.replace(/text-card-foreground/g, 'text-slate-900');
      modified = true;
    }
    
    // Fix text-slate-600 on light backgrounds -> text-slate-800 for better contrast
    // But only in specific contexts where it might be hard to read
    if (content.includes('text-slate-600') && (content.includes('bg-white') || content.includes('bg-slate-50'))) {
      // Only replace in prose/content areas, not in buttons or specific UI elements
      content = content.replace(/(prose[^"]*text-slate-600)/g, '$1'.replace('text-slate-600', 'text-slate-800'));
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      fixedCount++;
      console.log(`✅ Fixed: ${file}`);
    }
  }
  
  console.log(`\n✅ Fixed text contrast in ${fixedCount} files`);
}

fixTextContrast().catch(console.error);

