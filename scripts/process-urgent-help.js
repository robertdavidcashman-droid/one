/**
 * Process "Urgent Police Station Help" HTML file
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
    title: document.querySelector('title')?.textContent?.trim() || 'Urgent Police Station Help | Has Someone Been Arrested? | 24/7 Free Advice',
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || 'Emergency Help: Has a friend or family member been arrested in Kent? You can instruct a solicitor on their behalf. Call 01732 247 427 immediately for 24/7 FREE legal representation.',
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || 'https://policestationagent.com/arrestednow',
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

async function main() {
  // Find the file in Downloads
  const downloadsPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads');
  const files = await fs.readdir(downloadsPath);
  const targetFile = files.find(f => f.includes('Urgent Police Station Help') && f.includes('Arrested') && f.endsWith('.html'));
  
  if (!targetFile) {
    console.error('❌ Could not find "Urgent Police Station Help" HTML file in Downloads');
    process.exit(1);
  }
  
  const filePath = path.join(downloadsPath, targetFile);
  console.log(`📂 Reading file: ${filePath}`);
  
  const html = await fs.readFile(filePath, 'utf8');
  console.log(`📄 File size: ${(html.length / 1024).toFixed(2)} KB`);
  
  const mainContent = extractMainContent(html);
  const metadata = extractMetadata(html);
  
  if (!mainContent || mainContent.length < 500) {
    console.log(`⚠️  Could not extract sufficient content`);
    console.log(`   Content length: ${mainContent ? mainContent.length : 0} characters`);
    process.exit(1);
  }
  
  console.log(`✅ Extracted ${mainContent.length} characters of content`);
  console.log(`📋 Title: ${metadata.title}`);
  
  // Update the page
  const outputPath = path.join(APP_DIR, 'arrestednow', 'page.tsx');
  const existing = await fs.readFile(outputPath, 'utf8');
  const escapedContent = escapeForTemplate(mainContent);
  const canonical = metadata.canonical || 'https://policestationagent.com/arrestednow';
  
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
  
  // Update OpenGraph
  updated = updated.replace(
    /openGraph:\s*\{[^}]*\}/s,
    `openGraph: {
    title: ${JSON.stringify(metadata.title)},
    description: ${JSON.stringify(metadata.description || '')},
    type: 'website',
    url: ${JSON.stringify(canonical)},
  }`
  );
  
  // Update content
  updated = updated.replace(
    /dangerouslySetInnerHTML=\{\{ __html: `[^`]*` \}\}/s,
    `dangerouslySetInnerHTML={{ __html: \`${escapedContent}\` }}`
  );
  
  await fs.writeFile(outputPath, updated, 'utf8');
  console.log(`✅ Updated: /arrestednow`);
  console.log(`\n✅ Successfully populated /arrestednow page!`);
}

main().catch(console.error);



