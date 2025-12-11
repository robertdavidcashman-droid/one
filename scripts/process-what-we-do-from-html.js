/**
 * Process "What We Do" page from HTML file
 * The user indicated that "Christmas & Bank Holiday Opening Hours" HTML file is actually the "What We Do" content
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const APP_DIR = path.join(__dirname, '..', 'app');
const DOWNLOADS_DIR = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads');

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

function extractMetadata(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  return {
    title: document.querySelector('title')?.textContent?.trim() || 'What We Do | Police Station Agent',
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || 'Learn about our comprehensive police station representation services across Kent. Expert legal advice and representation available 24/7.',
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || 'https://policestationagent.com/what-we-do',
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

async function findFile() {
  // Try multiple locations
  const searchPaths = [
    path.join(DOWNLOADS_DIR, 'Christmas & Bank Holiday Opening Hours ｜ Police Station Agent (11_12_2025 16：35：30).html'),
    path.join(DOWNLOADS_DIR, 'Christmas & Bank Holiday Opening Hours*.html'),
    path.join(__dirname, '..', 'legacy', 'Christmas & Bank Holiday Opening Hours*.html'),
    path.join(__dirname, '..', 'legacy', 'scraped', 'Christmas*.html'),
  ];
  
  // Also try to find any file with "Christmas" and "Bank Holiday" in Downloads
  try {
    const downloadsFiles = await fs.readdir(DOWNLOADS_DIR);
    for (const file of downloadsFiles) {
      if (file.includes('Christmas') && file.includes('Bank Holiday') && file.endsWith('.html')) {
        return path.join(DOWNLOADS_DIR, file);
      }
    }
  } catch (error) {
    // Downloads folder might not be accessible
  }
  
  // Try exact path first
  try {
    await fs.access(searchPaths[0]);
    return searchPaths[0];
  } catch {
    // File not found at exact path
  }
  
  return null;
}

async function processFile(filePath, route = '/what-we-do') {
  try {
    console.log(`📂 Reading file: ${filePath}`);
    const html = await fs.readFile(filePath, 'utf8');
    
    console.log(`📄 File size: ${(html.length / 1024).toFixed(2)} KB`);
    
    const mainContent = extractMainContent(html);
    const metadata = extractMetadata(html);
    
    if (!mainContent || mainContent.length < 500) {
      console.log(`⚠️  Could not extract sufficient content`);
      console.log(`   Content length: ${mainContent ? mainContent.length : 0} characters`);
      return false;
    }
    
    console.log(`✅ Extracted ${mainContent.length} characters of content`);
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
    console.log(`✅ Updated: ${route}`);
    return true;
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Looking for "Christmas & Bank Holiday Opening Hours" HTML file...\n');
  
  const filePath = await findFile();
  
  if (!filePath) {
    console.log('❌ Could not find the HTML file automatically.');
    console.log('\nPlease provide the full path to the file:');
    console.log('  node scripts/process-what-we-do-from-html.js "C:\\Users\\rober\\Downloads\\Christmas & Bank Holiday Opening Hours ｜ Police Station Agent (11_12_2025 16：35：30).html"');
    
    // Try with command line argument
    const argPath = process.argv[2];
    if (argPath) {
      console.log(`\n📂 Trying provided path: ${argPath}`);
      const success = await processFile(argPath, '/what-we-do');
      if (success) {
        console.log('\n✅ Successfully updated /what-we-do page!');
      } else {
        console.log('\n❌ Could not process file.');
      }
      return;
    }
    
    process.exit(1);
  }
  
  console.log(`✅ Found file: ${filePath}\n`);
  const success = await processFile(filePath, '/what-we-do');
  
  if (success) {
    console.log('\n✅ Successfully updated /what-we-do page!');
  } else {
    console.log('\n❌ Could not process file.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processFile, extractMainContent };



