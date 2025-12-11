/**
 * Extract structure and content from scraped HTML files
 * 
 * This script parses the scraped HTML files and extracts:
 * - Main content structure
 * - Text content
 * - CSS classes and styling
 * - Component patterns
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const SCRAPED_DIR = path.join(__dirname, '..', 'legacy', 'scraped');
const OUTPUT_DIR = path.join(__dirname, '..', 'legacy', 'extracted');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

function extractMainContent(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Find the main content area (usually in #root or main tag)
  const root = document.getElementById('root');
  if (!root) return null;
  
  // Get the rendered React content
  const mainContent = root.innerHTML;
  
  return {
    html: mainContent,
    text: root.textContent,
  };
}

function extractHeader(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const header = document.querySelector('header');
  if (!header) return null;
  
  return {
    html: header.outerHTML,
    classes: Array.from(header.classList),
  };
}

function extractFooter(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const footer = document.querySelector('footer');
  if (!footer) return null;
  
  return {
    html: footer.outerHTML,
    classes: Array.from(footer.classList),
  };
}

async function extractPageStructure(filename) {
  const filePath = path.join(SCRAPED_DIR, filename);
  
  try {
    const html = await fs.readFile(filePath, 'utf8');
    
    const structure = {
      filename,
      header: extractHeader(html),
      footer: extractFooter(html),
      mainContent: extractMainContent(html),
    };
    
    // Save extracted structure
    const outputPath = path.join(OUTPUT_DIR, filename.replace('.html', '-structure.json'));
    await fs.writeFile(outputPath, JSON.stringify(structure, null, 2), 'utf8');
    
    return structure;
  } catch (error) {
    console.error(`Error extracting ${filename}:`, error.message);
    return null;
  }
}

async function extractAll() {
  console.log('🔍 Extracting structure from scraped HTML files...\n');
  
  await ensureDir(OUTPUT_DIR);
  
  const files = await fs.readdir(SCRAPED_DIR);
  const htmlFiles = files.filter(f => f.endsWith('.html'));
  
  console.log(`Found ${htmlFiles.length} HTML files to extract\n`);
  
  const results = [];
  
  for (const file of htmlFiles) {
    console.log(`Extracting: ${file}`);
    const structure = await extractPageStructure(file);
    if (structure) {
      results.push({ file, success: true });
    } else {
      results.push({ file, success: false });
    }
  }
  
  console.log(`\n✅ Extracted ${results.filter(r => r.success).length} files`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
}

// Run if called directly
if (require.main === module) {
  extractAll().catch(console.error);
}

module.exports = { extractPageStructure, extractMainContent };

