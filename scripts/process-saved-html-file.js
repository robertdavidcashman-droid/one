/**
 * Process Saved HTML File
 * Extracts content from a saved HTML file (like SingleFile saves) and updates the page
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const LEGACY_DIR = path.join(__dirname, '..', 'legacy');
const APP_DIR = path.join(__dirname, '..', 'app');

// Map of saved file patterns to routes
const FILE_TO_ROUTE = {
  'services-for-clients': '/for-clients',
  'for-clients': '/for-clients',
  'services for clients': '/for-clients',
};

function extractMainContent(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Try multiple strategies to find main content
  const selectors = [
    '#root > main',
    '#root main',
    'main',
    '[role="main"]',
    '#root > div > main',
    'body > main',
    '.main-content',
    '[class*="main"]',
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      // Check if it's a 404 page
      const text = element.textContent || '';
      if (text.includes('404') || text.includes('Page Not Found')) {
        continue; // Skip 404 pages
      }
      
      // Clone and clean
      const clone = element.cloneNode(true);
      clone.querySelectorAll('script, style, noscript, link[rel="stylesheet"], meta').forEach(el => el.remove());
      
      const content = clone.innerHTML.trim();
      if (content.length > 500) { // Only return if substantial content
        return content;
      }
    }
  }
  
  // Fallback: try to find any substantial content div
  const body = document.body;
  if (body) {
    const allDivs = body.querySelectorAll('div');
    for (const div of allDivs) {
      const text = div.textContent || '';
      if (text.length > 500 && !text.includes('404') && !text.includes('Page Not Found')) {
        const clone = div.cloneNode(true);
        clone.querySelectorAll('script, style, noscript, link, meta').forEach(el => el.remove());
        return clone.innerHTML.trim();
      }
    }
  }
  
  return null;
}

function extractMetadata(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  return {
    title: document.querySelector('title')?.textContent?.trim() || 'Police Station Agent',
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

async function processFile(filename, route) {
  const filePath = path.join(LEGACY_DIR, filename);
  
  try {
    console.log(`📂 Looking for: ${filename}`);
    await fs.access(filePath);
    
    console.log(`✅ Found file: ${filename}`);
    const html = await fs.readFile(filePath, 'utf8');
    
    const mainContent = extractMainContent(html);
    const metadata = extractMetadata(html);
    
    if (!mainContent || mainContent.length < 500) {
      console.log(`⚠️  Could not extract sufficient content from ${filename}`);
      return false;
    }
    
    console.log(`📄 Extracted ${mainContent.length} characters of content`);
    console.log(`📋 Title: ${metadata.title}`);
    
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
    
    updated = updated.replace(
      /description:\s*["'][^"']*["']/,
      `description: ${JSON.stringify(metadata.description || '')}`
    );
    
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
    console.log(`✅ Updated: ${route}`);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`❌ File not found: ${filename}`);
      console.log(`💡 Please save the file to: ${LEGACY_DIR}`);
      console.log(`   Expected filename: ${filename}`);
    } else {
      console.error(`❌ Error processing ${filename}:`, error.message);
    }
    return false;
  }
}

async function main() {
  const filename = process.argv[2] || 'Services for Clients ｜ Police Station Agent (11_12_2025 12：15：37).html';
  const route = '/for-clients';
  
  console.log('📝 Processing Saved HTML File\n');
  console.log(`File: ${filename}`);
  console.log(`Route: ${route}\n`);
  
  const success = await processFile(filename, route);
  
  if (success) {
    console.log('\n✅ Successfully updated page!');
  } else {
    console.log('\n❌ Could not process file.');
    console.log('\n💡 Instructions:');
    console.log('1. Save the HTML file to the legacy/ folder');
    console.log('2. Run: node scripts/process-saved-html-file.js "filename.html"');
    console.log('3. Or just place it in legacy/ and I\'ll find it');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processFile, extractMainContent };



