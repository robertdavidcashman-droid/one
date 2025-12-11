/**
 * Rebuild Next.js pages from scraped HTML files
 * 
 * This script parses scraped HTML and generates Next.js page components
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const SCRAPED_DIR = path.join(__dirname, '..', 'legacy', 'scraped');
const APP_DIR = path.join(__dirname, '..', 'app');

// Map of scraped files to Next.js routes
const ROUTE_MAP = {
  'home.html': '/',
  'about.html': '/about',
  'contact.html': '/contact',
  'blog.html': '/blog',
  'services.html': '/services',
  'police-stations.html': '/police-stations',
  'coverage.html': '/coverage',
  'faq.html': '/faq',
  'for-solicitors.html': '/for-solicitors',
  'for-clients.html': '/for-clients',
  'voluntary-interviews.html': '/voluntary-interviews',
  'why-use-us.html': '/why-use-us',
  'what-we-do.html': '/what-we-do',
  'what-is-a-police-station-rep.html': '/what-is-a-police-station-rep',
  'what-is-a-criminal-solicitor.html': '/what-is-a-criminal-solicitor',
  'after-a-police-interview.html': '/after-a-police-interview',
  'privacy.html': '/privacy',
  'terms-and-conditions.html': '/terms-and-conditions',
  'complaints.html': '/complaints',
  'accessibility.html': '/accessibility',
  'cookies.html': '/cookies',
  'gdpr.html': '/gdpr',
};

function extractMainContent(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const root = document.getElementById('root');
  if (!root) return null;
  
  // Find the main element
  const main = root.querySelector('main');
  if (!main) return null;
  
  return main.innerHTML;
}

function extractMetadata(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const title = document.querySelector('title')?.textContent || '';
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
  
  return { title, description, canonical };
}

function convertToNextJS(htmlContent, route) {
  // Convert internal links to Next.js Link components
  // This is a simplified version - in production, you'd want more sophisticated parsing
  let converted = htmlContent;
  
  // Replace href="/path" with Next.js Link components (simplified)
  // For now, we'll keep the HTML structure but note where Links should be
  
  return converted;
}

async function rebuildPage(filename, route) {
  const filePath = path.join(SCRAPED_DIR, filename);
  
  try {
    const html = await fs.readFile(filePath, 'utf8');
    const mainContent = extractMainContent(html);
    const metadata = extractMetadata(html);
    
    if (!mainContent) {
      console.log(`⚠️  Could not extract main content from ${filename}`);
      return null;
    }
    
    // Generate Next.js page component
    const pageContent = `import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${metadata.title.replace(/'/g, "\\'")}',
  description: '${metadata.description.replace(/'/g, "\\'")}',
  alternates: {
    canonical: '${metadata.canonical}',
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50">
          <div 
            className="prose prose-lg max-w-6xl mx-auto px-4 py-16"
            dangerouslySetInnerHTML={{ __html: \`${mainContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
`;
    
    return { route, content: pageContent, metadata };
  } catch (error) {
    console.error(`Error processing ${filename}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🔨 Rebuilding pages from scraped HTML...\n');
  
  const results = [];
  
  for (const [filename, route] of Object.entries(ROUTE_MAP)) {
    console.log(`Processing: ${filename} -> ${route}`);
    const result = await rebuildPage(filename, route);
    if (result) {
      results.push(result);
    }
  }
  
  console.log(`\n✅ Processed ${results.length} pages`);
  console.log('\n📝 Generated page components:');
  results.forEach(r => console.log(`  - ${r.route}`));
  
  // Save to a temp file for review
  const outputPath = path.join(__dirname, '..', 'legacy', 'rebuild-output.txt');
  await fs.writeFile(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n📁 Preview saved to: ${outputPath}`);
  console.log('\n⚠️  Review the output before applying changes to app/ directory');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { rebuildPage, extractMainContent };

