/**
 * Compare Current Site with policestationagent.com using Puppeteer
 * Finds missing pages and scrapes them automatically
 */

const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');

const BASE_URL = 'https://policestationagent.com';
const APP_DIR = path.join(__dirname, '..', 'app');
const REPORT_DIR = path.join(__dirname, '..', 'legacy', 'import-reports');

// Get all routes from current site
async function getCurrentSiteRoutes() {
  const routes = new Set(['/']);
  
  async function scanDirectory(dir, baseRoute = '') {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const routeName = entry.name.replace(/\.tsx?$/, '').replace(/\[slug\]/, ':slug');
        
        if (entry.isDirectory()) {
          const pagePath = path.join(fullPath, 'page.tsx');
          try {
            await fs.access(pagePath);
            const route = baseRoute + '/' + routeName;
            routes.add(route === '//' ? '/' : route);
          } catch {
            // No page.tsx
          }
          await scanDirectory(fullPath, baseRoute + '/' + routeName);
        } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
          routes.add(baseRoute || '/');
        }
      }
    } catch (error) {
      // Directory doesn't exist
    }
  }
  
  await scanDirectory(APP_DIR);
  return routes;
}

// Extract all links from a page using Puppeteer
async function extractLinksFromPage(page) {
  return await page.evaluate(() => {
    const links = new Set();
    const baseUrl = window.location.origin;
    
    // Get all links
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      try {
        const url = new URL(href, baseUrl);
        if (url.hostname === 'policestationagent.com' || url.hostname === 'www.policestationagent.com') {
          const pathname = url.pathname;
          const route = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
          if (route && !route.includes('#') && !route.includes('mailto:') && !route.includes('tel:')) {
            links.add(route);
          }
        }
      } catch (e) {
        // Invalid URL
      }
    });
    
    return Array.from(links);
  });
}

