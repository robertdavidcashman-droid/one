/**
 * Process Both HTML Files
 * Processes Services for Clients and Kent Police Station Coverage
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const LEGACY_DIR = path.join(__dirname, '..', 'legacy');
const APP_DIR = path.join(__dirname, '..', 'app');

const FILES_TO_PROCESS = [
  {
    filename: 'Services for Clients ｜ Police Station Agent (11_12_2025 12：15：37).html',
    route: '/for-clients',
    name: 'Services for Clients'
  },
  {
    filename: 'Kent Police Station Coverage ｜ Police Station Agent (11_12_2025 12：22：23).html',
    route: '/police-stations',
    name: 'Kent Police Station Coverage'
  }
];

function extractMainContent(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const selectors = [
    '#root > main',
    '#root main',
    'main',
    '[role="main"]',
    '#root > div > main',
    'body > main',
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent || '';
      if (text.includes('404') || text.includes('Page Not Found')) {
        continue;
      }
      
      const clone = element.cloneNode(true);
      clone.querySelectorAll('script, style, noscript, link[rel="stylesheet"], meta').forEach(el => el.remove());
      
      const content = clone.innerHTML.trim();
      if (content.length > 500) {
        return content;
      }
    }
  }
  
  // Fallback: find body content
  const body = document.body;
  if (body) {
    const allDivs = Array.from(body.querySelectorAll('div'));
    for (const div of allDivs) {
      const text = div.textContent || '';
      if (text.length > 1000 && !text.includes('404') && !text.includes('Page Not Found')) {
        const clone = div.cloneNode(true);
        clone.querySelectorAll('script, style, noscript, link, meta').forEach(el => el.remove());
        const content = clone.innerHTML.trim();
        if (content.length > 500) {
          return content;
        }
      }
    }
  }
  
  return null;
}

function extractMetadata(html, defaultTitle) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  return {
    title: document.querySelector('title')?.textContent?.trim() || defaultTitle,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
  };
}

function escapeForTemplate(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

async function processFile(fileConfig) {
  const { filename, route, name } = fileConfig;
  
  // Try multiple locations
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const downloadsDir = path.join(homeDir, 'Downloads');
  const desktopDir = path.join(homeDir, 'Desktop');
  const oneDriveDesktop = path.join(homeDir, 'OneDrive', 'Desktop');
  
  const possiblePaths = [
    path.join(LEGACY_DIR, filename),
    path.join(__dirname, '..', filename),
    path.join(downloadsDir, filename),
    path.join(desktopDir, filename),
    path.join(oneDriveDesktop, filename),
    filename, // If full path provided
  ];
  
  let filePath = null;
  for (const possiblePath of possiblePaths) {
    try {
      await fs.access(possiblePath);
      filePath = possiblePath;
      break;
    } catch (e) {
      // Continue to next path
    }
  }
  
  if (!filePath) {
    console.log(`❌ ${name}: File not found`);
    console.log(`   Looking for: ${filename}`);
    return false;
  }
  
  try {
    console.log(`\n📂 Processing: ${name}`);
    console.log(`   File: ${path.basename(filePath)}`);
    
    const html = await fs.readFile(filePath, 'utf8');
    console.log(`   Size: ${(html.length / 1024).toFixed(2)} KB`);
    
    const mainContent = extractMainContent(html);
    const metadata = extractMetadata(html, name);
    
    if (!mainContent || mainContent.length < 500) {
      console.log(`   ⚠️  Could not extract sufficient content (${mainContent ? mainContent.length : 0} chars)`);
      return false;
    }
    
    console.log(`   ✅ Extracted ${mainContent.length} characters`);
    console.log(`   📋 Title: ${metadata.title}`);
    
    // Update the page
    const routePath = route === '/' ? 'page.tsx' : route.replace(/^\//, '').replace(/\//g, '\\') + '\\page.tsx';
    const outputPath = path.join(APP_DIR, routePath);
    
    const existing = await fs.readFile(outputPath, 'utf8');
    const escapedContent = escapeForTemplate(mainContent);
    const canonical = metadata.canonical || `https://policestationagent.com${route}`;
    
    // Update metadata
    let updated = existing.replace(
      /title:\s*["'][^"']*["']/,
      `title: ${JSON.stringify(metadata.title)}`
    );
    
    if (metadata.description) {
      updated = updated.replace(
        /description:\s*["'][^"']*["']/,
        `description: ${JSON.stringify(metadata.description)}`
      );
    }
    
    updated = updated.replace(
      /canonical:\s*["'][^"']*["']/,
      `canonical: ${JSON.stringify(canonical)}`
    );
    
    // Update content
    updated = updated.replace(
      /dangerouslySetInnerHTML=\{\{ __html: `[^`]*` \}\}/s,
      `dangerouslySetInnerHTML={{ __html: \`${escapedContent}\` }}`
    );
    
    await fs.writeFile(outputPath, updated, 'utf8');
    console.log(`   ✅ Updated: ${route}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return false;
  }
}

async function main() {
  console.log('📝 Processing HTML Files\n');
  console.log('='.repeat(60));
  
  let successCount = 0;
  let failCount = 0;
  
  for (const fileConfig of FILES_TO_PROCESS) {
    const success = await processFile(fileConfig);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully processed: ${successCount} files`);
  console.log(`   ❌ Failed: ${failCount} files`);
  
  if (failCount > 0) {
    console.log(`\n💡 For files not found:`);
    console.log(`   1. Move them to: ${LEGACY_DIR}`);
    console.log(`   2. Or provide full paths when running the script`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processFile, extractMainContent };

