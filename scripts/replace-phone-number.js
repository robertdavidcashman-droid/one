const fs = require('fs').promises;
const path = require('path');

const OLD_PHONE_DISPLAY = '01732 247427';
const OLD_PHONE_DISPLAY_VARIANTS = [
  '01732 247427',
  '01732 247 427',
  '01732247427',
  '01732-247-427',
  '01732-247427',
  '(01732) 247427',
  '01732 247 427',
];
const OLD_PHONE_TEL = '01732247427';
const NEW_PHONE_DISPLAY = '0333 049 7036'; // Display format with spaces
const NEW_PHONE_TEL = '03330497036'; // tel: format without spaces

const APP_DIR = path.join(__dirname, '..', 'app');
const COMPONENTS_DIR = path.join(__dirname, '..', 'components');

async function findFiles(dir, fileList = []) {
  const files = await fs.readdir(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== 'node_modules' && file !== '.next' && !file.startsWith('.')) {
        await findFiles(filePath, fileList);
      }
    } else if (file.match(/\.(tsx|ts|jsx|js)$/)) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

async function replaceInFile(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  let updated = false;
  let replacements = 0;

  // Replace display phone numbers (with spaces, dashes, etc.)
  for (const variant of OLD_PHONE_DISPLAY_VARIANTS) {
    const regex = new RegExp(variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    if (regex.test(content)) {
      content = content.replace(regex, NEW_PHONE_DISPLAY);
      replacements++;
      updated = true;
    }
  }

  // Replace tel: links (no spaces) - handle both with and without spaces in tel:
  const telRegex1 = new RegExp(`tel:${OLD_PHONE_TEL}`, 'gi');
  const telRegex2 = new RegExp(`tel:01732[\\s-]*247[\\s-]*427`, 'gi');
  if (telRegex1.test(content)) {
    content = content.replace(telRegex1, `tel:${NEW_PHONE_TEL}`);
    replacements++;
    updated = true;
  }
  if (telRegex2.test(content)) {
    content = content.replace(telRegex2, `tel:${NEW_PHONE_TEL}`);
    replacements++;
    updated = true;
  }
  
  // Also ensure all tel:0333 links use the correct format (no spaces)
  const telNewRegex = new RegExp(`tel:0333[\\s-]*049[\\s-]*7036`, 'gi');
  if (telNewRegex.test(content)) {
    content = content.replace(telNewRegex, `tel:${NEW_PHONE_TEL}`);
    replacements++;
    updated = true;
  }

  // Replace in href attributes (with spaces in tel:)
  const hrefRegex1 = new RegExp(`href=["']tel:${OLD_PHONE_TEL.replace(/\s/g, '')}["']`, 'gi');
  if (hrefRegex1.test(content)) {
    content = content.replace(hrefRegex1, `href="tel:${NEW_PHONE_TEL}"`);
    replacements++;
    updated = true;
  }
  
  // Replace tel: with spaces
  const telWithSpacesRegex = new RegExp(`tel:01732\\s*247\\s*427`, 'gi');
  if (telWithSpacesRegex.test(content)) {
    content = content.replace(telWithSpacesRegex, `tel:${NEW_PHONE_TEL}`);
    replacements++;
    updated = true;
  }

  // Replace in HTML content (dangerouslySetInnerHTML blocks)
  // This handles cases where the phone number is in embedded HTML
  const htmlPhoneRegex = new RegExp(`01732[\\s-]*247[\\s-]*427`, 'gi');
  if (htmlPhoneRegex.test(content)) {
    content = content.replace(htmlPhoneRegex, NEW_PHONE_DISPLAY);
    replacements++;
    updated = true;
  }
  
  // Replace in HTML tel: links
  const htmlTelRegex = new RegExp(`tel:01732[\\s-]*247[\\s-]*427`, 'gi');
  if (htmlTelRegex.test(content)) {
    content = content.replace(htmlTelRegex, `tel:${NEW_PHONE_TEL}`);
    replacements++;
    updated = true;
  }

  if (updated) {
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`  ✅ ${filePath} (${replacements} replacements)`);
  }

  return { updated, replacements };
}

async function main() {
  console.log('🔍 Finding all files...');
  const appFiles = await findFiles(APP_DIR);
  const componentFiles = await findFiles(COMPONENTS_DIR);
  const files = [...appFiles, ...componentFiles];
  console.log(`📁 Found ${files.length} files\n`);

  console.log('🔄 Replacing phone numbers...\n');
  let totalFiles = 0;
  let totalReplacements = 0;

  for (const file of files) {
    try {
      const { updated, replacements } = await replaceInFile(file);
      if (updated) {
        totalFiles++;
        totalReplacements += replacements;
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${file}: ${error.message}`);
    }
  }

  console.log(`\n✅ Complete!`);
  console.log(`   Files updated: ${totalFiles}`);
  console.log(`   Total replacements: ${totalReplacements}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { replaceInFile, findFiles };