// Extract main content from page
async function extractMainContent(page) {
  return await page.evaluate(() => {
    const selectors = [
      '#root > main',
      'main',
      '[role="main"]',
      '#main-content',
      '.main-content',
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent || '';
        if (text.includes('404') || text.includes('Page Not Found') || text.length < 100) {
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
    
    return null;
  });
}

// Extract metadata from page
async function extractMetadata(page) {
  return await page.evaluate(() => {
    return {
      title: document.querySelector('title')?.textContent?.trim() || '',
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    };
  });
}

// Check if page exists and has content
async function checkPageExists(route) {
  if (route === '/') {
    const pagePath = path.join(APP_DIR, 'page.tsx');
    try {
      const content = await fs.readFile(pagePath, 'utf8');
      return content.length > 1000;
    } catch {
      return false;
    }
  }
  
  if (route.includes(':slug')) {
    return true; // Dynamic routes exist
  }
  
  const routePath = route.replace(/^\//, '').replace(/\//g, path.sep);
  const pagePath = path.join(APP_DIR, routePath, 'page.tsx');
  
  try {
    const content = await fs.readFile(pagePath, 'utf8');
    if (content.includes('404') || content.includes('not found') || content.includes('Content temporarily unavailable')) {
      return false;
    }
    return content.length > 1000;
  } catch {
    return false;
  }
}

// Create or update Next.js page
async function createNextJsPage(route, htmlContent, metadata) {
  const routePath = route === '/' ? APP_DIR : path.join(APP_DIR, route.replace(/^\//, '').replace(/\//g, path.sep));
  const pageFilePath = path.join(routePath, 'page.tsx');
  
  const escapedContent = htmlContent
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
  
  const title = metadata.title || `Police Station Agent`;
  const description = metadata.description || '';
  const canonical = metadata.canonical || `${BASE_URL}${route}`;
  
  const pageContent = `import Header from '@/components/Header';
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

  await fs.mkdir(routePath, { recursive: true });
  await fs.writeFile(pageFilePath, pageContent.trim(), 'utf8');
  console.log(`✅ Created/Updated: ${route}`);
}

// Main comparison and scraping function
async function main() {
  console.log('🔍 Comparing sites and finding missing pages...\n');
  
  // Get current site routes
  const currentRoutes = await getCurrentSiteRoutes();
  console.log(`📁 Found ${currentRoutes.size} routes in current site`);
  
  // Launch browser
  console.log(`\n🌐 Launching browser to crawl ${BASE_URL}...`);
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const discoveredRoutes = new Set(['/']);
  const pagesToScrape = new Set(['/']);
  const scrapedRoutes = new Set();
  const missingPages = [];
  
  try {
    // Crawl the site
    while (pagesToScrape.size > 0 && scrapedRoutes.size < 200) { // Limit to 200 pages
      const route = Array.from(pagesToScrape)[0];
      pagesToScrape.delete(route);
      
      if (scrapedRoutes.has(route)) continue;
      scrapedRoutes.add(route);
      
      const url = `${BASE_URL}${route}`;
      console.log(`\n📥 Scraping: ${url} (${scrapedRoutes.size}/${pagesToScrape.size + scrapedRoutes.size} pages)`);
      
      try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Wait a bit for React to render
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Extract links
        const links = await extractLinksFromPage(page);
        links.forEach(link => {
          if (!discoveredRoutes.has(link) && 
              !link.includes('/admin') && 
              !link.includes('/api') && 
              !link.includes('?') &&
              !link.includes('#') &&
              link.startsWith('/')) {
            discoveredRoutes.add(link);
            pagesToScrape.add(link);
          }
        });
        
        // Check if this page exists in our site
        const exists = await checkPageExists(route);
        
        if (!exists) {
          console.log(`⚠️  Missing page: ${route}`);
          const mainContent = await extractMainContent(page);
          const metadata = await extractMetadata(page);
          
          if (mainContent && mainContent.length > 500) {
            await createNextJsPage(route, mainContent, metadata);
            missingPages.push({ route, status: 'created' });
            console.log(`✅ Scraped and created: ${route}`);
          } else {
            console.log(`❌ Could not extract content for: ${route}`);
            missingPages.push({ route, status: 'no_content' });
          }
        } else {
          console.log(`✅ Page exists: ${route}`);
        }
        
        await page.close();
        
        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error scraping ${route}:`, error.message);
        missingPages.push({ route, status: 'error', error: error.message });
      }
    }
  } finally {
    await browser.close();
  }
  
  // Generate comparison report
  const missingRoutes = Array.from(discoveredRoutes).filter(route => {
    if (route.includes(':slug')) return false;
    return !currentRoutes.has(route);
  });
  
  const report = {
    timestamp: new Date().toISOString(),
    currentSiteRoutes: Array.from(currentRoutes).sort(),
    discoveredRoutes: Array.from(discoveredRoutes).sort(),
    missingRoutes: missingRoutes.sort(),
    missingPages: missingPages,
    totalCurrent: currentRoutes.size,
    totalDiscovered: discoveredRoutes.size,
    totalMissing: missingRoutes.length,
    pagesCreated: missingPages.filter(p => p.status === 'created').length,
  };
  
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, 'site-comparison-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
  
  console.log('\n📊 COMPARISON REPORT:');
  console.log(`   Current site routes: ${currentRoutes.size}`);
  console.log(`   Discovered routes: ${discoveredRoutes.size}`);
  console.log(`   Missing routes: ${missingRoutes.length}`);
  console.log(`   Pages created: ${report.pagesCreated}`);
  console.log(`\n📄 Full report saved to: ${reportPath}`);
  
  if (missingRoutes.length > 0) {
    console.log('\n⚠️  Missing Routes:');
    missingRoutes.slice(0, 20).forEach(route => console.log(`   - ${route}`));
    if (missingRoutes.length > 20) {
      console.log(`   ... and ${missingRoutes.length - 20} more`);
    }
  } else {
    console.log('\n✅ All discovered routes exist in current site!');
  }
  
  if (report.pagesCreated > 0) {
    console.log(`\n✅ Successfully created ${report.pagesCreated} missing pages!`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, getCurrentSiteRoutes };

