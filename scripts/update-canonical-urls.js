#!/usr/bin/env node

/**
 * Script to update all canonical URLs from criminaldefencekent.co.uk to policestationagent.com
 * Also updates OpenGraph URLs and siteName references
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const OLD_DOMAIN = 'criminaldefencekent.co.uk';
const NEW_DOMAIN = 'policestationagent.com';
const OLD_SITE_NAME = 'Criminal Defence Kent';
const NEW_SITE_NAME = 'Police Station Agent';

async function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace canonical URLs
  const canonicalRegex = new RegExp(`https://${OLD_DOMAIN.replace(/\./g, '\\.')}`, 'g');
  if (canonicalRegex.test(content)) {
    content = content.replace(canonicalRegex, `https://${NEW_DOMAIN}`);
    modified = true;
  }

  // Replace OpenGraph URLs
  const ogUrlRegex = new RegExp(`url:\\s*["']https://${OLD_DOMAIN.replace(/\./g, '\\.')}`, 'g');
  if (ogUrlRegex.test(content)) {
    content = content.replace(ogUrlRegex, `url: "https://${NEW_DOMAIN}`);
    modified = true;
  }

  // Replace siteName
  const siteNameRegex = new RegExp(`siteName:\\s*["']${OLD_SITE_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'g');
  if (siteNameRegex.test(content)) {
    content = content.replace(siteNameRegex, `siteName: '${NEW_SITE_NAME}'`);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated: ${filePath}`);
    return true;
  }
  return false;
}

async function main() {
  console.log('Updating canonical URLs from criminaldefencekent.co.uk to policestationagent.com...\n');

  // Find all TypeScript/TSX files in app directory
  const files = await glob('app/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/.next/**'],
  });

  let updatedCount = 0;
  for (const file of files) {
    if (await updateFile(file)) {
      updatedCount++;
    }
  }

  // Also check components directory
  const componentFiles = await glob('components/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/.next/**'],
  });

  for (const file of componentFiles) {
    if (await updateFile(file)) {
      updatedCount++;
    }
  }

  console.log(`\n✓ Updated ${updatedCount} files`);
}

main().catch(console.error);

