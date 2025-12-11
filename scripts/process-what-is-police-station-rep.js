/**
 * Process "What is a Police Station Rep" HTML File
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const APP_DIR = path.join(__dirname, '..', 'app');

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

function extractMetadata(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  return {
    title: document.querySelector('title')?.textContent?.trim() || 'What is a Police Station Rep | Police Station Agent',
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || 'https://policestationagent.com/what-is-a-police-station-rep',
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

async function processFile(filePath, route = '/what-is-a-police-station-rep') {
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
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const downloadsDir = path.join(homeDir, 'Downloads');
  
  // Try to find the file
  const possibleFilenames = [
    'What is a Police Station Rep',
    'what is a police station rep',
    'WhatIsAPoliceStationRep',
  ];
  
  let filePath = null;
  
  // First, try to find any file with "police station rep" in the name
  try {
    const files = await fs.readdir(downloadsDir);
    const matchingFile = files.find(file => 
      file.toLowerCase().includes('police') && 
      file.toLowerCase().includes('station') && 
      file.toLowerCase().includes('rep') &&
      file.endsWith('.html')
    );
    
    if (matchingFile) {
      filePath = path.join(downloadsDir, matchingFile);
      console.log(`✅ Found file: ${matchingFile}`);
    }
  } catch (error) {
    console.log(`⚠️  Could not read Downloads folder: ${error.message}`);
  }
  
  if (!filePath) {
    console.log('📝 Process "What is a Police Station Rep" HTML\n');
    console.log('❌ File not found in Downloads folder.');
    console.log('\n💡 Please provide the full path:');
    console.log('   node scripts/process-what-is-police-station-rep.js "path/to/file.html"');
    process.exit(1);
  }
  
  const route = '/what-is-a-police-station-rep';
  const success = await processFile(filePath, route);
  
  if (success) {
    console.log('\n✅ Successfully updated /what-is-a-police-station-rep page!');
  } else {
    console.log('\n❌ Could not process file.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processFile, extractMainContent };

