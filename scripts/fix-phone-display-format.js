#!/usr/bin/env node

/**
 * Fix phone number display formatting
 * Changes "03330497036" to "0333 049 7036" in display text (not in tel: links)
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

async function fixPhoneDisplay(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Replace 03330497036 with 0333 049 7036, but NOT in tel: links
    // We'll replace it everywhere, then restore tel: links
    let updated = content;
    
    // First, replace tel: links with a placeholder
    const telLinkRegex = /(href=["']tel:)(03330497036)(["'])/gi;
    const telPlaceholders = [];
    let match;
    let placeholderIndex = 0;
    
    while ((match = telLinkRegex.exec(content)) !== null) {
      const placeholder = `__TEL_PLACEHOLDER_${placeholderIndex}__`;
      telPlaceholders.push({ placeholder, original: match[0] });
      updated = updated.replace(match[0], placeholder);
      placeholderIndex++;
    }
    
    // Now replace all remaining instances of 03330497036 with formatted version
    updated = updated.replace(/03330497036/g, '0333 049 7036');
    
    // Restore tel: links
    telPlaceholders.forEach(({ placeholder, original }) => {
      updated = updated.replace(placeholder, original);
    });
    
    if (updated !== content) {
      await fs.writeFile(filePath, updated, 'utf-8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  FIXING PHONE NUMBER DISPLAY FORMATTING`);
  console.log(`  Formatting display text: 03330497036 → 0333 049 7036`);
  console.log(`  Preserving tel: links: tel:03330497036 (unchanged)`);
  console.log(`${'═'.repeat(70)}\n`);

  const files = await glob('**/*.{tsx,ts,js,jsx}', {
    cwd: path.join(__dirname, '..'),
    ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**', 'scripts/**'],
  });

  let updated = 0;

  for (const file of files) {
    const filePath = path.join(__dirname, '..', file);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      if (content.includes('03330497036')) {
        console.log(`  📝 Fixing: ${file}`);
        if (await fixPhoneDisplay(filePath)) {
          updated++;
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  RESULTS`);
  console.log(`${'═'.repeat(70)}`);
  console.log(`  ✅ Files updated: ${updated}`);
  console.log(`${'═'.repeat(70)}\n`);
}

main().catch(console.error);













