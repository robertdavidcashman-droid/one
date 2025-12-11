/**
 * FULL SITE IMPORT & REBUILD SYSTEM
 * 
 * This script performs a complete automated import of policestationagent.com:
 * 1. Crawls all public pages (depth-3 link discovery)
 * 2. Extracts HTML, CSS, and content
 * 3. Maps site structure
 * 4. Generates Next.js pages automatically
 * 5. Creates site map and documentation
 * 
 * Usage: node scripts/full-site-import.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const BASE_URL = 'https://policestationagent.com';
const OUTPUT_DIR = path.join(__dirname, '..', 'legacy', 'scraped');
const IMPORT_REPORT_DIR = path.join(__dirname, '..', 'legacy', 'import-reports');

// Track discovered URLs
const discoveredUrls = new Set();
const scrapedUrls = new Map(); // url -> { title, html, metadata, links }
const failedUrls = new Map(); // url -> error
const maxDepth = 3;
const visitedUrls = new Set();

// URLs to exclude from crawling
const EXCLUDE_PATTERNS = [
  /\/admin/,
  /\/api/,
  /\/login/,
  /mailto:/,
  /tel:/,
  /javascript:/,
  /#/,
  /\.pdf$/,
  /\.jpg$/,
  /\.png$/,
  /\.gif$/,
  /\.svg$/,
  /\.css$/,
  /\.js$/,
];

function shouldExcludeUrl(url) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(url));
}

function normalizeUrl(url) {
  try {
    const urlObj = new URL(url, BASE_URL);
    // Remove hash, normalize trailing slash
    urlObj.hash = '';
    const pathname = urlObj.pathname.replace(/\/$/, '') || '/';
    return `${urlObj.origin}${pathname}${urlObj.search}`;
  } catch (e) {
    return null;
  }
}

function isInternalUrl(url) {
  try {
    const urlObj = new URL(url, BASE_URL);
    return urlObj.origin === new URL(BASE_URL).origin;
  } catch (e) {
    return false;
  }
}

async function extractLinks(html, currentUrl) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const links = new Set();
  
  // Extract all <a> tags
  const anchorTags = document.querySelectorAll('a[href]');
  anchorTags.forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    
    const normalized = normalizeUrl(href);
    if (normalized && isInternalUrl(normalized) && !shouldExcludeUrl(normalized)) {
      links.add(normalized);
    }
  });
  
  return Array.from(links);
}

async function extractMetadata(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  return {
    title: document.querySelector('title')?.textContent || '',
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
    ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
    keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
  };
}

async function extractMainContent(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Try to find main content area
  const root = document.getElementById('root');
  if (root) {
    const main = root.querySelector('main') || root.querySelector('[role="main"]') || root;
    return main.innerHTML;
  }
  
  // Fallback: get body content
  const body = document.body;
  if (body) {
    // Remove scripts and styles
    body.querySelectorAll('script, style, noscript').forEach(el => el.remove());
    return body.innerHTML;
  }
  
  return null;
}

async function scrapePage(browser, url, depth = 0) {
  if (visitedUrls.has(url) || depth > maxDepth) {
    return null;
  }
  
  visitedUrls.add(url);
  console.log(`[Depth ${depth}] Scraping: ${url}`);
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate and wait
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for React to render
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get HTML
    const html = await page.content();
    
    // Extract data
    const title = await page.title();
    const metadata = await extractMetadata(html);
    const mainContent = await extractMainContent(html);
    const links = await extractLinks(html, url);
    
    // Store scraped data
    scrapedUrls.set(url, {
      title,
      html,
      metadata,
      mainContent,
      links,
      depth,
      scrapedAt: new Date().toISOString(),
    });
    
    // Add discovered links
    links.forEach(link => discoveredUrls.add(link));
    
    console.log(`✅ Scraped: ${title} (${links.length} links found)`);
    
    await page.close();
    
    return { url, title, links };
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error.message);
    failedUrls.set(url, {
      error: error.message,
      depth,
      attemptedAt: new Date().toISOString(),
    });
    return null;
  }
}

async function crawlSite(browser, startUrl, depth = 0) {
  if (depth > maxDepth) return;
  
  const result = await scrapePage(browser, startUrl, depth);
  if (!result) return;
  
  // Recursively crawl discovered links
  for (const link of result.links) {
    if (!visitedUrls.has(link) && isInternalUrl(link) && !shouldExcludeUrl(link)) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Be respectful
      await crawlSite(browser, link, depth + 1);
    }
  }
}

async function saveScrapedFiles() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  for (const [url, data] of scrapedUrls.entries()) {
    const filename = sanitizeFilename(url) + '.html';
    const filepath = path.join(OUTPUT_DIR, filename);
    await fs.writeFile(filepath, data.html, 'utf8');
  }
  
  console.log(`\n💾 Saved ${scrapedUrls.size} HTML files to ${OUTPUT_DIR}`);
}

function sanitizeFilename(url) {
  try {
    const urlObj = new URL(url, BASE_URL);
    let filename = urlObj.pathname.replace(/^\//, '').replace(/\/$/, '') || 'home';
    filename = filename.replace(/\//g, '-').replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-');
    
    // Add query params if present
    if (urlObj.search) {
      const query = urlObj.search.replace(/[?&=]/g, '-').replace(/-+/g, '-');
      filename += query;
    }
    
    return filename || 'home';
  } catch (e) {
    return 'unknown';
  }
}

async function generateSiteMap() {
  await fs.mkdir(IMPORT_REPORT_DIR, { recursive: true });
  
  const siteMap = {
    baseUrl: BASE_URL,
    scrapedAt: new Date().toISOString(),
    totalPages: scrapedUrls.size,
    totalFailed: failedUrls.size,
    pages: Array.from(scrapedUrls.entries()).map(([url, data]) => ({
      url,
      title: data.title,
      depth: data.depth,
      canonical: data.metadata.canonical,
      linksFound: data.links.length,
      scrapedAt: data.scrapedAt,
    })),
    failed: Array.from(failedUrls.entries()).map(([url, data]) => ({
      url,
      error: data.error,
      depth: data.depth,
    })),
  };
  
  const siteMapPath = path.join(IMPORT_REPORT_DIR, 'site-map.json');
  await fs.writeFile(siteMapPath, JSON.stringify(siteMap, null, 2), 'utf8');
  
  // Generate human-readable report
  const reportPath = path.join(IMPORT_REPORT_DIR, 'import-report.md');
  const report = generateImportReport(siteMap);
  await fs.writeFile(reportPath, report, 'utf8');
  
  console.log(`\n📊 Site map saved to: ${siteMapPath}`);
  console.log(`📄 Import report saved to: ${reportPath}`);
  
  return siteMap;
}

function generateImportReport(siteMap) {
  let report = `# Full Site Import Report\n\n`;
  report += `**Import Date:** ${new Date().toLocaleString()}\n`;
  report += `**Base URL:** ${siteMap.baseUrl}\n`;
  report += `**Total Pages Scraped:** ${siteMap.totalPages}\n`;
  report += `**Failed Pages:** ${siteMap.totalFailed}\n\n`;
  
  report += `## Pages Imported\n\n`;
  siteMap.pages.forEach((page, index) => {
    report += `${index + 1}. **${page.title}**\n`;
    report += `   - URL: ${page.url}\n`;
    report += `   - Depth: ${page.depth}\n`;
    report += `   - Links Found: ${page.linksFound}\n`;
    if (page.canonical) {
      report += `   - Canonical: ${page.canonical}\n`;
    }
    report += `\n`;
  });
  
  if (siteMap.failed.length > 0) {
    report += `## Failed Pages\n\n`;
    siteMap.failed.forEach((page, index) => {
      report += `${index + 1}. **${page.url}**\n`;
      report += `   - Error: ${page.error}\n`;
      report += `   - Depth: ${page.depth}\n\n`;
    });
  }
  
  report += `## Limitations\n\n`;
  report += `The following elements cannot be imported:\n\n`;
  report += `- **Server-side code:** Backend logic, API endpoints, database queries\n`;
  report += `- **Authentication-protected areas:** Admin panels, login pages\n`;
  report += `- **Form submission handlers:** Contact forms require backend implementation\n`;
  report += `- **Dynamic content:** Content loaded via JavaScript after initial render may be incomplete\n`;
  report += `- **Third-party scripts:** External services (analytics, chat widgets) need separate setup\n`;
  report += `- **Protected content:** Pages blocked by robots.txt or requiring authentication\n\n`;
  
  return report;
}

async function main() {
  console.log('🚀 Starting FULL SITE IMPORT & REBUILD...\n');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Max Depth: ${maxDepth}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Start crawling from homepage
    await crawlSite(browser, BASE_URL, 0);
    
    // Save all scraped files
    await saveScrapedFiles();
    
    // Generate site map and report
    const siteMap = await generateSiteMap();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully scraped: ${scrapedUrls.size} pages`);
    console.log(`❌ Failed: ${failedUrls.size} pages`);
    console.log(`🔗 Total unique URLs discovered: ${discoveredUrls.size}`);
    console.log(`\n📁 Files saved to: ${OUTPUT_DIR}`);
    console.log(`📊 Reports saved to: ${IMPORT_REPORT_DIR}`);
    console.log('\n✅ Import complete! Run rebuild script next.');
    
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { scrapePage, extractLinks, extractMetadata, extractMainContent };


