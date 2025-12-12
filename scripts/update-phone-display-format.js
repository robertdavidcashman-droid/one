const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/TSX files in app directory
const files = glob.sync('app/**/*.{ts,tsx}', { ignore: ['**/node_modules/**'] });

let updatedCount = 0;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace display format: 0333 049 7036 -> 0333 0497 036
    content = content.replace(/0333 049 7036/g, '0333 0497 036');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✓ Updated ${file}`);
      updatedCount++;
    }
  } catch (e) {
    console.log(`✗ Skipped ${file}: ${e.message}`);
  }
});

console.log(`\nUpdated ${updatedCount} files.`);

