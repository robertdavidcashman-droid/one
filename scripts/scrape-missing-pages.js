/**
 * Scrape Missing Pages from Live Site
 * Scrapes pages that are currently empty and populates them
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');
const https = require('https');
const http = require('http');

const BASE_URL = 'https://policestationagent.com';
const APP_DIR = path.join(__dirname, '..', 'app');

// Pages to scrape
const PAGES_TO_SCRAPE = [
  { route: '/after-a-police-interview', url: '/AfterAPoliceInterview' },
  { route: '/article-interview-under-caution', url: '/article-interview-under-caution' },
  { route: '/terms-and-conditions', url: '/TermsAndConditions' },
  { route: '/voluntary-interviews', url: '/VoluntaryInterviews' },
];

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    const client = fullUrl.startsWith('https') ? https : http;
    
    client.get(fullUrl, (res) => {
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

function extractMainContent(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const selectors = [
    '#root > main',
    '#root main',
    'main',
    '[role="main"]',
    '#root > div > main',
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
      if (text.length > 1000 && !text.includes('404') && !text.includes('Page Not Found') && !text.includes('Content temporarily unavailable')) {
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

function extractMetadata(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  return {
    title: document.querySelector('title')?.textContent?.trim() || 'Police Station Agent',
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
  };
}

function escapeForTemplate(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

async function updatePage(route, htmlContent, metadata) {
  const routePath = route === '/' ? 'page.tsx' : route.replace(/^\//, '').replace(/\//g, '\\') + '\\page.tsx';
  const outputPath = path.join(APP_DIR, routePath);

  try {
    let existing = await fs.readFile(outputPath, 'utf8');
    const escapedContent = escapeForTemplate(htmlContent);
    const canonical = metadata.canonical || `${BASE_URL}${route}`;

    // Update metadata
    let updated = existing.replace(
      /title:\s*["'][^"']*["']/,
      `title: ${JSON.stringify(metadata.title)}`
    );
    
    if (metadata.description) {
      updated = updated.replace(
        /description:\s*["'][^"']*["']/,
        `description: ${JSON.stringify(metadata.description)}`
      );
    }

    updated = updated.replace(
      /canonical:\s*["'][^"']*["']/,
      `canonical: ${JSON.stringify(canonical)}`
    );

    // Update OpenGraph
    updated = updated.replace(
      /openGraph:\s*\{[^}]*\}/s,
      `openGraph: {
    title: ${JSON.stringify(metadata.title)},
    description: ${JSON.stringify(metadata.description || '')},
    type: 'website',
    url: ${JSON.stringify(canonical)},
  }`
    );

    // Update content
    updated = updated.replace(
      /dangerouslySetInnerHTML=\{\{ __html: `[^`]*` \}\}/s,
      `dangerouslySetInnerHTML={{ __html: \`${escapedContent}\` }}`
    );

    await fs.writeFile(outputPath, updated, 'utf8');
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${route}:`, error.message);
    return false;
  }
}

async function scrapePage(pageConfig) {
  const { route, url } = pageConfig;
  
  console.log(`\n📥 Scraping: ${BASE_URL}${url}...`);
  
  try {
    const html = await fetchHtml(url);
    const mainContent = extractMainContent(html);
    const metadata = extractMetadata(html);
    
    if (!mainContent || mainContent.length < 500) {
      console.warn(`⚠️  Could not extract sufficient content for ${route}`);
      console.warn(`   Content length: ${mainContent ? mainContent.length : 0} characters`);
      return false;
    }
    
    console.log(`✅ Extracted ${mainContent.length} characters of content`);
    console.log(`📋 Title: ${metadata.title}`);
    
    const success = await updatePage(route, mainContent, metadata);
    
    if (success) {
      console.log(`✅ Successfully updated: ${route}`);
      return true;
    } else {
      console.error(`❌ Failed to update: ${route}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error scraping ${route}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🌐 Starting to scrape missing pages from live site...\n');
  
  const results = {
    success: [],
    failed: [],
  };
  
  for (const pageConfig of PAGES_TO_SCRAPE) {
    const success = await scrapePage(pageConfig);
    if (success) {
      results.success.push(pageConfig.route);
    } else {
      results.failed.push(pageConfig.route);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SCRAPING SUMMARY');
  console.log('='.repeat(60));
  console.log(`\n✅ Successfully scraped: ${results.success.length} pages`);
  results.success.forEach(route => console.log(`   • ${route}`));
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Failed to scrape: ${results.failed.length} pages`);
    results.failed.forEach(route => console.log(`   • ${route}`));
    console.log('\n💡 These pages may not exist on the live site or returned 404/empty content.');
  }
  
  console.log('\n✅ Scraping complete!');
}

main().catch(console.error);
