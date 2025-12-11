/**
 * Extract main content from scraped HTML files
 * This script helps identify the main content sections for rebuilding
 */

const fs = require('fs').promises;
const path = require('path');

const SCRAPED_DIR = path.join(__dirname, '..', 'legacy', 'scraped');

async function extractMainContent(htmlFile) {
  try {
    const content = await fs.readFile(htmlFile, 'utf-8');
    
    // Extract content between <main> tags
    const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (!mainMatch) {
      console.log(`No <main> tag found in ${path.basename(htmlFile)}`);
      return null;
    }
    
    const mainContent = mainMatch[1];
    
    // Remove script tags and other non-content elements
    let cleaned = mainContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '');
    
    // Extract key sections
    const sections = {
      hero: cleaned.match(/<section[^>]*class="[^"]*hero[^"]*"[^>]*>([\s\S]*?)<\/section>/i)?.[1] || 
             cleaned.match(/<section[^>]*class="[^"]*bg-gradient[^"]*"[^>]*>([\s\S]*?)<\/section>/i)?.[1],
      content: cleaned.match(/<div[^>]*class="[^"]*max-w-[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1],
    };
    
    return {
      filename: path.basename(htmlFile),
      hasHero: !!sections.hero,
      hasContent: !!sections.content,
      preview: cleaned.substring(0, 500),
    };
  } catch (error) {
    console.error(`Error processing ${htmlFile}:`, error.message);
    return null;
  }
}

async function main() {
  const files = await fs.readdir(SCRAPED_DIR);
  const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'scraping-summary.json');
  
  console.log(`Found ${htmlFiles.length} HTML files\n`);
  
  for (const file of htmlFiles) {
    const filePath = path.join(SCRAPED_DIR, file);
    const result = await extractMainContent(filePath);
    if (result) {
      console.log(`${result.filename}:`);
      console.log(`  Hero: ${result.hasHero ? 'Yes' : 'No'}`);
      console.log(`  Content: ${result.hasContent ? 'Yes' : 'No'}`);
      console.log(`  Preview: ${result.preview.substring(0, 100)}...\n`);
    }
  }
}

main();


