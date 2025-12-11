/**
 * Comprehensive Page Audit & Scraper
 * 
 * 1. Extracts all linked pages from Header, Footer, and internal links
 * 2. Checks which pages exist vs which are referenced
 * 3. Identifies missing pages
 * 4. Scrapes missing pages from live site
 * 5. Rebuilds them as Next.js pages
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

// Routes that exist in the app directory
async function getExistingRoutes() {
  const routes = new Set(['/']); // Homepage always exists
  
  async function scanDirectory(dir, baseRoute = '') {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const route = baseRoute + '/' + entry.name.replace(/\.tsx?$/, '').replace(/\[slug\]/, ':slug');
        
        if (entry.isDirectory()) {
          // Check if it has a page.tsx
          const pagePath = path.join(fullPath, 'page.tsx');
          try {
            await fs.access(pagePath);
            routes.add(route);
          } catch {
            // No page.tsx, but directory exists
          }
          await scanDirectory(fullPath, route);
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

// Extract all links from Header and Footer components
async function extractLinksFromComponents() {
  const links = new Set();
  
  // Read Header
  const headerPath = path.join(__dirname, '..', 'components', 'Header.tsx');
  const headerContent = await fs.readFile(headerPath, 'utf8');
  
  // Extract href="/..." patterns
  const headerMatches = headerContent.matchAll(/href=["']\/([^"']+)["']/g);
  for (const match of headerMatches) {
    const route = '/' + match[1];
    if (!route.includes('http') && !route.includes('mailto') && !route.includes('tel') && !route.includes('sms')) {
      links.add(route);
    }
  }
  
  // Read Footer
  const footerPath = path.join(__dirname, '..', 'components', 'Footer.tsx');
  const footerContent = await fs.readFile(footerPath, 'utf8');
  
  const footerMatches = footerContent.matchAll(/href=["']\/([^"']+)["']/g);
  for (const match of footerMatches) {
    const route = '/' + match[1];
    if (!route.includes('http') && !route.includes('mailto') && !route.includes('tel') && !route.includes('sms')) {
      links.add(route);
    }
  }
  
  // Scan all app pages for internal links
  async function scanPagesForLinks(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await scanPagesForLinks(fullPath);
        } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
          try {
            const content = await fs.readFile(fullPath, 'utf8');
            const matches = content.matchAll(/href=["']\/([^"']+)["']/g);
            for (const match of matches) {
              const route = '/' + match[1];
              if (!route.includes('http') && !route.includes('mailto') && !route.includes('tel') && !route.includes('sms') && !route.includes('post?slug')) {
                links.add(route);
              }
            }
          } catch (error) {
            // Can't read file
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist
    }
  }
  
  await scanPagesForLinks(APP_DIR);
  
  return links;
}

// Convert route to URL path
function routeToUrl(route) {
  // Remove leading slash if present
  route = route.replace(/^\//, '');
  
  // Handle dynamic routes
  if (route.includes(':slug')) {
    return null; // Skip dynamic routes for now
  }
  
  // Convert kebab-case to original format for URL
  // Most routes should work as-is, but some might need conversion
  return route;
}

// Fetch page from live site
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
    
    https.get(fullUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode} for ${fullUrl}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Extract main content from HTML
function extractMainContent(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Try to find main content
  const main = document.querySelector('main') || document.querySelector('#root > main') || document.querySelector('body');
  
  if (main) {
    return main.innerHTML;
  }
  
  return html;
}

// Generate Next.js page from scraped content
async function generatePage(route, content, title) {
  const routePath = route.replace(/^\//, '').replace(/\//g, path.sep);
  const pageDir = path.join(APP_DIR, routePath);
  const pageFile = path.join(pageDir, 'page.tsx');
  
  // Ensure directory exists
  await fs.mkdir(pageDir, { recursive: true });
  
  // Generate page content
  const pageContent = `import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "${title || route.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | Police Station Agent",
  description: "${title || 'Police Station Agent'}",
  alternates: {
    canonical: "https://policestationagent.com${route}",
  },
  openGraph: {
    title: "${title || route.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | Police Station Agent",
    description: "${title || 'Police Station Agent'}",
    type: 'website',
    url: "https://policestationagent.com${route}",
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
            dangerouslySetInnerHTML={{ __html: \`${content.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
`;
  
  await fs.writeFile(pageFile, pageContent, 'utf8');
  console.log(`✅ Created: ${route} -> ${pageFile}`);
}

// Main audit function
async function main() {
  console.log('🔍 Starting comprehensive page audit...\n');
  
  // Get all existing routes
  const existingRoutes = await getExistingRoutes();
  console.log(`📁 Found ${existingRoutes.size} existing routes`);
  
  // Get all linked routes
  const linkedRoutes = await extractLinksFromComponents();
  console.log(`🔗 Found ${linkedRoutes.size} linked routes\n`);
  
  // Find missing routes
  const missingRoutes = [];
  const routesWithContent = [];
  const routesNeedingContent = [];
  
  for (const route of linkedRoutes) {
    // Normalize route (remove query params, handle dynamic routes)
    const normalizedRoute = route.split('?')[0].split('#')[0];
    
    // Check if route exists
    const routeExists = existingRoutes.has(normalizedRoute) || 
                       existingRoutes.has(normalizedRoute + '/') ||
                       normalizedRoute === '/' ||
                       normalizedRoute.includes(':slug') ||
                       normalizedRoute.includes('[slug]');
    
    if (!routeExists) {
      missingRoutes.push(normalizedRoute);
    } else {
      // Check if page has real content or is just placeholder
      const routePath = normalizedRoute.replace(/^\//, '').replace(/\//g, path.sep);
      const pageFile = path.join(APP_DIR, routePath, 'page.tsx');
      
      try {
        const content = await fs.readFile(pageFile, 'utf8');
        // Check if it's placeholder content (contains "404" or very short)
        if (content.includes('404') || content.length < 500) {
          routesNeedingContent.push(normalizedRoute);
        } else {
          routesWithContent.push(normalizedRoute);
        }
      } catch {
        // File doesn't exist or can't be read
        missingRoutes.push(normalizedRoute);
      }
    }
  }
  
  // Generate report
  console.log('\n📊 AUDIT RESULTS:\n');
  console.log(`✅ Routes with content: ${routesWithContent.length}`);
  console.log(`⚠️  Routes needing content: ${routesNeedingContent.length}`);
  console.log(`❌ Missing routes: ${missingRoutes.length}\n`);
  
  if (routesNeedingContent.length > 0) {
    console.log('⚠️  Routes needing content:');
    routesNeedingContent.forEach(route => console.log(`   - ${route}`));
    console.log('');
  }
  
  if (missingRoutes.length > 0) {
    console.log('❌ Missing routes:');
    missingRoutes.forEach(route => console.log(`   - ${route}`));
    console.log('');
  }
  
  // Save report
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const report = {
    timestamp: new Date().toISOString(),
    existingRoutes: Array.from(existingRoutes),
    linkedRoutes: Array.from(linkedRoutes),
    routesWithContent,
    routesNeedingContent,
    missingRoutes,
  };
  
  await fs.writeFile(
    path.join(REPORT_DIR, 'comprehensive-audit.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );
  
  // Scrape missing pages
  const pagesToScrape = [...missingRoutes, ...routesNeedingContent];
  
  if (pagesToScrape.length > 0) {
    console.log(`\n🌐 Scraping ${pagesToScrape.length} pages from live site...\n`);
    
    await fs.mkdir(SCRAPED_DIR, { recursive: true });
    
    for (const route of pagesToScrape) {
      try {
        const url = routeToUrl(route);
        if (!url) {
          console.log(`⏭️  Skipping dynamic route: ${route}`);
          continue;
        }
        
        console.log(`📥 Scraping: ${route}...`);
        const html = await fetchPage(route);
        const content = extractMainContent(html);
        
        // Extract title
        const dom = new JSDOM(html);
        const title = dom.window.document.querySelector('title')?.textContent || 
                     dom.window.document.querySelector('h1')?.textContent || 
                     route.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Save scraped HTML
        const filename = route.replace(/^\//, '').replace(/\//g, '-') || 'home';
        await fs.writeFile(
          path.join(SCRAPED_DIR, `${filename}.html`),
          html,
          'utf8'
        );
        
        // Generate Next.js page
        await generatePage(route, content, title);
        
        console.log(`✅ Scraped and created: ${route}\n`);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error scraping ${route}:`, error.message);
      }
    }
  }
  
  console.log('\n✅ Audit complete!');
  console.log(`📄 Report saved to: ${path.join(REPORT_DIR, 'comprehensive-audit.json')}`);
}

main().catch(console.error);

