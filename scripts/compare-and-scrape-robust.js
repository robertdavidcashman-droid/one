/**
 * Robust Site Comparison & Scraper
 * Uses Puppeteer for reliable scraping
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');
const puppeteer = require('puppeteer');

const BASE_URL = 'https://policestationagent.com';
const APP_DIR = path.join(__dirname, '..', 'app');
const REPORT_DIR = path.join(__dirname, '..', 'legacy', 'import-reports');

// Get all routes from current Next.js app
async function getCurrentRoutes() {
  const routes = new Set(['/']);
  
  async function scanDirectory(dir, baseRoute = '') {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'api') {
          continue;
        }
        
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const pagePath = path.join(fullPath, 'page.tsx');
          try {
            await fs.access(pagePath);
            const route = baseRoute + '/' + entry.name;
            routes.add(route);
          } catch {
            if (entry.name.startsWith('[') && entry.name.endsWith(']')) {
              routes.add(baseRoute + '/:slug');
            }
          }
          await scanDirectory(fullPath, baseRoute + '/' + entry.name);
        } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
          routes.add(baseRoute || '/');
        }
      }
    } catch (error) {
      // Skip
    }
  }
  
  await scanDirectory(APP_DIR);
  return routes;
}

// Extract links from HTML
function extractLinks(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const links = new Set();
  
  document.querySelectorAll('a[href]').forEach(anchor => {
    const href = anchor.getAttribute('href');
    if (href && href.startsWith('/') && !href.startsWith('//') && !href.includes('#')) {
      const cleanHref = href.split('?')[0];
      if (cleanHref.length > 1) {
        links.add(cleanHref);
      }
    }
  });
  
  return links;
}

// Scrape page with Puppeteer
async function scrapePage(browser, url) {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    const html = await page.content();
    return html;
  } catch (error) {
    console.warn(`Error loading ${url}:`, error.message);
    return null;
  } finally {
    await page.close();
  }
}

// Extract main content
function extractMainContent(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const selectors = ['#root > main', 'main', '[role="main"]', '#main-content'];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent || '';
      if (text.includes('404') || text.includes('Page Not Found')) {
        continue;
      }
      
      const clone = element.cloneNode(true);
      clone.querySelectorAll('script, style, noscript, link, meta').forEach(el => el.remove());
      const content = clone.innerHTML.trim();
      
      if (content.length > 500) {
        return content;
      }
    }
  }
  
  return null;
}

// Extract metadata
function extractMetadata(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  return {
    title: document.querySelector('title')?.textContent?.trim() || 'Police Station Agent',
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
  };
}

// Check if page exists and has content
async function checkPageContent(route) {
  const routePath = route === '/' ? 'page.tsx' : route.replace(/^\//, '').replace(/\//g, '\\') + '\\page.tsx';
  const pagePath = path.join(APP_DIR, routePath);
  
  try {
    const content = await fs.readFile(pagePath, 'utf8');
    
    if (content.includes('<div id="root"></div>') || 
        content.includes('404') || 
        content.includes('not found') ||
        content.includes('Content temporarily unavailable') ||
        content.includes('placeholder')) {
      return { exists: true, hasContent: false };
    }
    
    const contentMatch = content.match(/dangerouslySetInnerHTML=\{\{ __html: `([^`]*)` \}\}/s);
    if (contentMatch && contentMatch[1].length < 500) {
      return { exists: true, hasContent: false };
    }
    
    return { exists: true, hasContent: true };
  } catch (error) {
    return { exists: false, hasContent: false };
  }
}

// Create or update page
async function createOrUpdatePage(route, htmlContent, metadata) {
  const routePath = route === '/' ? 'page.tsx' : route.replace(/^\//, '').replace(/\//g, '\\') + '\\page.tsx';
  const pageDirPath = path.dirname(path.join(APP_DIR, routePath));
  const pageFilePath = path.join(APP_DIR, routePath);
  
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
  const componentName = route.split('/').pop()?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') || 'Index';
  const title = metadata.title || `${componentName} | Police Station Agent`;
  const description = metadata.description || '';
  const canonical = metadata.canonical || `${BASE_URL}${route}`;
  
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

// Main function
async function main() {
  console.log('🔍 Starting site comparison and scraping...\n');
  
  // Get current routes
  console.log('📁 Scanning current app...');
  const currentRoutes = await getCurrentRoutes();
  console.log(`   Found ${currentRoutes.size} routes\n`);
  
  // Launch browser
  console.log('🌐 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Start from homepage and crawl
    console.log('📥 Scraping homepage to discover links...');
    const homepageHtml = await scrapePage(browser, BASE_URL);
    if (!homepageHtml) {
      console.error('❌ Could not scrape homepage');
      return;
    }
    
    const discoveredLinks = extractLinks(homepageHtml);
    console.log(`   Found ${discoveredLinks.size} links on homepage\n`);
    
    // Also check sitemap if available
    try {
      const sitemapHtml = await scrapePage(browser, `${BASE_URL}/sitemap.xml`);
      if (sitemapHtml) {
        const sitemapLinks = extractLinks(sitemapHtml);
        sitemapLinks.forEach(link => discoveredLinks.add(link));
        console.log(`   Added ${sitemapLinks.size} links from sitemap\n`);
      }
    } catch (error) {
      console.warn('   Could not fetch sitemap\n');
    }
    
    // Filter out admin, API, etc.
    const publicLinks = Array.from(discoveredLinks).filter(link => 
      !link.startsWith('/admin') &&
      !link.startsWith('/api') &&
      !link.startsWith('/_next') &&
      !link.includes('.') &&
      !link.includes('#')
    );
    
    console.log(`📊 Analyzing ${publicLinks.length} public pages...\n`);
    
    const missingRoutes = [];
    const emptyPages = [];
    const existingPages = [];
    
    // Check each page
    for (const route of publicLinks) {
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
    console.log(`⚠️  Empty pages: ${emptyPages.length}`);
    console.log(`❌ Missing pages: ${missingRoutes.length}\n`);
    
    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      currentRoutes: Array.from(currentRoutes),
      discoveredLinks: publicLinks,
      existingPages,
      emptyPages,
      missingRoutes,
    };
    
    await fs.mkdir(REPORT_DIR, { recursive: true });
    const reportPath = path.join(REPORT_DIR, 'site-comparison.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📄 Report saved: ${reportPath}\n`);
    
    // Scrape missing and empty pages
    const pagesToScrape = [...missingRoutes, ...emptyPages].slice(0, 50); // Limit to 50 pages
    
    if (pagesToScrape.length > 0) {
      console.log(`🌐 Scraping ${pagesToScrape.length} pages...\n`);
      
      let successCount = 0;
      let failCount = 0;
      
      for (const route of pagesToScrape) {
        try {
          console.log(`📥 Scraping: ${BASE_URL}${route}...`);
          const html = await scrapePage(browser, `${BASE_URL}${route}`);
          
          if (!html) {
            console.warn(`⚠️  Could not load: ${route}\n`);
            failCount++;
            continue;
          }
          
          const mainContent = extractMainContent(html);
          const metadata = extractMetadata(html);
          
          if (mainContent && mainContent.length > 500) {
            await createOrUpdatePage(route, mainContent, metadata);
            successCount++;
            console.log(`✅ Success: ${route}\n`);
          } else {
            console.warn(`⚠️  No content extracted: ${route}\n`);
            failCount++;
          }
          
          // Delay between requests
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`❌ Error: ${route} - ${error.message}\n`);
          failCount++;
        }
      }
      
      console.log('\n📊 SCRAPING SUMMARY:');
      console.log(`✅ Success: ${successCount}`);
      console.log(`❌ Failed: ${failCount}`);
    } else {
      console.log('✅ No missing or empty pages found!');
    }
  } finally {
    await browser.close();
  }
  
  console.log('\n✅ Complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };



