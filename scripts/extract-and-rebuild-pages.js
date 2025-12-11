/**
 * Extract content from scraped HTML and rebuild Next.js pages
 * This script properly extracts main content and converts to React components
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const SCRAPED_DIR = path.join(__dirname, '..', 'legacy', 'scraped');
const APP_DIR = path.join(__dirname, '..', 'app');

// Pages to rebuild with their routes
const PAGES_TO_REBUILD = [
  { file: 'privacy.html', route: 'privacy', title: 'Website Privacy Policy | Police Station Agent' },
  { file: 'complaints.html', route: 'complaints', title: 'Complaints Policy | Police Station Agent' },
  { file: 'accessibility.html', route: 'accessibility', title: 'Accessibility Statement | Police Station Agent' },
  { file: 'cookies.html', route: 'cookies', title: 'Cookies Policy | Police Station Agent' },
  { file: 'gdpr.html', route: 'gdpr', title: 'GDPR Compliance | Police Station Agent' },
];

function extractMainContent(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const root = document.getElementById('root');
  if (!root) return null;
  
  // Find the main element
  const main = root.querySelector('main');
  if (!main) return null;
  
  // Get the inner content div (usually has bg-slate-50 or similar)
  const contentDiv = main.querySelector('div.bg-slate-50, div.min-h-screen');
  if (!contentDiv) return main.innerHTML;
  
  return contentDiv.innerHTML;
}

function extractMetadata(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const title = document.querySelector('title')?.textContent || '';
  const desc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
  
  return { title, description: desc, canonical };
}

function convertHtmlToJSX(html) {
  if (!html) return '';
  
  // Convert HTML to JSX
  let jsx = html
    // Convert class to className
    .replace(/\bclass=/g, 'className=')
    // Convert for to htmlFor
    .replace(/\bfor=/g, 'htmlFor=')
    // Convert self-closing tags
    .replace(/<img([^>]*?)>/g, '<img$1 />')
    .replace(/<br>/g, '<br />')
    .replace(/<hr>/g, '<hr />')
    // Convert href attributes to Link components where appropriate
    .replace(/href="\/([^"]+)"/g, (match, path) => {
      // Skip external links, mailto, tel, etc.
      if (path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('tel:') || path.startsWith('sms:')) {
        return match;
      }
      // Convert internal links to Link components (we'll handle this manually)
      return match;
    })
    // Escape template literals
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');
  
  return jsx;
}

async function rebuildPage({ file, route, title: defaultTitle }) {
  try {
    const htmlPath = path.join(SCRAPED_DIR, file);
    const html = await fs.readFile(htmlPath, 'utf-8');
    
    // Check if it's a 404 page
    if (html.includes('Page Not Found') || html.includes('404')) {
      console.log(`⚠️  ${file} is a 404 page, skipping`);
      return;
    }
    
    const metadata = extractMetadata(html);
    const mainContent = extractMainContent(html);
    
    if (!mainContent) {
      console.log(`⚠️  No main content found in ${file}`);
      return;
    }
    
    const jsxContent = convertHtmlToJSX(mainContent);
    
    // Generate the page component
    const pageContent = `import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${metadata.title || defaultTitle}',
  description: '${metadata.description.replace(/'/g, "\\'")}',
  alternates: {
    canonical: '${metadata.canonical || `https://policestationagent.com/${route}`}',
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div 
          className="bg-slate-50 min-h-screen py-12"
          dangerouslySetInnerHTML={{ __html: \`${jsxContent}\` }}
        />
      </main>
      <Footer />
    </div>
  );
}
`;
    
    // Write the page
    const outputPath = path.join(APP_DIR, route, 'page.tsx');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, pageContent, 'utf-8');
    
    console.log(`✅ Rebuilt: ${route}/page.tsx`);
  } catch (error) {
    console.error(`❌ Error rebuilding ${file}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting page rebuild from scraped HTML...\n');
  
  for (const page of PAGES_TO_REBUILD) {
    await rebuildPage(page);
  }
  
  console.log('\n✨ Rebuild complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { rebuildPage, extractMainContent, extractMetadata };


