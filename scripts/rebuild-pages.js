/**
 * Rebuild Next.js pages from scraped HTML files
 * This script extracts content and generates Next.js page components
 */

const fs = require('fs').promises;
const path = require('path');

const SCRAPED_DIR = path.join(__dirname, '..', 'legacy', 'scraped');
const PAGES_DIR = path.join(__dirname, '..', 'app');

// Map of scraped files to Next.js page paths
const PAGE_MAP = {
  'about.html': 'app/about/page.tsx',
  'services.html': 'app/services/page.tsx',
  'faq.html': 'app/faq/page.tsx',
  'coverage.html': 'app/coverage/page.tsx',
  'for-clients.html': 'app/for-clients/page.tsx',
  'for-solicitors.html': 'app/for-solicitors/page.tsx',
  'voluntary-interviews.html': 'app/voluntary-interviews/page.tsx',
  'why-use-us.html': 'app/why-use-us/page.tsx',
  'what-we-do.html': 'app/what-we-do/page.tsx',
  'what-is-a-police-station-rep.html': 'app/what-is-a-police-station-rep/page.tsx',
  'what-is-a-criminal-solicitor.html': 'app/what-is-a-criminal-solicitor/page.tsx',
  'after-a-police-interview.html': 'app/after-a-police-interview/page.tsx',
  'privacy.html': 'app/privacy/page.tsx',
  'terms-and-conditions.html': 'app/terms-and-conditions/page.tsx',
  'complaints.html': 'app/complaints/page.tsx',
  'accessibility.html': 'app/accessibility/page.tsx',
  'cookies.html': 'app/cookies/page.tsx',
  'gdpr.html': 'app/gdpr/page.tsx',
};

function extractMainContent(html) {
  // Extract content between <main> tags
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) return null;
  
  let mainContent = mainMatch[1];
  
  // Remove script tags, style tags, and comments
  mainContent = mainContent
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<div[^>]*class="[^"]*fixed[^"]*"[^>]*>[\s\S]*?<\/div>/gi, ''); // Remove fixed elements
  
  return mainContent;
}

function convertToJSX(html) {
  // Convert HTML attributes to JSX
  let jsx = html
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  return jsx;
}

async function rebuildPage(scrapedFile, outputPath) {
  try {
    const htmlPath = path.join(SCRAPED_DIR, scrapedFile);
    const html = await fs.readFile(htmlPath, 'utf-8');
    
    // Extract title and metadata
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : 'Page';
    
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
    const description = descMatch ? descMatch[1] : '';
    
    const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i);
    const canonical = canonicalMatch ? canonicalMatch[1] : '';
    
    // Extract main content
    const mainContent = extractMainContent(html);
    if (!mainContent) {
      console.log(`⚠️  No main content found in ${scrapedFile}`);
      return;
    }
    
    // Convert to JSX
    const jsxContent = convertToJSX(mainContent);
    
    // Generate Next.js page component
    const pageContent = `import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${title}',
  description: '${description}',
  alternates: {
    canonical: '${canonical}',
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div dangerouslySetInnerHTML={{ __html: \`${jsxContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
      </main>
      <Footer />
    </div>
  );
}
`;
    
    // Write to output path
    const fullOutputPath = path.join(__dirname, '..', outputPath);
    await fs.mkdir(path.dirname(fullOutputPath), { recursive: true });
    await fs.writeFile(fullOutputPath, pageContent);
    
    console.log(`✅ Rebuilt: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error rebuilding ${scrapedFile}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting page rebuild from scraped HTML...\n');
  
  for (const [scrapedFile, outputPath] of Object.entries(PAGE_MAP)) {
    await rebuildPage(scrapedFile, outputPath);
  }
  
  console.log('\n✨ Rebuild complete!');
}

main();




