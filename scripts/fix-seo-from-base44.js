const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'app');
const CORRECT_DOMAIN = 'https://criminaldefencekent.co.uk';
const OLD_DOMAIN = 'https://policestationagent.com';

let filesUpdated = 0;
let totalReplacements = 0;

function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
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
  let replacements = 0;
  
  // Fix canonical URLs
  const escapedOldDomain = OLD_DOMAIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const canonicalPatterns = [
    new RegExp(`canonical:\\s*["']${escapedOldDomain}([^"']*)["']`, 'g'),
    new RegExp(`canonical:\\s*[\`]${escapedOldDomain}([^\`]*)[\`]`, 'g'),
  ];
  
  canonicalPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, (match) => {
        const urlMatch = match.match(/(["'`])([^"'`]+)(["'`])/);
        if (urlMatch) {
          const url = urlMatch[2];
          if (url.startsWith(OLD_DOMAIN)) {
            const path = url.replace(OLD_DOMAIN, '');
            replacements++;
            return match.replace(OLD_DOMAIN, CORRECT_DOMAIN);
          }
        }
        return match;
      });
      updated = true;
    }
  });
  
  // Fix OpenGraph URLs
  const ogUrlPattern = new RegExp(`url:\\s*["']${escapedOldDomain}([^"']*)["']`, 'g');
  if (ogUrlPattern.test(content)) {
    content = content.replace(ogUrlPattern, (match) => {
      replacements++;
      return match.replace(OLD_DOMAIN, CORRECT_DOMAIN);
    });
    updated = true;
  }
  
  // Fix siteUrl variables that default to old domain
  const siteUrlPattern = new RegExp(`siteUrl\\s*=\\s*process\\.env\\.NEXT_PUBLIC_SITE_URL\\s*\\|\\|\\s*['"]${escapedOldDomain}['"]`, 'g');
  if (siteUrlPattern.test(content)) {
    content = content.replace(siteUrlPattern, (match) => {
      replacements++;
      return match.replace(OLD_DOMAIN, CORRECT_DOMAIN);
    });
    updated = true;
  }
  
  // Fix schema.org URLs
  const schemaUrlPattern = new RegExp(`['"]${OLD_DOMAIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^"']*)['"]`, 'g');
  const schemaMatches = content.match(schemaUrlPattern);
  if (schemaMatches && (content.includes('@type') || content.includes('schema.org'))) {
    content = content.replace(schemaUrlPattern, (match) => {
      replacements++;
      return match.replace(OLD_DOMAIN, CORRECT_DOMAIN);
    });
    updated = true;
  }
  
  // Add noindex to admin pages if not present
  if (filePath.includes('/admin/') && !content.includes('robots:') && !content.includes('noindex')) {
    // Find the metadata export
    const metadataPattern = /export\s+(const|async\s+function)\s+metadata[\s\S]*?\{[\s\S]*?\}/;
    const metadataMatch = content.match(metadataPattern);
    
    if (metadataMatch) {
      const metadataBlock = metadataMatch[0];
      if (!metadataBlock.includes('robots:')) {
        // Add robots noindex after title or description
        const insertPoint = metadataBlock.lastIndexOf('};');
        if (insertPoint > 0) {
          const newMetadata = metadataBlock.slice(0, insertPoint) + 
            `,\n  robots: {\n    index: false,\n    follow: false,\n  }` +
            metadataBlock.slice(insertPoint);
          content = content.replace(metadataPattern, newMetadata);
          updated = true;
          replacements++;
        }
      }
    }
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesUpdated++;
    totalReplacements += replacements;
    console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)} (${replacements} replacements)`);
  }
  
  return updated;
}

console.log('🔍 Scanning for SEO fixes from Base44 conversation...\n');

const files = findTsxFiles(APP_DIR);

files.forEach(file => {
  try {
    updateFile(file);
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✅ Complete! Updated ${filesUpdated} files with ${totalReplacements} total replacements.`);

