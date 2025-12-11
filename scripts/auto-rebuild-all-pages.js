/**
 * AUTOMATIC REBUILD ALL PAGES FROM SCRAPED HTML
 * 
 * This script automatically rebuilds all scraped pages into Next.js App Router format.
 * It extracts content, preserves styling, and generates proper page.tsx files.
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const BASE_URL = 'https://policestationagent.com';
const SCRAPED_DIR = path.join(__dirname, '..', 'legacy', 'scraped');
const APP_DIR = path.join(__dirname, '..', 'app');
const IMPORT_REPORT_DIR = path.join(__dirname, '..', 'legacy', 'import-reports');

// URL to route mapping
function urlToRoute(url) {
  try {
    const urlObj = new URL(url);
    let route = urlObj.pathname;
    
    // Handle query params for blog posts
    if (urlObj.search.includes('slug=')) {
      const slug = urlObj.searchParams.get('slug');
      if (slug) {
        return `/post?slug=${slug}`;
      }
    }
    
    // Normalize route
    route = route.replace(/\/$/, '') || '/';
    
    // Convert to kebab-case route
    if (route.startsWith('/police-stations/')) {
      const slug = route.replace('/police-stations/', '');
      return `/police-stations/${slug}`;
    }
    
    if (route.startsWith('/services/')) {
      const slug = route.replace('/services/', '');
      return `/services/${slug}`;
    }
    
    return route;
  } catch (e) {
    return '/';
  }
}

function routeToFilePath(route) {
  if (route === '/') {
    return path.join(APP_DIR, 'page.tsx');
  }
  
  // Handle query params (blog posts)
  if (route.includes('?slug=')) {
    const slug = route.match(/slug=([^&]+)/)?.[1];
    if (slug) {
      return path.join(APP_DIR, 'post', 'page.tsx'); // We'll handle this differently
    }
  }
  
  // Remove leading slash and convert to directory
  const dirPath = route.replace(/^\//, '').replace(/\/$/, '');
  if (!dirPath) {
    return path.join(APP_DIR, 'page.tsx');
  }
  
  // Handle dynamic routes
  if (dirPath.startsWith('police-stations/')) {
    const slug = dirPath.replace('police-stations/', '');
    return path.join(APP_DIR, 'police-stations', '[slug]', 'page.tsx');
  }
  
  if (dirPath.startsWith('services/')) {
    const slug = dirPath.replace('services/', '');
    return path.join(APP_DIR, 'services', '[slug]', 'page.tsx');
  }
  
  // Regular route
  return path.join(APP_DIR, dirPath, 'page.tsx');
}

function extractMainContent(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Try multiple strategies to find main content
  const selectors = [
    '#root > main',
    '#root main',
    'main',
    '[role="main"]',
    '#root > div > main',
    '#root',
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      // Clone to avoid modifying original
      const clone = element.cloneNode(true);
      
      // Remove scripts, styles, and other non-content elements
      clone.querySelectorAll('script, style, noscript, link[rel="stylesheet"]').forEach(el => el.remove());
      
      return clone.innerHTML;
    }
  }
  
  // Fallback: get body content
  const body = document.body;
  if (body) {
    body.querySelectorAll('script, style, noscript').forEach(el => el.remove());
    return body.innerHTML;
  }
  
  return null;
}

function extractMetadata(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  return {
    title: document.querySelector('title')?.textContent || 'Police Station Agent',
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
    ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
    keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
  };
}

function extractStyles(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const styles = [];
  
  // Extract inline styles
  document.querySelectorAll('[style]').forEach(el => {
    const style = el.getAttribute('style');
    if (style) styles.push(style);
  });
  
  // Extract <style> tags
  document.querySelectorAll('style').forEach(styleEl => {
    const css = styleEl.textContent;
    if (css) styles.push(css);
  });
  
  return styles;
}

function convertLinksToNextJS(html) {
  // This is a simplified conversion - in production, you'd want more sophisticated parsing
  // For now, we'll preserve the HTML structure and note that links should be converted
  // The actual conversion would require parsing the HTML more carefully
  
  // Basic replacements
  let converted = html;
  
  // Replace /home with /
  converted = converted.replace(/href="\/home"/g, 'href="/"');
  converted = converted.replace(/href='\/home'/g, "href='/'");
  
  // Note: Full Link component conversion would require JSX parsing
  // For now, we'll keep href attributes and convert them during manual review
  
  return converted;
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

async function generatePageComponent(html, route, metadata) {
  const mainContent = extractMainContent(html);
  if (!mainContent) {
    console.warn(`⚠️  Could not extract main content for ${route}`);
    return null;
  }
  
  const convertedContent = convertLinksToNextJS(mainContent);
  const escapedContent = escapeForTemplate(convertedContent);
  
  const canonical = metadata.canonical || `https://policestationagent.com${route}`;
  
  return `import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ${JSON.stringify(metadata.title)},
  description: ${JSON.stringify(metadata.description)},
  keywords: ${metadata.keywords ? JSON.stringify(metadata.keywords) : 'undefined'},
  alternates: {
    canonical: ${JSON.stringify(canonical)},
  },
  openGraph: {
    title: ${metadata.ogTitle ? JSON.stringify(metadata.ogTitle) : JSON.stringify(metadata.title)},
    description: ${metadata.ogDescription ? JSON.stringify(metadata.ogDescription) : JSON.stringify(metadata.description)},
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
}

async function rebuildPageFromScrapedFile(filename, url) {
  const scrapedFilePath = path.join(SCRAPED_DIR, filename);
  
  try {
    const html = await fs.readFile(scrapedFilePath, 'utf8');
    const metadata = extractMetadata(html);
    const route = urlToRoute(url);
    const outputFilePath = routeToFilePath(route);
    
    const component = await generatePageComponent(html, route, metadata);
    if (!component) return null;
    
    // Ensure directory exists
    const dir = path.dirname(outputFilePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write file
    await fs.writeFile(outputFilePath, component, 'utf8');
    
    return { route, filePath: outputFilePath, success: true };
  } catch (error) {
    console.error(`❌ Error rebuilding ${filename}:`, error.message);
    return { route: urlToRoute(url), filePath: outputFilePath, success: false, error: error.message };
  }
}

async function loadSiteMap() {
  const siteMapPath = path.join(IMPORT_REPORT_DIR, 'site-map.json');
  try {
    const data = await fs.readFile(siteMapPath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.warn('⚠️  Site map not found, will rebuild from scraped files');
    return null;
  }
}

async function rebuildAllPages() {
  console.log('🔨 Starting automatic rebuild of all pages...\n');
  
  // Load site map if available
  const siteMap = await loadSiteMap();
  
  const results = {
    success: [],
    failed: [],
    skipped: [],
  };
  
  if (siteMap) {
    // Rebuild from site map
    console.log(`📋 Rebuilding ${siteMap.pages.length} pages from site map...\n`);
    
    for (const page of siteMap.pages) {
      const filename = sanitizeFilename(page.url) + '.html';
      const result = await rebuildPageFromScrapedFile(filename, page.url);
      
      if (result) {
        if (result.success) {
          results.success.push(result);
          console.log(`✅ Rebuilt: ${result.route}`);
        } else {
          results.failed.push(result);
          console.log(`❌ Failed: ${result.route} - ${result.error}`);
        }
      } else {
        results.skipped.push(page.url);
        console.log(`⏭️  Skipped: ${page.url}`);
      }
    }
  } else {
    // Rebuild from scraped files
    console.log('📁 Rebuilding from scraped files...\n');
    
    const files = await fs.readdir(SCRAPED_DIR);
    const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'scraping-summary.json');
    
    for (const filename of htmlFiles) {
      // Try to infer URL from filename
      const url = filenameToUrl(filename);
      const result = await rebuildPageFromScrapedFile(filename, url);
      
      if (result) {
        if (result.success) {
          results.success.push(result);
          console.log(`✅ Rebuilt: ${result.route}`);
        } else {
          results.failed.push(result);
          console.log(`❌ Failed: ${result.route} - ${result.error}`);
        }
      }
    }
  }
  
  // Ensure report directory exists
  await fs.mkdir(IMPORT_REPORT_DIR, { recursive: true });
  
  // Generate rebuild report
  const reportPath = path.join(IMPORT_REPORT_DIR, 'rebuild-report.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2), 'utf8');
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 REBUILD SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully rebuilt: ${results.success.length} pages`);
  console.log(`❌ Failed: ${results.failed.length} pages`);
  console.log(`⏭️  Skipped: ${results.skipped.length} pages`);
  console.log(`\n📁 Report saved to: ${reportPath}`);
  
  return results;
}

function sanitizeFilename(url) {
  try {
    const urlObj = new URL(url);
    let filename = urlObj.pathname.replace(/^\//, '').replace(/\/$/, '') || 'home';
    filename = filename.replace(/\//g, '-').replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-');
    
    if (urlObj.search) {
      const query = urlObj.search.replace(/[?&=]/g, '-').replace(/-+/g, '-');
      filename += query;
    }
    
    return filename || 'home';
  } catch (e) {
    return 'unknown';
  }
}

function filenameToUrl(filename) {
  // Reverse the sanitization
  let url = filename.replace('.html', '');
  
  // Handle special cases
  if (url === 'home') return `${BASE_URL}/`;
  if (url.startsWith('blog-')) {
    const slug = url.replace('blog-', '');
    return `${BASE_URL}/post?slug=${slug}`;
  }
  if (url.startsWith('station-')) {
    const slug = url.replace('station-', '');
    return `${BASE_URL}/police-stations/${slug}`;
  }
  
  // Map known filenames to URLs (preserve kebab-case, don't convert to slashes)
  const filenameMap = {
    'after-a-police-interview': '/after-a-police-interview',
    'for-clients': '/for-clients',
    'for-solicitors': '/for-solicitors',
    'terms-and-conditions': '/terms-and-conditions',
    'voluntary-interviews': '/voluntary-interviews',
    'what-is-a-criminal-solicitor': '/what-is-a-criminal-solicitor',
    'what-is-a-police-station-rep': '/what-is-a-police-station-rep',
    'what-we-do': '/what-we-do',
    'why-use-us': '/why-use-us',
    'police-stations': '/police-stations',
  };
  
  if (filenameMap[url]) {
    return `${BASE_URL}${filenameMap[url]}`;
  }
  
  // For other files, use the filename as-is (it should already be kebab-case)
  return `${BASE_URL}/${url}`;
}

if (require.main === module) {
  rebuildAllPages().catch(console.error);
}

module.exports = { rebuildPageFromScrapedFile, extractMainContent, extractMetadata };

