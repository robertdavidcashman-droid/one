/**
 * Compare Current Site with policestationagent.com
 * Scrape missing pages and content
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');
const https = require('https');
const http = require('http');

const BASE_URL = 'https://policestationagent.com';
const APP_DIR = path.join(__dirname, '..', 'app');
const SCRAPED_DIR = path.join(__dirname, '..', 'legacy', 'scraped');
const REPORT_DIR = path.join(__dirname, '..', 'legacy', 'import-reports');

// Get all routes from the current Next.js app
async function getCurrentRoutes() {
  const routes = new Set(['/']); // Homepage always exists
  
  async function scanDirectory(dir, baseRoute = '') {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules and other non-page directories
          if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'api') {
            continue;
          }
          
          // Check if it has a page.tsx
          const pagePath = path.join(fullPath, 'page.tsx');
          try {
            await fs.access(pagePath);
            const route = baseRoute + '/' + entry.name;
            routes.add(route);
          } catch {
            // No page.tsx, but directory exists - might be dynamic route
            if (entry.name.startsWith('[') && entry.name.endsWith(']')) {
              // Dynamic route - add placeholder
              routes.add(baseRoute + '/:slug');
            }
          }
          await scanDirectory(fullPath, baseRoute + '/' + entry.name);
        } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
          routes.add(baseRoute || '/');
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }
  
  await scanDirectory(APP_DIR);
  return routes;
}

// Extract all links from a page
async function extractLinksFromPage(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const links = new Set();
  
  // Get all internal links
  const anchorTags = document.querySelectorAll('a[href]');
  anchorTags.forEach(anchor => {
    const href = anchor.getAttribute('href');
    if (href && href.startsWith('/') && !href.startsWith('//') && !href.includes('#')) {
      // Remove query params and fragments
      const cleanHref = href.split('?')[0].split('#')[0];
      if (cleanHref.length > 1) {
        links.add(cleanHref);
      }
    }
  });
  
  return links;
}

// Fetch HTML from URL
async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Extract main content from HTML
function extractMainContent(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const selectors = [
    '#root > main',
    'main',
    '[role="main"]',
    '#main-content',
    '.main-content',
    'body > main',
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent || '';
      if (text.includes('404') || text.includes('Page Not Found') || text.includes('Content temporarily unavailable')) {
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

// Extract metadata from HTML
function extractMetadata(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  return {
    title: document.querySelector('title')?.textContent?.trim() || 'Police Station Agent',
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
  };
}

// Get sitemap from original site
async function getSitemapUrls() {
  try {
    const sitemapUrl = `${BASE_URL}/sitemap.xml`;
    const sitemapXml = await fetchHtml(sitemapUrl);
    const dom = new JSDOM(sitemapXml, { contentType: 'text/xml' });
    const document = dom.window.document;
    
    const urls = [];
    const locElements = document.querySelectorAll('loc');
    locElements.forEach(loc => {
      const url = loc.textContent.trim();
      if (url.startsWith(BASE_URL)) {
        const path = url.replace(BASE_URL, '') || '/';
        urls.push(path);
      }
    });
    
    return urls;
  } catch (error) {
    console.warn('Could not fetch sitemap, will crawl from homepage:', error.message);
    return [];
  }
}

// Crawl site starting from homepage
async function crawlSite(startUrl = '/', maxDepth = 3, visited = new Set()) {
  if (visited.has(startUrl) || maxDepth === 0) {
    return visited;
  }
  
  visited.add(startUrl);
  console.log(`Crawling: ${startUrl}`);
  
  try {
    const html = await fetchHtml(`${BASE_URL}${startUrl}`);
    const links = await extractLinksFromPage(html);
    
    // Crawl found links
    for (const link of links) {
      if (!visited.has(link) && link.startsWith('/') && !link.includes('://')) {
        await crawlSite(link, maxDepth - 1, visited);
        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  } catch (error) {
    console.warn(`Error crawling ${startUrl}:`, error.message);
  }
  
  return visited;
}

// Check if page has meaningful content
async function checkPageContent(route) {
  const routePath = route === '/' ? 'page.tsx' : route.replace(/^\//, '').replace(/\//g, '\\') + '\\page.tsx';
  const pagePath = path.join(APP_DIR, routePath);
  
  try {
    const content = await fs.readFile(pagePath, 'utf8');
    
    // Check for empty or placeholder content
    if (content.includes('<div id="root"></div>') || 
        content.includes('404') || 
        content.includes('not found') ||
        content.includes('Content temporarily unavailable') ||
        content.includes('placeholder')) {
      return { exists: true, hasContent: false };
    }
    
    // Check if content is very short
    const contentMatch = content.match(/dangerouslySetInnerHTML=\{\{ __html: `([^`]*)` \}\}/s);
    if (contentMatch && contentMatch[1].length < 500) {
      return { exists: true, hasContent: false };
    }
    
    return { exists: true, hasContent: true };
  } catch (error) {
    return { exists: false, hasContent: false };
  }
}

// Create or update Next.js page
async function createOrUpdatePage(route, htmlContent, metadata) {
  const routePath = route === '/' ? 'page.tsx' : route.replace(/^\//, '').replace(/\//g, '\\') + '\\page.tsx';
  const pageDirPath = path.dirname(path.join(APP_DIR, routePath));
  const pageFilePath = path.join(APP_DIR, routePath);
  
  const componentName = route.split('/').pop()?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') || 'Index';
  
  const title = metadata.title || `${componentName.replace(/([A-Z])/g, ' $1').trim()} | Police Station Agent`;
  const description = metadata.description || `Information about ${componentName.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} services.`;
  const canonical = metadata.canonical || `${BASE_URL}${route}`;
  
  function escapeForTemplate(str) {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\${/g, '\\${')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }
  
  const escapedContent = escapeForTemplate(htmlContent);
  
  const pageContent = `
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(description)},
  alternates: {
    canonical: ${JSON.stringify(canonical)},
  },
  openGraph: {
    title: ${JSON.stringify(title)},
    description: ${JSON.stringify(description)},
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
  
  await fs.mkdir(pageDirPath, { recursive: true });
  await fs.writeFile(pageFilePath, pageContent.trim(), 'utf8');
  console.log(`✅ Created/Updated: ${route}`);
}

// Main comparison function
async function main() {
  console.log('🔍 Starting comprehensive site comparison...\n');
  
  // Get current routes
  console.log('📁 Scanning current Next.js app...');
  const currentRoutes = await getCurrentRoutes();
  console.log(`   Found ${currentRoutes.size} routes in current app\n`);
  
  // Get URLs from original site
  console.log('🌐 Fetching URLs from original site...');
  let originalUrls = await getSitemapUrls();
  
  if (originalUrls.length === 0) {
    console.log('   Sitemap not available, crawling from homepage...');
    originalUrls = Array.from(await crawlSite('/', 2));
  }
  
  console.log(`   Found ${originalUrls.length} URLs on original site\n`);
  
  // Compare and find missing
  const missingRoutes = [];
  const emptyPages = [];
  const existingPages = [];
  
  for (const url of originalUrls) {
    const route = url.split('?')[0]; // Remove query params
    
    // Skip admin, API, and other non-public routes
    if (route.startsWith('/admin') || 
        route.startsWith('/api') || 
        route.startsWith('/_next') ||
        route.includes('.') ||
        route.includes('#')) {
      continue;
    }
    
    const pageStatus = await checkPageContent(route);
    
    if (!pageStatus.exists) {
      missingRoutes.push(route);
    } else if (!pageStatus.hasContent) {
      emptyPages.push(route);
    } else {
      existingPages.push(route);
    }
  }
  
  console.log('📊 COMPARISON RESULTS:\n');
  console.log(`✅ Pages with content: ${existingPages.length}`);
  console.log(`⚠️  Pages that exist but are empty: ${emptyPages.length}`);
  console.log(`❌ Missing pages: ${missingRoutes.length}\n`);
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    currentRoutes: Array.from(currentRoutes),
    originalUrls: originalUrls,
    existingPages: existingPages,
    emptyPages: emptyPages,
    missingRoutes: missingRoutes,
  };
  
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, 'site-comparison.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`📄 Report saved to: ${reportPath}\n`);
  
  // Scrape missing and empty pages
  const pagesToScrape = [...missingRoutes, ...emptyPages];
  
  if (pagesToScrape.length > 0) {
    console.log(`🌐 Scraping ${pagesToScrape.length} pages from original site...\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const route of pagesToScrape) {
      try {
        console.log(`📥 Scraping: ${BASE_URL}${route}...`);
        const html = await fetchHtml(`${BASE_URL}${route}`);
        const mainContent = extractMainContent(html);
        const metadata = extractMetadata(html);
        
        if (mainContent && mainContent.length > 500) {
          await createOrUpdatePage(route, mainContent, metadata);
          successCount++;
          console.log(`✅ Successfully scraped: ${route}\n`);
        } else {
          console.warn(`⚠️  Could not extract content for: ${route}\n`);
          failCount++;
        }
        
        // Be respectful - small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error scraping ${route}:`, error.message, '\n');
        failCount++;
      }
    }
    
    console.log('\n📊 SCRAPING SUMMARY:');
    console.log(`✅ Successfully scraped: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
  } else {
    console.log('✅ No missing or empty pages found!');
  }
  
  console.log('\n✅ Comparison and scraping complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, getCurrentRoutes, crawlSite };
