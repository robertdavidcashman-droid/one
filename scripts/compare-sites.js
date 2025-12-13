const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const SOURCE_SITE = 'https://policestationagent.com';
const TARGET_SITE = 'https://criminaldefencekent.co.uk';

async function crawlSite(baseUrl) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const visited = new Set();
  const pages = [];

  async function crawl(url) {
    if (visited.has(url) || !url.startsWith(baseUrl)) return;
    visited.add(url);

    try {
      console.log(`Crawling: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const pageData = {
        url,
        path: new URL(url).pathname,
        title: await page.title().catch(() => ''),
        h1: await page.$eval('h1', el => el.textContent).catch(() => ''),
        hasContent: (await page.content()).length > 5000,
      };

      pages.push(pageData);

      // Find all internal links
      const links = await page.$$eval('a[href]', anchors => 
        anchors.map(a => a.href).filter(href => 
          href.startsWith(baseUrl) && !href.includes('#') && !href.includes('?')
        )
      );

      // Crawl new links (limit depth)
      for (const link of links.slice(0, 50)) {
        if (!visited.has(link) && visited.size < 200) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
          await crawl(link).catch(console.error);
        }
      }
    } catch (error) {
      console.error(`Error crawling ${url}:`, error.message);
    }
  }

  await crawl(baseUrl);
  await browser.close();
  return pages;
}

async function getLocalPages() {
  const appDir = path.join(__dirname, '..', 'app');
  const pages = [];

  async function scanDir(dir, basePath = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const routePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        await scanDir(fullPath, routePath);
      } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
        const route = routePath.replace(/\\/g, '/').replace(/\/page\.(tsx|ts)$/, '') || '/';
        pages.push({
          path: route,
          file: fullPath,
        });
      }
    }
  }

  await scanDir(appDir);
  return pages;
}

function normalizePath(path) {
  return path.toLowerCase().replace(/\/$/, '') || '/';
}

async function compareSites() {
  console.log('🔍 Crawling policestationagent.com...');
  const sourcePages = await crawlSite(SOURCE_SITE);
  
  console.log('📁 Scanning local project...');
  const localPages = await getLocalPages();

  console.log(`\n📊 Found ${sourcePages.length} pages on source site`);
  console.log(`📊 Found ${localPages.length} pages in local project\n`);

  // Normalize paths for comparison
  const sourcePaths = new Map();
  sourcePages.forEach(page => {
    const normalized = normalizePath(page.path);
    sourcePaths.set(normalized, page);
  });

  const localPaths = new Set();
  localPages.forEach(page => {
    localPaths.add(normalizePath(page.path));
  });

  // Find missing pages
  const missing = [];
  sourcePaths.forEach((page, path) => {
    if (!localPaths.has(path)) {
      missing.push(page);
    }
  });

  // Find extra pages (in local but not in source)
  const extra = [];
  localPaths.forEach(path => {
    if (!sourcePaths.has(path)) {
      extra.push({ path });
    }
  });

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    sourceSite: SOURCE_SITE,
    targetSite: TARGET_SITE,
    summary: {
      sourcePages: sourcePages.length,
      localPages: localPages.length,
      missing: missing.length,
      extra: extra.length,
    },
    missingPages: missing.map(p => ({
      url: p.url,
      path: p.path,
      title: p.title,
      h1: p.h1,
    })),
    extraPages: extra,
    allSourcePages: sourcePages.map(p => ({
      url: p.url,
      path: p.path,
      title: p.title,
    })),
  };

  // Save report
  const reportPath = path.join(__dirname, '..', 'SITE_COMPARISON_REPORT.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📄 Report saved to:', reportPath);
  console.log(`\n✅ Missing pages: ${missing.length}`);
  console.log(`📋 Extra pages: ${extra.length}\n`);

  if (missing.length > 0) {
    console.log('Missing pages:');
    missing.forEach(p => {
      console.log(`  - ${p.path} (${p.title || p.h1 || 'No title'})`);
    });
  }

  return report;
}

if (require.main === module) {
  compareSites().catch(console.error);
}

module.exports = { compareSites, crawlSite, getLocalPages };













