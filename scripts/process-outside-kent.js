/**
 * Process "Detained Outside Kent? What To Do" HTML file
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
    title: document.querySelector('title')?.textContent?.trim() || 'Detained Outside Kent? What To Do | Police Station Agent',
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || 'https://policestationagent.com/outofarea',
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
  const targetFile = files.find(f => f.includes('Detained Outside Kent') && f.endsWith('.html'));
  
  if (!targetFile) {
    console.error('❌ Could not find "Detained Outside Kent" HTML file in Downloads');
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
  
  // Determine route - check canonical or use default
  let route = '/outofarea';
  if (metadata.canonical) {
    try {
      const url = new URL(metadata.canonical);
      route = url.pathname;
    } catch {
      // If canonical is not a full URL, use default
      route = '/outofarea';
    }
  }
  
  console.log(`📍 Using route: ${route}`);
  
  // Update the page
  const routePath = route === '/' ? 'page.tsx' : route.replace(/^\//, '').replace(/\//g, '\\') + '\\page.tsx';
  const outputPath = path.join(APP_DIR, routePath);
  
  // Check if page exists, if not create directory
  try {
    await fs.access(outputPath);
  } catch {
    // Page doesn't exist, create directory
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    // Create a basic page structure
    const basicPage = `import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ${JSON.stringify(metadata.title)},
  description: ${JSON.stringify(metadata.description || '')},
  alternates: {
    canonical: ${JSON.stringify(metadata.canonical || `https://policestationagent.com${route}`)},
  },
  openGraph: {
    title: ${JSON.stringify(metadata.title)},
    description: ${JSON.stringify(metadata.description || '')},
    type: 'website',
    url: ${JSON.stringify(metadata.canonical || `https://policestationagent.com${route}`)},
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen">
          <div 
            className="prose prose-lg max-w-6xl mx-auto px-4 py-16"
            dangerouslySetInnerHTML={{ __html: \`\` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
`;
    await fs.writeFile(outputPath, basicPage, 'utf8');
  }
  
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
  console.log(`✅ Updated: ${route}`);
  console.log(`\n✅ Successfully populated ${route} page!`);
}

main().catch(console.error);



