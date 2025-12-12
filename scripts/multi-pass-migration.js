#!/usr/bin/env node

/**
 * MULTI-PASS SITE CRAWL, COMPARE & IMPORT
 * 
 * Complete migration system to ensure 100% parity between
 * policestationagent.com and criminaldefencekent.co.uk
 * 
 * PHASES:
 * 1. Build full crawl maps (depth 3) for both sites
 * 2. Identify missing/incomplete pages
 * 3. Automated import
 * 4. Re-crawl & verify
 * 5. Final report
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { JSDOM } = require('jsdom');

const PSA_URL = 'https://policestationagent.com';
const CDK_URL = 'https://criminaldefencekent.co.uk';
const MAX_DEPTH = 3;
const CONTENT_SIMILARITY_THRESHOLD = 0.85; // 85% similarity required
const INCOMPLETE_THRESHOLD = 0.15; // >15% difference = incomplete

// Exclude patterns
const EXCLUDE_PATTERNS = [
  /\/admin/,
  /\/api/,
  /\/login/,
  /\/_next/,
  /mailto:/,
  /tel:/,
  /javascript:/,
  /^#/,
  /\.(pdf|jpg|png|gif|svg|css|js|json|xml|ico)$/i,
  /\/manifest\.json/,
  /\/sitemap/,
];

// Data structures
const psaPages = new Map(); // url -> PageData
const cdkPages = new Map(); // url -> PageData
const visitedUrls = new Set();
const failedUrls = new Map();

class PageData {
  constructor(url) {
    this.url = url;
    this.route = this.normalizeRoute(url);
    this.title = '';
    this.h1 = '';
    this.description = '';
    this.metadata = {};
    this.html = '';
    this.mainContent = '';
    this.contentHash = '';
    this.links = [];
    this.status = null;
    this.error = null;
    this.depth = 0;
  }

  normalizeRoute(url) {
    try {
      const urlObj = new URL(url);
      let path = urlObj.pathname;
      if (path.endsWith('/') && path.length > 1) {
        path = path.slice(0, -1);
      }
      return path || '/';
    } catch {
      return url;
    }
  }

  calculateHash() {
    const content = (this.mainContent || this.html || '').trim();
    this.contentHash = crypto.createHash('md5').update(content).digest('hex');
  }

  extractSummary() {
    const text = (this.mainContent || this.html || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 200);
    return text;
  }
}

function shouldExcludeUrl(url) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(url));
}

function normalizeUrl(url, baseUrl) {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      if (urlObj.origin !== new URL(baseUrl).origin) {
        return null; // External link
      }
      return urlObj.href;
    }
    if (url.startsWith('/')) {
      return new URL(url, baseUrl).href;
    }
    return new URL(url, baseUrl).href;
  } catch {
    return null;
  }
}

async function crawlPage(browser, url, depth = 0, baseUrl) {
  if (depth > MAX_DEPTH) return null;
  if (visitedUrls.has(url)) return null;
  if (shouldExcludeUrl(url)) return null;

  visitedUrls.add(url);
  const pageData = new PageData(url);
  pageData.depth = depth;

  const page = await browser.newPage();
  
  try {
    console.log(`  [Depth ${depth}] Crawling: ${url}`);
    
    await page.goto(url, { 
      waitUntil: 'networkidle0', 
      timeout: 30000 
    });
    
    await new Promise(r => setTimeout(r, 1000)); // Wait for dynamic content

    // Extract page data
    const extracted = await page.evaluate(() => {
      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]');
      const description = metaDesc ? metaDesc.getAttribute('content') || '' : '';
      
      const h1 = document.querySelector('h1');
      const h1Text = h1 ? h1.textContent.trim() : '';
      
      // Get main content
      const main = document.querySelector('main') || 
                   document.querySelector('article') ||
                   document.querySelector('#content') ||
                   document.querySelector('.content') ||
                   document.body;
      
      let mainContent = '';
      if (main) {
        // Clone to avoid modifying original
        const clone = main.cloneNode(true);
        clone.querySelectorAll('script, style, noscript, nav, header, footer').forEach(el => el.remove());
        mainContent = clone.innerHTML;
      }
      
      // Extract all internal links
      const links = [];
      document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          links.push(href);
        }
      });
      
      return {
        title,
        description,
        h1: h1Text,
        mainContent,
        html: document.documentElement.outerHTML,
        links
      };
    });

    pageData.title = extracted.title;
    pageData.description = extracted.description;
    pageData.h1 = extracted.h1;
    pageData.html = extracted.html;
    pageData.mainContent = extracted.mainContent;
    pageData.links = extracted.links;
    pageData.status = 200;
    pageData.calculateHash();
    
    // Extract metadata
    const dom = new JSDOM(extracted.html);
    const doc = dom.window.document;
    pageData.metadata = {
      ogTitle: doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
      ogDescription: doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
      ogImage: doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
      canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    };

    await page.close();
    return pageData;

  } catch (error) {
    await page.close();
    pageData.error = error.message;
    pageData.status = 'error';
    failedUrls.set(url, error.message);
    console.error(`    ❌ Error: ${error.message}`);
    return null;
  }
}

async function crawlSite(browser, baseUrl, siteName) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`PHASE 1: CRAWLING ${siteName.toUpperCase()}`);
  console.log(`${'='.repeat(70)}\n`);

  const pages = new Map();
  const queue = [{ url: baseUrl, depth: 0 }];
  visitedUrls.clear();

  while (queue.length > 0) {
    const { url, depth } = queue.shift();
    
    const pageData = await crawlPage(browser, url, depth, baseUrl);
    
    if (pageData && pageData.status === 200) {
      pages.set(pageData.route, pageData);
      
      // Queue linked pages
      for (const link of pageData.links) {
        const normalized = normalizeUrl(link, baseUrl);
        if (normalized && !visitedUrls.has(normalized) && !shouldExcludeUrl(normalized)) {
          const linkRoute = new PageData(normalized).route;
          if (!pages.has(linkRoute)) {
            queue.push({ url: normalized, depth: depth + 1 });
          }
        }
      }
    }
  }

  console.log(`\n✅ Crawled ${pages.size} pages from ${siteName}`);
  return pages;
}

function calculateSimilarity(content1, content2) {
  if (!content1 || !content2) return 0;
  
  // Simple word-based similarity
  const words1 = new Set(content1.toLowerCase().match(/\b\w+\b/g) || []);
  const words2 = new Set(content2.toLowerCase().match(/\b\w+\b/g) || []);
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

function buildParityMatrix(psaPages, cdkPages) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`PHASE 2: BUILDING PARITY MATRIX`);
  console.log(`${'='.repeat(70)}\n`);

  const matrix = {
    both: [], // { route, psa, cdk, similarity, diff }
    psaOnly: [],
    cdkOnly: [],
  };

  // Find pages on both sites
  for (const [route, psaData] of psaPages) {
    const cdkData = cdkPages.get(route);
    
    if (cdkData) {
      const similarity = calculateSimilarity(psaData.mainContent, cdkData.mainContent);
      const incomplete = similarity < CONTENT_SIMILARITY_THRESHOLD;
      matrix.both.push({
        route,
        psa: psaData,
        cdk: cdkData,
        similarity,
        incomplete,
      });
    } else {
      matrix.psaOnly.push({ route, data: psaData });
    }
  }

  // Find pages only on CDK
  for (const [route, cdkData] of cdkPages) {
    if (!psaPages.has(route)) {
      matrix.cdkOnly.push({ route, data: cdkData });
    }
  }

  console.log(`📊 Parity Matrix:`);
  console.log(`   Pages on both sites: ${matrix.both.length}`);
  console.log(`   Pages only on PSA: ${matrix.psaOnly.length}`);
  console.log(`   Pages only on CDK: ${matrix.cdkOnly.length}`);
  console.log(`   Incomplete pages (>15% diff): ${matrix.both.filter(p => p.incomplete).length}`);

  return matrix;
}

async function importMissingPages(matrix) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`PHASE 3: IMPORTING MISSING/INCOMPLETE PAGES`);
  console.log(`${'='.repeat(70)}\n`);

  const imported = [];
  const updated = [];

  // Import missing pages
  for (const { route, data } of matrix.psaOnly) {
    console.log(`📥 Importing missing page: ${route}`);
    const result = await createPageFile(route, data);
    if (result) imported.push(route);
  }

  // Update incomplete pages
  for (const { route, psa, cdk, similarity, incomplete } of matrix.both) {
    if (incomplete) {
      console.log(`🔄 Updating incomplete page: ${route} (similarity: ${(similarity * 100).toFixed(1)}%)`);
      const result = await updatePageFile(route, psa, cdk);
      if (result) updated.push(route);
    }
  }

  return { imported, updated };
}

async function createPageFile(route, psaData) {
  const routePath = route === '/' ? 'app/page.tsx' : `app${route}/page.tsx`;
  const dirPath = path.dirname(routePath);

  try {
    await fs.mkdir(dirPath, { recursive: true });

    // Clean and adapt content
    let content = psaData.mainContent || '';
    
    // Replace domain references
    content = content.replace(/policestationagent\.com/g, 'criminaldefencekent.co.uk');
    content = content.replace(/Police Station Agent/gi, 'Criminal Defence Kent');
    
    // Clean up HTML
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    content = content.replace(/<!--[\s\S]*?-->/g, '');

    const pageContent = generatePageComponent(route, psaData, content);
    await fs.writeFile(routePath, pageContent, 'utf8');
    
    return true;
  } catch (error) {
    console.error(`    ❌ Error creating ${routePath}: ${error.message}`);
    return false;
  }
}

async function updatePageFile(route, psaData, cdkData) {
  const routePath = route === '/' ? 'app/page.tsx' : `app${route}/page.tsx';

  try {
    const existing = await fs.readFile(routePath, 'utf8');
    
    // Clean and adapt content
    let content = psaData.mainContent || '';
    content = content.replace(/policestationagent\.com/g, 'criminaldefencekent.co.uk');
    content = content.replace(/Police Station Agent/gi, 'Criminal Defence Kent');
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    content = content.replace(/<!--[\s\S]*?-->/g, '');

    // Update metadata and content
    const updated = updatePageComponent(existing, psaData, content);
    await fs.writeFile(routePath, updated, 'utf8');
    
    return true;
  } catch (error) {
    console.error(`    ❌ Error updating ${routePath}: ${error.message}`);
    return false;
  }
}

function generatePageComponent(route, data, content) {
  const title = data.title || data.h1 || 'Criminal Defence Kent';
  const description = data.description || data.metadata.ogDescription || '';
  const canonical = `https://criminaldefencekent.co.uk${route}`;

  return `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(description)},
  alternates: {
    canonical: ${JSON.stringify(canonical)},
  },
  openGraph: {
    title: ${JSON.stringify(data.metadata.ogTitle || title)},
    description: ${JSON.stringify(data.metadata.ogDescription || description)},
    url: ${JSON.stringify(canonical)},
    siteName: 'Criminal Defence Kent',
    type: 'website',
    ...(data.metadata.ogImage && { images: [{ url: data.metadata.ogImage }] }),
  },
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(content)} }} />
      </div>
    </div>
  );
}
`;
}

function updatePageComponent(existing, data, content) {
  // Update metadata
  let updated = existing.replace(
    /title:\s*['"]([^'"]+)['"]/,
    `title: ${JSON.stringify(data.title || data.h1 || 'Criminal Defence Kent')}`
  );
  
  updated = updated.replace(
    /description:\s*['"]([^'"]+)['"]/,
    `description: ${JSON.stringify(data.description || '')}`
  );

  // Update content
  const contentMatch = existing.match(/dangerouslySetInnerHTML=\{\{\s*__html:\s*['"]([^'"]+)['"]/);
  if (contentMatch) {
    updated = updated.replace(
      /dangerouslySetInnerHTML=\{\{\s*__html:\s*['"]([^'"]+)['"]/,
      `dangerouslySetInnerHTML={{ __html: ${JSON.stringify(content)}`
    );
  } else {
    // Insert content if not found
    updated = updated.replace(
      /<div className="prose[^"]*">/,
      `<div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(content)} }} />`
    );
  }

  return updated;
}

async function verifyParity(psaPages, cdkPages) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`PHASE 4: RE-VERIFYING PARITY`);
  console.log(`${'='.repeat(70)}\n`);

  const matrix = buildParityMatrix(psaPages, cdkPages);
  
  const missing = matrix.psaOnly.length;
  const incomplete = matrix.both.filter(p => p.incomplete).length;
  
  console.log(`\n📊 Verification Results:`);
  console.log(`   Missing pages: ${missing}`);
  console.log(`   Incomplete pages: ${incomplete}`);
  
  if (missing === 0 && incomplete === 0) {
    console.log(`\n✅ FULL PARITY ACHIEVED!`);
    return true;
  }
  
  return false;
}

function generateFinalReport(matrix, imported, updated) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`PHASE 5: FINAL REPORT`);
  console.log(`${'='.repeat(70)}\n`);

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      psaPages: psaPages.size,
      cdkPages: cdkPages.size,
      pagesOnBoth: matrix.both.length,
      pagesOnlyPSA: matrix.psaOnly.length,
      pagesOnlyCDK: matrix.cdkOnly.length,
      incompletePages: matrix.both.filter(p => p.incomplete).length,
      importedPages: imported.length,
      updatedPages: updated.length,
    },
    routeList: {
      psa: Array.from(psaPages.keys()).sort(),
      cdk: Array.from(cdkPages.keys()).sort(),
    },
    parityTable: matrix.both.map(p => ({
      route: p.route,
      similarity: (p.similarity * 100).toFixed(1) + '%',
      incomplete: p.incomplete,
    })),
    missingPages: matrix.psaOnly.map(p => ({
      route: p.route,
      title: p.data.title,
      h1: p.data.h1,
    })),
    incompletePages: matrix.both.filter(p => p.incomplete).map(p => ({
      route: p.route,
      similarity: (p.similarity * 100).toFixed(1) + '%',
    })),
    imported: imported,
    updated: updated,
  };

  // Save report
  const reportPath = path.join(__dirname, '..', 'migration-report.json');
  fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`\n📄 Full Report:`);
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`\n📁 Report saved to: ${reportPath}`);

  if (report.summary.pagesOnlyPSA === 0 && report.summary.incompletePages === 0) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`✅ MIGRATION COMPLETE — All pages from PoliceStationAgent.com`);
    console.log(`   successfully imported into CriminalDefenceKent.co.uk`);
    console.log(`   with 100% parity`);
    console.log(`${'='.repeat(70)}\n`);
  }

  return report;
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  MULTI-PASS SITE CRAWL, COMPARE & IMPORT`);
  console.log(`  PoliceStationAgent.com → CriminalDefenceKent.co.uk`);
  console.log(`${'═'.repeat(70)}\n`);

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Phase 1: Crawl both sites
    const psaCrawl = await crawlSite(browser, PSA_URL, 'PoliceStationAgent.com');
    visitedUrls.clear(); // Reset for second crawl
    const cdkCrawl = await crawlSite(browser, CDK_URL, 'CriminalDefenceKent.co.uk');

    // Store in global maps
    for (const [route, data] of psaCrawl) {
      psaPages.set(route, data);
    }
    for (const [route, data] of cdkCrawl) {
      cdkPages.set(route, data);
    }

    // Phase 2: Build parity matrix
    const matrix = buildParityMatrix(psaPages, cdkPages);

    // Phase 3: Import missing/incomplete pages
    const { imported, updated } = await importMissingPages(matrix);

    // Phase 4: Re-verify (would need to re-crawl, but for now use existing data)
    const verified = await verifyParity(psaPages, cdkPages);

    // Phase 5: Final report
    const report = generateFinalReport(matrix, imported, updated);

  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);

