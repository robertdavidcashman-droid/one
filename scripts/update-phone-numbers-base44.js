const fs = require('fs');
const path = require('path');

// Update phone numbers from Base44 export format to current format
const OLD_PHONE = '01732 247 427';
const OLD_PHONE_TEL = '01732247427';
const NEW_PHONE = '0333 049 7036';
const NEW_PHONE_TEL = '03330497036';

const OLD_PHONE_ALT = '020 8242 1857';
const OLD_PHONE_ALT_TEL = '02082421857';

let filesUpdated = 0;
let replacements = 0;

function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      findTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  let fileReplacements = 0;
  
  // Replace phone numbers in tel: links
  if (content.includes(`tel:${OLD_PHONE_TEL}`)) {
    content = content.replace(new RegExp(`tel:${OLD_PHONE_TEL}`, 'g'), `tel:${NEW_PHONE_TEL}`);
    updated = true;
    fileReplacements++;
  }
  
  if (content.includes(`tel:${OLD_PHONE_ALT_TEL}`)) {
    content = content.replace(new RegExp(`tel:${OLD_PHONE_ALT_TEL}`, 'g'), `tel:${NEW_PHONE_TEL}`);
    updated = true;
    fileReplacements++;
  }
  
  // Replace phone numbers in display text
  if (content.includes(OLD_PHONE)) {
    content = content.replace(new RegExp(OLD_PHONE.replace(/ /g, '\\s+'), 'g'), NEW_PHONE);
    updated = true;
    fileReplacements++;
  }
  
  if (content.includes(OLD_PHONE_ALT)) {
    content = content.replace(new RegExp(OLD_PHONE_ALT.replace(/ /g, '\\s+'), 'g'), NEW_PHONE);
    updated = true;
    fileReplacements++;
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesUpdated++;
    replacements += fileReplacements;
    console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)} (${fileReplacements} replacements)`);
  }
  
  return updated;
}

console.log('🔍 Updating phone numbers from Base44 export...\n');

const APP_DIR = path.join(__dirname, '..', 'app');
const files = findTsxFiles(APP_DIR);

files.forEach(file => {
  try {
    updateFile(file);
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✅ Complete! Updated ${filesUpdated} files with ${replacements} total replacements.`);



