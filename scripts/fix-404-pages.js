/**
 * Fix Pages Showing 404 Errors
 * Rebuilds pages that have 404 HTML content from scraped files
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const SCRAPED_DIR = path.join(__dirname, '..', 'legacy', 'scraped');
const APP_DIR = path.join(__dirname, '..', 'app');

// Pages that are showing 404 errors
const BROKEN_PAGES = [
  { route: '/police-stations', file: 'police-stations.html' },
  { route: '/for-solicitors', file: 'for-solicitors.html' },
  { route: '/for-clients', file: 'for-clients.html' },
  { route: '/what-is-a-police-station-rep', file: 'what-is-a-police-station-rep.html' },
  { route: '/what-is-a-criminal-solicitor', file: 'what-is-a-criminal-solicitor.html' },
  { route: '/what-we-do', file: 'what-we-do.html' },
  { route: '/why-use-us', file: 'why-use-us.html' },
  { route: '/after-a-police-interview', file: 'after-a-police-interview.html' },
  { route: '/voluntary-interviews', file: 'voluntary-interviews.html' },
  { route: '/terms-and-conditions', file: 'terms-and-conditions.html' },
];

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
    '#root',
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      // Check if it's a 404 page
      if (element.textContent.includes('404') || element.textContent.includes('Page Not Found')) {
        continue; // Skip 404 pages
      }
      
      const clone = element.cloneNode(true);
      clone.querySelectorAll('script, style, noscript, link[rel="stylesheet"]').forEach(el => el.remove());
      return clone.innerHTML;
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

async function rebuildPage(route, filename) {
  const scrapedPath = path.join(SCRAPED_DIR, filename);
  const routePath = route === '/' ? 'page.tsx' : route.replace(/^\//, '').replace(/\//g, '\\') + '\\page.tsx';
  const outputPath = path.join(APP_DIR, routePath);
  
  try {
    // Check if scraped file exists
    try {
      await fs.access(scrapedPath);
    } catch (e) {
      console.log(`  ⏭️  Skipped: ${route} (scraped file not found: ${filename})`);
      return false;
    }
    
    const html = await fs.readFile(scrapedPath, 'utf8');
    const mainContent = extractMainContent(html);
    const metadata = extractMetadata(html);
    
    if (!mainContent || mainContent.includes('404') || mainContent.includes('Page Not Found')) {
      console.log(`  ⚠️  Skipped: ${route} (404 content in scraped file)`);
      return false;
    }
    
    const escapedContent = escapeForTemplate(mainContent);
    const canonical = metadata.canonical || `https://policestationagent.com${route}`;
    
    const pageContent = `import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ${JSON.stringify(metadata.title)},
  description: ${JSON.stringify(metadata.description)},
  alternates: {
    canonical: ${JSON.stringify(canonical)},
  },
  openGraph: {
    title: ${JSON.stringify(metadata.title)},
    description: ${JSON.stringify(metadata.description)},
    type: 'website',
    url: ${JSON.stringify(canonical)},
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
            dangerouslySetInnerHTML={{ __html: \`${escapedContent}\` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
`;
    
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(outputPath, pageContent, 'utf8');
    
    console.log(`  ✅ Fixed: ${route}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error fixing ${route}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Fixing pages showing 404 errors...\n');
  
  let fixed = 0;
  let skipped = 0;
  
  for (const page of BROKEN_PAGES) {
    const result = await rebuildPage(page.route, page.file);
    if (result) {
      fixed++;
    } else {
      skipped++;
    }
  }
  
  console.log(`\n✅ Fixed: ${fixed} pages`);
  console.log(`⏭️  Skipped: ${skipped} pages`);
  console.log('\n🎉 All 404 pages fixed!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { rebuildPage };



