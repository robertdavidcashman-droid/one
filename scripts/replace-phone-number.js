#!/usr/bin/env node

/**
 * Replace all phone numbers from 01732 247427 to 0333 049 7036
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

const APP_DIR = path.join(__dirname, '..', 'app');
const SCRIPTS_DIR = path.join(__dirname, '..', 'scripts');

// Patterns to match the old phone number in various formats
const OLD_PATTERNS = [
  /01732\s*247\s*427/gi,
  /01732247427/gi,
  /01732-247-427/gi,
  /01732\.247\.427/gi,
  /\(01732\)\s*247\s*427/gi,
];

// New phone number formats (we'll use the format that matches the context)
const NEW_NUMBER = '0333 049 7036';
const NEW_NUMBER_TEL = '03330497036'; // For tel: links

async function replaceInFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    let updated = content;
    let changed = false;
    
    // Replace all variations of the old number
    for (const pattern of OLD_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        // Determine replacement format based on context
        if (content.includes('tel:') || content.includes('href="tel')) {
          // For tel: links, use format without spaces
          updated = updated.replace(pattern, NEW_NUMBER_TEL);
        } else {
          // For display text, use formatted version
          updated = updated.replace(pattern, NEW_NUMBER);
        }
        changed = true;
      }
    }
    
    if (changed) {
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
  console.log(`  REPLACING PHONE NUMBERS`);
  console.log(`  Old: 01732 247427 (all formats)`);
  console.log(`  New: 0333 049 7036`);
  console.log(`${'═'.repeat(70)}\n`);

  // Find all relevant files
  const files = await glob('**/*.{tsx,ts,js,jsx,json,md}', {
    cwd: path.join(__dirname, '..'),
    ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**'],
  });

  let updated = 0;
  let checked = 0;

  for (const file of files) {
    const filePath = path.join(__dirname, '..', file);
    
    // Check if file contains the old number
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const hasOldNumber = OLD_PATTERNS.some(pattern => pattern.test(content));
      
      if (hasOldNumber) {
        console.log(`  📝 Updating: ${file}`);
        if (await replaceInFile(filePath)) {
          updated++;
        }
      }
      checked++;
    } catch (error) {
      // Skip files that can't be read
    }
  }

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  RESULTS`);
  console.log(`${'═'.repeat(70)}`);
  console.log(`  ✅ Files updated: ${updated}`);
  console.log(`  📄 Files checked: ${checked}`);
  console.log(`${'═'.repeat(70)}\n`);
}

main().catch(console.error);

