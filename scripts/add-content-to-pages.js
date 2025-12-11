/**
 * Add Content to Pages
 * Helper script to add content to pages that are showing 404
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const LEGACY_DIR = path.join(__dirname, '..', 'legacy');
const APP_DIR = path.join(__dirname, '..', 'app');

// Check if original-services-for-solicitors-saved.html has content
async function extractContentFromOriginalFile() {
  const filePath = path.join(LEGACY_DIR, 'original-services-for-solicitors-saved.html');
  
  try {
    const html = await fs.readFile(filePath, 'utf8');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Try to find main content
    const main = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
    
    if (main) {
      // Check if it's a 404
      if (main.textContent.includes('404') || main.textContent.includes('Page Not Found')) {
        console.log('⚠️  Original file contains 404 content');
        return null;
      }
      
      // Clone and clean
      const clone = main.cloneNode(true);
      clone.querySelectorAll('script, style, noscript, link, meta').forEach(el => el.remove());
      
      return clone.innerHTML;
    }
    
    return null;
  } catch (error) {
    console.error('Error reading original file:', error.message);
    return null;
  }
}

async function updatePageWithContent(route, content) {
  const routePath = route === '/' ? 'page.tsx' : route.replace(/^\//, '').replace(/\//g, '\\') + '\\page.tsx';
  const filePath = path.join(APP_DIR, routePath);
  
  try {
    const existing = await fs.readFile(filePath, 'utf8');
    
    // Escape content for template string
    const escapedContent = content
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\${/g, '\\${')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
    
    // Replace the dangerouslySetInnerHTML content
    const updated = existing.replace(
      /dangerouslySetInnerHTML=\{\{ __html: `[^`]*` \}\}/s,
      `dangerouslySetInnerHTML={{ __html: \`${escapedContent}\` }}`
    );
    
    await fs.writeFile(filePath, updated, 'utf8');
    console.log(`✅ Updated: ${route}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${route}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('📝 Adding content to pages...\n');
  
  // Try to extract from original file
  const content = await extractContentFromOriginalFile();
  
  if (content) {
    console.log('✅ Found content in original file');
    console.log(`📄 Content length: ${content.length} characters\n`);
    
    // Update for-solicitors page
    await updatePageWithContent('/for-solicitors', content);
  } else {
    console.log('ℹ️  No content found in original file.');
    console.log('💡 You can:');
    console.log('   1. Provide content files in legacy/ folder');
    console.log('   2. Paste content directly into the page files');
    console.log('   3. Use the original-services-for-solicitors-saved.html file\n');
  }
  
  console.log('✅ Done!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { extractContentFromOriginalFile, updatePageWithContent };

