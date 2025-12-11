/**
 * Audit All Linked Pages
 * Checks all pages linked in navigation, footer, and content to see what's missing
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const APP_DIR = path.join(__dirname, '..', 'app');
const COMPONENTS_DIR = path.join(__dirname, '..', 'components');

async function getAllRoutes() {
  const routes = new Set();
  
  async function scanDir(dir, basePath = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        await scanDir(fullPath, relativePath);
      } else if (entry.name === 'page.tsx') {
        let route = '/' + relativePath.replace(/\\/g, '/').replace('/page.tsx', '');
        if (route === '/page') route = '/';
        
        // Handle dynamic routes
        route = route.replace(/\[slug\]/g, ':slug');
        route = route.replace(/\[id\]/g, ':id');
        
        routes.add(route);
      }
    }
  }
  
  await scanDir(APP_DIR);
  return Array.from(routes).sort();
}

async function extractLinksFromFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const links = new Set();
    
    // Extract href="/..." patterns
    const hrefRegex = /href=["'](\/[^"']+)["']/g;
    let match;
    while ((match = hrefRegex.exec(content)) !== null) {
      const link = match[1].split('?')[0].split('#')[0]; // Remove query params and hash
      if (link && link !== '/') {
        links.add(link);
      }
    }
    
    return Array.from(links).sort();
  } catch (error) {
    return [];
  }
}

async function checkIfPageExists(route, existingRoutes) {
  // Check exact match
  if (existingRoutes.includes(route)) {
    return { exists: true, type: 'exact' };
  }
  
  // Check dynamic route match
  const dynamicMatch = existingRoutes.find(r => {
    if (r.includes(':slug') && route.startsWith(r.replace(':slug', ''))) {
      return true;
    }
    if (r.includes(':id') && route.startsWith(r.replace(':id', ''))) {
      return true;
    }
    return false;
  });
  
  if (dynamicMatch) {
    return { exists: true, type: 'dynamic', route: dynamicMatch };
  }
  
  // Check if file exists
  const routePath = route === '/' ? 'page.tsx' : route.replace(/^\//, '').replace(/\//g, '\\') + '\\page.tsx';
  const filePath = path.join(APP_DIR, routePath);
  
  try {
    await fs.access(filePath);
    return { exists: true, type: 'file' };
  } catch (e) {
    return { exists: false };
  }
}

async function checkPageHasContent(route) {
  const routePath = route === '/' ? 'page.tsx' : route.replace(/^\//, '').replace(/\//g, '\\') + '\\page.tsx';
  const filePath = path.join(APP_DIR, routePath);
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Check if it has 404 content
    if (content.includes('404') && content.includes('Page Not Found')) {
      return { hasContent: false, reason: '404 placeholder' };
    }
    
    // Check if it has substantial content
    const htmlMatch = content.match(/dangerouslySetInnerHTML=\{\{ __html: `([^`]*)` \}\}/s);
    if (htmlMatch && htmlMatch[1]) {
      const htmlContent = htmlMatch[1];
      if (htmlContent.length > 1000 && !htmlContent.includes('404')) {
        return { hasContent: true };
      }
    }
    
    // Check for other content patterns
    if (content.includes('export default') && content.length > 500) {
      return { hasContent: true };
    }
    
    return { hasContent: false, reason: 'minimal content' };
  } catch (e) {
    return { hasContent: false, reason: 'file not found' };
  }
}

async function main() {
  console.log('🔍 Auditing All Linked Pages...\n');
  
  // Get all existing routes
  const existingRoutes = await getAllRoutes();
  console.log(`📁 Found ${existingRoutes.length} existing routes\n`);
  
  // Extract links from Header and Footer
  const headerLinks = await extractLinksFromFile(path.join(COMPONENTS_DIR, 'Header.tsx'));
  const footerLinks = await extractLinksFromFile(path.join(COMPONENTS_DIR, 'Footer.tsx'));
  
  // Combine and deduplicate
  const allLinkedRoutes = Array.from(new Set([...headerLinks, ...footerLinks])).sort();
  
  console.log(`📋 Found ${allLinkedRoutes.length} unique linked routes\n`);
  console.log('='.repeat(60));
  console.log('AUDIT RESULTS');
  console.log('='.repeat(60));
  
  const results = {
    existsWithContent: [],
    existsBut404: [],
    existsButMinimal: [],
    missing: [],
  };
  
  for (const route of allLinkedRoutes) {
    const exists = await checkIfPageExists(route, existingRoutes);
    
    if (exists.exists) {
      const content = await checkPageHasContent(route);
      if (content.hasContent) {
        results.existsWithContent.push(route);
        console.log(`✅ ${route} - EXISTS with content`);
      } else if (content.reason === '404 placeholder') {
        results.existsBut404.push(route);
        console.log(`⚠️  ${route} - EXISTS but shows 404`);
      } else {
        results.existsButMinimal.push(route);
        console.log(`⚠️  ${route} - EXISTS but minimal content`);
      }
    } else {
      results.missing.push(route);
      console.log(`❌ ${route} - MISSING`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Pages with content: ${results.existsWithContent.length}`);
  console.log(`⚠️  Pages showing 404: ${results.existsBut404.length}`);
  console.log(`⚠️  Pages with minimal content: ${results.existsButMinimal.length}`);
  console.log(`❌ Missing pages: ${results.missing.length}`);
  
  if (results.existsBut404.length > 0) {
    console.log('\n📋 Pages showing 404 (need content):');
    results.existsBut404.forEach(r => console.log(`   - ${r}`));
  }
  
  if (results.missing.length > 0) {
    console.log('\n📋 Missing pages (need to be created):');
    results.missing.forEach(r => console.log(`   - ${r}`));
  }
  
  // Also check sitemap
  console.log('\n' + '='.repeat(60));
  console.log('SITEMAP CHECK');
  console.log('='.repeat(60));
  
  try {
    const sitemapContent = await fs.readFile(path.join(APP_DIR, 'sitemap.ts'), 'utf8');
    const sitemapRoutes = [];
    const urlRegex = /url:\s*["']([^"']+)["']/g;
    let match;
    while ((match = urlRegex.exec(sitemapContent)) !== null) {
      const url = match[1];
      if (url.startsWith('https://policestationagent.com')) {
        const route = url.replace('https://policestationagent.com', '');
        if (route) {
          sitemapRoutes.push(route);
        }
      }
    }
    
    console.log(`📋 Found ${sitemapRoutes.length} routes in sitemap`);
    
    const sitemapMissing = [];
    for (const route of sitemapRoutes) {
      const exists = await checkIfPageExists(route, existingRoutes);
      if (!exists.exists) {
        sitemapMissing.push(route);
      }
    }
    
    if (sitemapMissing.length > 0) {
      console.log(`\n⚠️  Routes in sitemap but pages missing:`);
      sitemapMissing.forEach(r => console.log(`   - ${r}`));
    }
  } catch (e) {
    console.log('⚠️  Could not read sitemap.ts');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { getAllRoutes, extractLinksFromFile, checkIfPageExists };

