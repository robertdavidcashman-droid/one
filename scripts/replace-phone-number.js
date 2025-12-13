const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/TSX/JS files in app, components, and config directories
const files = glob.sync('{app,components,config}/**/*.{ts,tsx,js}', { 
  ignore: ['**/node_modules/**', '**/.next/**'] 
});

let updatedCount = 0;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace all variations of the new phone number with the old one
    // Display format: 0333 0497 036 -> 01732 247427
    content = content.replace(/0333 0497 036/g, '01732 247427');
    content = content.replace(/0333 049 7036/g, '01732 247427');
    
    // Tel link format: tel:03330497036 -> tel:01732247427
    content = content.replace(/tel:03330497036/g, 'tel:01732247427');
    
    // Raw format: 03330497036 -> 01732247427
    content = content.replace(/03330497036/g, '01732247427');
    
    // International format for WhatsApp: 4475330497036 -> 447732247427
    content = content.replace(/4475330497036/g, '447732247427');
    
    // WhatsApp links: https://wa.me/4475330497036 -> https://wa.me/447732247427
    content = content.replace(/https:\/\/wa\.me\/4475330497036/g, 'https://wa.me/447732247427');
    
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
