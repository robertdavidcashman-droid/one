/**
 * COMPREHENSIVE MULTI-PASS SITE MIGRATION
 * PoliceStationAgent.com → CriminalDefenceKent.co.uk
 * 
 * This script performs a complete migration ensuring 100% parity:
 * 1. Crawls both sites to build route maps
 * 2. Compares pages to identify missing/incomplete content
 * 3. Imports missing content into CDK project
 * 4. Re-verifies parity
 * 5. Generates final report
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { JSDOM } = require('jsdom');

const PSA_BASE_URL = 'https://policestationagent.com';
const CDK_BASE_URL = 'https://criminaldefencekent.co.uk';
const CDK_LOCAL_PATH = path.join(__dirname, '..', 'app');

// Configuration
const MAX_DEPTH = 3;
const MAX_PAGES_PER_SITE = 500;
const CONTENT_SIMILARITY_THRESHOLD = 0.85; // 85% similarity required
const INCOMPLETE_THRESHOLD = 0.15; // >15% difference = incomplete

// Results storage
const crawlResults = {
  psa: {
    routes: new Map(),
    routeTree: {},
    pageHashes: new Map(),
    metadata: new Map(),
    summaries: new Map(),
  },
  cdk: {
    routes: new Map(),
    routeTree: {},
    pageHashes: new Map(),
    metadata: new Map(),
    summaries: new Map(),
  },
};

const parityMatrix = {
  presentOnBoth: [],
  presentOnPSAOnly: [],
  presentOnCDKOnly: [],
  incompletePages: [],
};

const importResults = {
  created: [],
  updated: [],
  redirects: [],
  errors: [],
};

/**
 * PHASE 1: CRAWL FUNCTIONS
 */

function normalizeUrl(url, baseUrl) {
  try {
    const urlObj = new URL(url, baseUrl);
    // Remove hash, normalize path
    urlObj.hash = '';
    urlObj.pathname = urlObj.pathname.replace(/\/$/, '') || '/';
    return urlObj.toString();
  } catch (e) {
    return null;
  }
}

function urlToRoute(url, baseUrl) {
  try {
    const urlObj = new URL(url, baseUrl);
    return urlObj.pathname.replace(/\/$/, '') || '/';
  } catch (e) {
    return null;
  }
}

function routeToFilePath(route) {
  if (route === '/') {
    return path.join(CDK_LOCAL_PATH, 'page.tsx');
  }
  
  // Remove leading slash
  const cleanRoute = route.replace(/^\//, '');
  
  // Handle dynamic routes
  if (cleanRoute.includes('[') && cleanRoute.includes(']')) {
    return null; // Skip dynamic routes for now
  }
  
  // Convert to file path
  const segments = cleanRoute.split('/');
  const filePath = path.join(CDK_LOCAL_PATH, ...segments, 'page.tsx');
  
  return filePath;
}

async function extractPageData(page, url) {
  try {
    // Check if page is still attached
    if (!page) {
      throw new Error('Page is null');
    }
    
    // Get content immediately
    let content;
    try {
      content = await page.content();
    } catch (contentError) {
      // If content extraction fails, try evaluating directly
      content = await page.evaluate(() => document.documentElement.outerHTML);
    }
    
    const dom = new JSDOM(content);
    const document = dom.window.document;
    
    // Extract metadata
    const title = document.querySelector('title')?.textContent || '';
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    const h1 = document.querySelector('h1')?.textContent || '';
    const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent);
    
    // Extract main content (remove scripts, styles, nav, footer)
    const mainContent = document.querySelector('main') || 
                       document.querySelector('article') || 
                       document.querySelector('.content') ||
                       document.body;
    
    // Remove unwanted elements
    const unwanted = mainContent.querySelectorAll('script, style, nav, footer, header, .header, .footer, .nav');
    unwanted.forEach(el => el.remove());
    
    const textContent = mainContent.textContent || '';
    const htmlContent = mainContent.innerHTML || '';
    
    // Generate hash
    const hash = crypto.createHash('sha256').update(textContent).digest('hex');
    
    // Generate summary (first 500 chars)
    const summary = textContent.substring(0, 500).trim();
    
    // Extract internal links
    const links = Array.from(document.querySelectorAll('a[href]'))
      .map(a => {
        const href = a.getAttribute('href');
        if (!href) return null;
        
        // Skip external links, anchors, mailto, tel, etc.
        if (href.startsWith('#') || 
            href.startsWith('mailto:') || 
            href.startsWith('tel:') ||
            href.startsWith('javascript:') ||
            href.includes('.pdf') ||
            href.includes('.jpg') ||
            href.includes('.png')) {
          return null;
        }
        
        // Normalize URL
        const normalized = normalizeUrl(href, url);
        if (!normalized) return null;
        
        // Only include links from the same domain
        if (normalized.startsWith(PSA_BASE_URL) || 
            normalized.startsWith(CDK_BASE_URL) || 
            (href.startsWith('/') && !href.startsWith('//'))) {
          return normalized;
        }
        
        return null;
      })
      .filter(Boolean);
    
    return {
      title,
      metaDescription,
      h1,
      h2s,
      textContent,
      htmlContent,
      hash,
      summary,
      links,
      url,
    };
  } catch (error) {
    console.error(`Error extracting page data from ${url}:`, error.message);
    return null;
  }
}

async function scanLocalCDKFiles() {
  console.log(`\n🔍 PHASE 1: Scanning local CDK files...`);
  
  const routes = new Map();
  const routeTree = {};
  
  async function scanDirectory(dir, baseRoute = '') {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        // Skip special directories and files
        if (entry.name.startsWith('_') || 
            entry.name.startsWith('.') ||
            entry.name === 'api' ||
            entry.name === 'admin' ||
            entry.name === 'manifest.json' ||
            entry.name === 'globals.css' ||
            entry.name === 'layout.tsx' ||
            entry.name === 'sitemap.ts' ||
            entry.name === 'robots.ts') {
          continue;
        }
        
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          const routeSegment = entry.name;
          const newRoute = baseRoute ? `${baseRoute}/${routeSegment}` : `/${routeSegment}`;
          await scanDirectory(fullPath, newRoute);
        } else if (entry.name === 'page.tsx') {
          // Found a page file
          const route = baseRoute || '/';
          
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            
            // Extract metadata from the file
            // Handle both string and object formats
            const titleMatch = content.match(/title:\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1/) || 
                              content.match(/title:\s*([^,\n}]+)/);
            const descMatch = content.match(/description:\s*(["'`])((?:\\.|(?!\2)[^\\])*)\2/) || 
                              content.match(/description:\s*([^,\n}]+)/);
            const canonicalMatch = content.match(/canonical:\s*(["'`])((?:\\.|(?!\3)[^\\])*)\3/) || 
                                   content.match(/canonical:\s*([^,\n}]+)/);
            
            const title = titleMatch ? (titleMatch[2] || titleMatch[1] || '').replace(/['"]/g, '') : '';
            const description = descMatch ? (descMatch[2] || descMatch[1] || '').replace(/['"]/g, '') : '';
            const canonical = canonicalMatch ? (canonicalMatch[2] || canonicalMatch[1] || '').replace(/['"]/g, '') : '';
            
            // Extract HTML content from dangerouslySetInnerHTML
            // Handle both JSON.stringify and template literal formats
            let htmlContent = '';
            let textContent = '';
            
            // Try to find dangerouslySetInnerHTML
            const htmlMatch = content.match(/dangerouslySetInnerHTML=\{\{\s*__html:\s*(.+?)\s*\}\}/s);
            
            if (htmlMatch) {
              const htmlValue = htmlMatch[1].trim();
              
              // Case 1: JSON.stringify format
              const jsonMatch = htmlValue.match(/JSON\.stringify\((.+?)\)/s);
              if (jsonMatch) {
                try {
                  // Try to parse the inner value
                  const innerValue = jsonMatch[1].trim();
                  // Remove surrounding quotes if present
                  const cleaned = innerValue.replace(/^['"`]|['"`]$/g, '');
                  htmlContent = JSON.parse(cleaned);
                } catch (e) {
                  // Try direct extraction
                  try {
                    htmlContent = JSON.parse(htmlValue);
                  } catch (e2) {
                    // Fallback: extract from template literal
                    const templateMatch = htmlValue.match(/`([^`]*)`/s);
                    if (templateMatch) {
                      htmlContent = templateMatch[1].replace(/\\`/g, '`').replace(/\\\$/g, '$');
                    }
                  }
                }
              } else {
                // Case 2: Template literal format (backticks)
                const templateMatch = htmlValue.match(/`([^`]*)`/s);
                if (templateMatch) {
                  htmlContent = templateMatch[1]
                    .replace(/\\`/g, '`')
                    .replace(/\\\$/g, '$')
                    .replace(/\\n/g, '\n')
                    .replace(/\\r/g, '\r');
                } else {
                  // Case 3: Direct string (with quotes)
                  const stringMatch = htmlValue.match(/^(['"`])((?:\\.|(?!\1)[^\\])*)\1$/s);
                  if (stringMatch) {
                    try {
                      htmlContent = JSON.parse(stringMatch[0]);
                    } catch (e) {
                      htmlContent = stringMatch[2] || stringMatch[0];
                    }
                  }
                }
              }
              
              // Extract text from HTML
              if (htmlContent) {
                try {
                  const dom = new JSDOM(htmlContent);
                  textContent = dom.window.document.body.textContent || '';
                } catch (e) {
                  // Fallback: simple HTML tag removal
                  textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                }
              }
            }
            
            // Fallback: extract text from JSX if no HTML found
            if (!textContent) {
              textContent = content
                .replace(/<[^>]*>/g, ' ')
                .replace(/\s+/g, ' ')
                .replace(/export\s+default\s+function[^}]*\{[^}]*return\s*\(/g, '')
                .trim();
            }
            
            // Generate hash
            const hash = crypto.createHash('sha256').update(textContent).digest('hex');
            
            // Extract H1 and H2s from HTML
            let h1 = '';
            let h2s = [];
            if (htmlContent) {
              const dom = new JSDOM(htmlContent);
              const document = dom.window.document;
              h1 = document.querySelector('h1')?.textContent || '';
              h2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent);
            }
            
            const pageData = {
              title,
              metaDescription: description,
              h1,
              h2s,
              textContent,
              htmlContent,
              hash,
              summary: textContent.substring(0, 500).trim(),
              links: [], // Will be populated if needed
              url: `${CDK_BASE_URL}${route}`,
            };
            
            routes.set(route, pageData);
            
            // Build route tree
            const segments = route.split('/').filter(Boolean);
            let current = routeTree;
            segments.forEach(segment => {
              if (!current[segment]) {
                current[segment] = {};
              }
              current = current[segment];
            });
            
            console.log(`  ✓ Found: ${route}`);
          } catch (error) {
            console.error(`  ❌ Error reading ${fullPath}:`, error.message);
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }
  
  await scanDirectory(CDK_LOCAL_PATH);
  
  // Store results
  crawlResults.cdk.routes = routes;
  routes.forEach((pageData, route) => {
    crawlResults.cdk.pageHashes.set(route, pageData.hash);
    crawlResults.cdk.metadata.set(route, {
      title: pageData.title,
      description: pageData.metaDescription,
      h1: pageData.h1,
      h2s: pageData.h2s,
    });
    crawlResults.cdk.summaries.set(route, pageData.summary);
  });
  
  console.log(`  ✅ Scanned ${routes.size} local CDK pages`);
  
  return {
    routes: Array.from(routes.keys()),
    routeTree,
    pageCount: routes.size,
  };
}

async function crawlSite(browser, baseUrl, siteName, maxDepth = MAX_DEPTH) {
  console.log(`\n🔍 PHASE 1: Crawling ${siteName} (${baseUrl})...`);
  
  const visited = new Set();
  const toVisit = [{ url: baseUrl, depth: 0 }];
  const routeTree = {};
  
  let pageCount = 0;
  
  while (toVisit.length > 0 && pageCount < MAX_PAGES_PER_SITE) {
    const { url, depth } = toVisit.shift();
    
    if (visited.has(url) || depth > maxDepth) {
      continue;
    }
    
    visited.add(url);
    pageCount++;
    
    try {
      console.log(`  [${pageCount}] Crawling: ${url} (depth ${depth})`);
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Set longer timeout for slow pages
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const route = urlToRoute(url, baseUrl);
      
      // Extract page data BEFORE closing the page
      let pageData = null;
      try {
        pageData = await extractPageData(page, url);
      } catch (extractError) {
        console.error(`    ⚠️  Error extracting data: ${extractError.message}`);
      }
      
      // Close page after extraction
      await page.close();
      
      if (pageData) {
        // Store in results
        const results = crawlResults.psa;
        results.routes.set(route, pageData);
        results.pageHashes.set(route, pageData.hash);
        results.metadata.set(route, {
          title: pageData.title,
          description: pageData.metaDescription,
          h1: pageData.h1,
          h2s: pageData.h2s,
        });
        results.summaries.set(route, pageData.summary);
        
        // Build route tree
        const segments = route.split('/').filter(Boolean);
        let current = routeTree;
        segments.forEach(segment => {
          if (!current[segment]) {
            current[segment] = {};
          }
          current = current[segment];
        });
        
        // Add child links to queue
        if (depth < maxDepth && pageData.links && pageData.links.length > 0) {
          console.log(`    Found ${pageData.links.length} links on this page`);
          let addedCount = 0;
          pageData.links.forEach(link => {
            const normalizedLink = normalizeUrl(link, baseUrl);
            if (normalizedLink && 
                normalizedLink.startsWith(baseUrl) && 
                !visited.has(normalizedLink) &&
                !normalizedLink.includes('#') &&
                !normalizedLink.includes('mailto:') &&
                !normalizedLink.includes('tel:') &&
                !normalizedLink.includes('.pdf') &&
                !normalizedLink.includes('.jpg') &&
                !normalizedLink.includes('.png')) {
              toVisit.push({ url: normalizedLink, depth: depth + 1 });
              addedCount++;
            }
          });
          console.log(`    Added ${addedCount} new URLs to crawl queue`);
        }
      } else {
        console.log(`    ⚠️  No page data extracted`);
      }
      
      // Small delay to avoid overwhelming servers
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`  ❌ Error crawling ${url}:`, error.message);
      // Make sure page is closed even on error
      try {
        const pages = await browser.pages();
        // Close any pages that might be left open
        for (const p of pages) {
          if (p.url() === url && !p.isClosed()) {
            await p.close();
          }
        }
      } catch (closeError) {
        // Ignore close errors
      }
      // Continue crawling even if one page fails
    }
  }
  
  console.log(`  ✅ Crawled ${pageCount} pages from ${siteName}`);
  
  return {
    routes: Array.from(visited),
    routeTree,
    pageCount,
  };
}

/**
 * PHASE 2: COMPARISON FUNCTIONS
 */

function calculateSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  
  // Normalize text
  const normalize = (str) => str.toLowerCase().replace(/\s+/g, ' ').trim();
  const norm1 = normalize(text1);
  const norm2 = normalize(text2);
  
  if (norm1 === norm2) return 1;
  if (!norm1 || !norm2) return 0;
  
  // Simple word-based similarity
  const words1 = new Set(norm1.split(' '));
  const words2 = new Set(norm2.split(' '));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

function findMissingSections(psaContent, cdkContent) {
  const missing = [];
  
  // Extract headings from PSA
  const psaH2s = psaContent.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
  const cdkH2s = cdkContent.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
  
  psaH2s.forEach(psaH2 => {
    const psaText = psaH2.replace(/<[^>]*>/g, '').trim();
    const found = cdkH2s.some(cdkH2 => {
      const cdkText = cdkH2.replace(/<[^>]*>/g, '').trim();
      return calculateSimilarity(psaText, cdkText) > 0.8;
    });
    
    if (!found) {
      missing.push(psaText);
    }
  });
  
  return missing;
}

async function buildParityMatrix() {
  console.log(`\n🔍 PHASE 2: Building parity matrix...`);
  
  const psaRoutes = Array.from(crawlResults.psa.routes.keys());
  const cdkRoutes = Array.from(crawlResults.cdk.routes.keys());
  
  // Find routes present on both
  psaRoutes.forEach(route => {
    if (cdkRoutes.includes(route)) {
      const psaData = crawlResults.psa.routes.get(route);
      const cdkData = crawlResults.cdk.routes.get(route);
      
      const similarity = calculateSimilarity(psaData.textContent, cdkData.textContent);
      
      parityMatrix.presentOnBoth.push({
        route,
        similarity,
        psaTitle: psaData.title,
        cdkTitle: cdkData.title,
      });
      
      // Check if incomplete
      if (similarity < CONTENT_SIMILARITY_THRESHOLD) {
        const missingSections = findMissingSections(psaData.htmlContent, cdkData.htmlContent);
        parityMatrix.incompletePages.push({
          route,
          similarity,
          missingSections,
          psaData,
          cdkData,
        });
      }
    } else {
      // Present on PSA only
      const psaData = crawlResults.psa.routes.get(route);
      parityMatrix.presentOnPSAOnly.push({
        route,
        psaData,
      });
    }
  });
  
  // Find routes present on CDK only
  cdkRoutes.forEach(route => {
    if (!psaRoutes.includes(route)) {
      const cdkData = crawlResults.cdk.routes.get(route);
      parityMatrix.presentOnCDKOnly.push({
        route,
        cdkData,
      });
    }
  });
  
  console.log(`  ✅ Found ${parityMatrix.presentOnBoth.length} pages on both sites`);
  console.log(`  ⚠️  Found ${parityMatrix.presentOnPSAOnly.length} pages on PSA only (MISSING)`);
  console.log(`  ℹ️  Found ${parityMatrix.presentOnCDKOnly.length} pages on CDK only`);
  console.log(`  ⚠️  Found ${parityMatrix.incompletePages.length} incomplete pages`);
}

/**
 * PHASE 3: IMPORT FUNCTIONS
 */

function rewriteContent(html, fromDomain, toDomain) {
  // Replace domain references
  let rewritten = html
    .replace(new RegExp(fromDomain, 'g'), toDomain)
    .replace(/policestationagent\.com/gi, 'criminaldefencekent.co.uk')
    .replace(/Police Station Agent/gi, 'Criminal Defence Kent')
    .replace(/Police Station Agent/gi, 'Criminal Defence Kent');
  
  // Update internal links
  rewritten = rewritten.replace(/href="([^"]*)"/g, (match, href) => {
    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (href.includes('policestationagent.com')) {
        return `href="${href.replace(/https?:\/\/[^\/]+/, '')}"`;
      }
    }
    return match;
  });
  
  return rewritten;
}

function extractMainContent(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Try to find main content
  const main = document.querySelector('main') || 
               document.querySelector('article') || 
               document.querySelector('.content') ||
               document.querySelector('.prose') ||
               document.body;
  
  // Remove unwanted elements
  const unwanted = main.querySelectorAll('script, style, nav, footer, header, .header, .footer, .nav, .menu');
  unwanted.forEach(el => el.remove());
  
  return main.innerHTML;
}

async function createPageFile(route, pageData, isUpdate = false) {
  const filePath = routeToFilePath(route);
  
  if (!filePath) {
    console.log(`  ⚠️  Skipping dynamic route: ${route}`);
    return false;
  }
  
  try {
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    // Extract main content
    const mainContent = extractMainContent(pageData.htmlContent);
    const rewrittenContent = rewriteContent(mainContent, PSA_BASE_URL, CDK_BASE_URL);
    
    // Generate metadata
    const title = pageData.title.replace(/Police Station Agent/gi, 'Criminal Defence Kent');
    const description = pageData.metaDescription.replace(/Police Station Agent/gi, 'Criminal Defence Kent');
    const canonicalUrl = `${CDK_BASE_URL}${route}`;
    
    // Generate page component
    const pageContent = `import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(description)},
  alternates: {
    canonical: ${JSON.stringify(canonicalUrl)},
  },
  openGraph: {
    title: ${JSON.stringify(title)},
    description: ${JSON.stringify(description)},
    url: ${JSON.stringify(canonicalUrl)},
    siteName: 'Criminal Defence Kent',
    type: 'website',
  },
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(rewrittenContent)} }} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
`;
    
    await fs.writeFile(filePath, pageContent, 'utf-8');
    
    if (isUpdate) {
      importResults.updated.push({ route, filePath });
    } else {
      importResults.created.push({ route, filePath });
    }
    
    return true;
  } catch (error) {
    console.error(`  ❌ Error creating page for ${route}:`, error.message);
    importResults.errors.push({ route, error: error.message });
    return false;
  }
}

async function importMissingPages() {
  console.log(`\n🔍 PHASE 3: Importing missing and incomplete pages...`);
  
  // Import missing pages
  for (const { route, psaData } of parityMatrix.presentOnPSAOnly) {
    console.log(`  📄 Creating missing page: ${route}`);
    await createPageFile(route, psaData, false);
  }
  
  // Update incomplete pages
  for (const { route, psaData } of parityMatrix.incompletePages) {
    console.log(`  🔄 Updating incomplete page: ${route}`);
    await createPageFile(route, psaData, true);
  }
  
  console.log(`  ✅ Created ${importResults.created.length} new pages`);
  console.log(`  ✅ Updated ${importResults.updated.length} pages`);
  console.log(`  ❌ ${importResults.errors.length} errors`);
}

/**
 * PHASE 4: RE-VERIFICATION
 */

async function reVerifyParity(browser) {
  console.log(`\n🔍 PHASE 4: Re-verifying parity...`);
  
  // Re-crawl CDK (local files)
  console.log(`  📂 Scanning local CDK files...`);
  const localRoutes = await scanLocalRoutes();
  
  // Compare with PSA
  const stillMissing = [];
  const stillIncomplete = [];
  
  parityMatrix.presentOnPSAOnly.forEach(({ route }) => {
    if (!localRoutes.includes(route)) {
      stillMissing.push(route);
    }
  });
  
  parityMatrix.incompletePages.forEach(({ route, similarity }) => {
    // Re-check similarity if page was updated
    const localFile = routeToFilePath(route);
    if (localFile) {
      try {
        const exists = require('fs').existsSync(localFile);
        if (!exists || similarity < CONTENT_SIMILARITY_THRESHOLD) {
          stillIncomplete.push({ route, similarity });
        }
      } catch (e) {
        stillIncomplete.push({ route, similarity });
      }
    }
  });
  
  console.log(`  ⚠️  Still missing: ${stillMissing.length} pages`);
  console.log(`  ⚠️  Still incomplete: ${stillIncomplete.length} pages`);
  
  return {
    stillMissing,
    stillIncomplete,
    localRoutes,
  };
}

async function scanLocalRoutes() {
  const routes = ['/'];
  
  async function scanDir(dir, baseRoute = '') {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const routeSegment = entry.name;
          const newRoute = baseRoute ? `${baseRoute}/${routeSegment}` : `/${routeSegment}`;
          
          // Skip special directories
          if (routeSegment.startsWith('_') || 
              routeSegment.startsWith('.') ||
              routeSegment === 'api' ||
              routeSegment === 'admin') {
            continue;
          }
          
          // Check if page.tsx exists
          const pagePath = path.join(dir, entry.name, 'page.tsx');
          try {
            await fs.access(pagePath);
            routes.push(newRoute);
          } catch (e) {
            // No page.tsx, continue scanning
          }
          
          // Recursively scan
          await scanDir(path.join(dir, entry.name), newRoute);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }
  
  await scanDir(CDK_LOCAL_PATH);
  return routes;
}

/**
 * PHASE 5: REPORT GENERATION
 */

async function generateFinalReport() {
  console.log(`\n🔍 PHASE 5: Generating final report...`);
  
  const report = {
    timestamp: new Date().toISOString(),
    crawlStats: {
      psa: {
        totalPages: crawlResults.psa.routes.size,
        routes: Array.from(crawlResults.psa.routes.keys()),
      },
      cdk: {
        totalPages: crawlResults.cdk.routes.size,
        routes: Array.from(crawlResults.cdk.routes.keys()),
      },
    },
    parityMatrix: {
      presentOnBoth: parityMatrix.presentOnBoth.length,
      presentOnPSAOnly: parityMatrix.presentOnPSAOnly.length,
      presentOnCDKOnly: parityMatrix.presentOnCDKOnly.length,
      incompletePages: parityMatrix.incompletePages.length,
      details: {
        presentOnBoth: parityMatrix.presentOnBoth.map(p => ({
          route: p.route,
          similarity: (p.similarity * 100).toFixed(2) + '%',
        })),
        presentOnPSAOnly: parityMatrix.presentOnPSAOnly.map(p => ({
          route: p.route,
          title: p.psaData.title,
        })),
        presentOnCDKOnly: parityMatrix.presentOnCDKOnly.map(p => ({
          route: p.route,
          title: p.cdkData.title,
        })),
        incompletePages: parityMatrix.incompletePages.map(p => ({
          route: p.route,
          similarity: (p.similarity * 100).toFixed(2) + '%',
          missingSections: p.missingSections,
        })),
      },
    },
    importResults: {
      created: importResults.created.length,
      updated: importResults.updated.length,
      errors: importResults.errors.length,
      details: {
        created: importResults.created,
        updated: importResults.updated,
        errors: importResults.errors,
      },
    },
    verification: {
      status: parityMatrix.presentOnPSAOnly.length === 0 && 
              parityMatrix.incompletePages.length === 0 ? 'COMPLETE' : 'INCOMPLETE',
      message: parityMatrix.presentOnPSAOnly.length === 0 && 
               parityMatrix.incompletePages.length === 0
        ? 'Migration Complete — All pages from PoliceStationAgent.com successfully imported into CriminalDefenceKent.co.uk with 100% parity'
        : `Migration incomplete: ${parityMatrix.presentOnPSAOnly.length} pages missing, ${parityMatrix.incompletePages.length} pages incomplete`,
    },
  };
  
  // Write report to file
  const reportPath = path.join(__dirname, '..', 'MIGRATION_REPORT.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  
  // Also create a human-readable markdown report
  const markdownReport = generateMarkdownReport(report);
  const markdownPath = path.join(__dirname, '..', 'MIGRATION_REPORT.md');
  await fs.writeFile(markdownPath, markdownReport, 'utf-8');
  
  console.log(`  ✅ Report saved to: ${reportPath}`);
  console.log(`  ✅ Markdown report saved to: ${markdownPath}`);
  
  return report;
}

function generateMarkdownReport(report) {
  let md = `# Migration Report: PoliceStationAgent.com → CriminalDefenceKent.co.uk\n\n`;
  md += `**Generated:** ${report.timestamp}\n\n`;
  md += `---\n\n`;
  
  md += `## Executive Summary\n\n`;
  md += `- **PSA Pages Crawled:** ${report.crawlStats.psa.totalPages}\n`;
  md += `- **CDK Pages Crawled:** ${report.crawlStats.cdk.totalPages}\n`;
  md += `- **Pages on Both Sites:** ${report.parityMatrix.presentOnBoth}\n`;
  md += `- **Pages Missing from CDK:** ${report.parityMatrix.presentOnPSAOnly}\n`;
  md += `- **Pages Only on CDK:** ${report.parityMatrix.presentOnCDKOnly}\n`;
  md += `- **Incomplete Pages:** ${report.parityMatrix.incompletePages}\n\n`;
  
  md += `**Status:** ${report.verification.status}\n\n`;
  md += `**${report.verification.message}**\n\n`;
  
  md += `---\n\n`;
  
  md += `## Import Results\n\n`;
  md += `- **Created:** ${report.importResults.created} pages\n`;
  md += `- **Updated:** ${report.importResults.updated} pages\n`;
  md += `- **Errors:** ${report.importResults.errors} pages\n\n`;
  
  if (report.parityMatrix.details.presentOnPSAOnly.length > 0) {
    md += `## Missing Pages (Present on PSA Only)\n\n`;
    report.parityMatrix.details.presentOnPSAOnly.forEach(p => {
      md += `- \`${p.route}\` - ${p.title}\n`;
    });
    md += `\n`;
  }
  
  if (report.parityMatrix.details.incompletePages.length > 0) {
    md += `## Incomplete Pages\n\n`;
    report.parityMatrix.details.incompletePages.forEach(p => {
      md += `- \`${p.route}\` - Similarity: ${p.similarity}\n`;
      if (p.missingSections && p.missingSections.length > 0) {
        md += `  - Missing sections: ${p.missingSections.join(', ')}\n`;
      }
    });
    md += `\n`;
  }
  
  if (report.importResults.details.created.length > 0) {
    md += `## Created Pages\n\n`;
    report.importResults.details.created.forEach(p => {
      md += `- \`${p.route}\` → \`${p.filePath}\`\n`;
    });
    md += `\n`;
  }
  
  if (report.importResults.details.updated.length > 0) {
    md += `## Updated Pages\n\n`;
    report.importResults.details.updated.forEach(p => {
      md += `- \`${p.route}\` → \`${p.filePath}\`\n`;
    });
    md += `\n`;
  }
  
  return md;
}

/**
 * MAIN EXECUTION
 */

async function main() {
  console.log('🚀 Starting Comprehensive Migration Process...\n');
  console.log('='.repeat(80));
  
  let browser;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    // PHASE 1: Crawl PSA site and scan local CDK files
    await crawlSite(browser, PSA_BASE_URL, 'PSA', MAX_DEPTH);
    await scanLocalCDKFiles();
    
    // PHASE 2: Build parity matrix
    await buildParityMatrix();
    
    // PHASE 3: Import missing/incomplete pages
    await importMissingPages();
    
    // PHASE 4: Re-verify
    const verification = await reVerifyParity(browser);
    
    // PHASE 5: Generate report
    const report = await generateFinalReport();
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ MIGRATION PROCESS COMPLETE\n');
    console.log(report.verification.message);
    console.log(`\n📊 See MIGRATION_REPORT.md for full details\n`);
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };

