/**
 * Find Missing Pages
 * Compares navigation links with existing pages
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const APP_DIR = path.join(__dirname, '..', 'app');

// Extract all routes from Header and Footer
async function extractRoutesFromComponents() {
  const headerPath = path.join(__dirname, '..', 'components', 'Header.tsx');
  const footerPath = path.join(__dirname, '..', 'components', 'Footer.tsx');
  
  const header = await fs.readFile(headerPath, 'utf8');
  const footer = await fs.readFile(footerPath, 'utf8');
  
  const routes = new Set();
  
  // Extract href="/..." patterns
  const hrefRegex = /href=["'](\/[^"']+)["']/g;
  
  let match;
  while ((match = hrefRegex.exec(header)) !== null) {
    routes.add(match[1]);
  }
  while ((match = hrefRegex.exec(footer)) !== null) {
    routes.add(match[1]);
  }
  
  return Array.from(routes).sort();
}

async function findExistingPages() {
  const pages = new Set();
  
  async function scanDir(dir, basePath = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        await scanDir(fullPath, relativePath);
      } else if (entry.name === 'page.tsx') {
        // Convert file path to route
        let route = '/' + relativePath.replace(/\\/g, '/').replace('/page.tsx', '');
        if (route === '/page') route = '/';
        
        // Handle dynamic routes
        route = route.replace(/\[slug\]/g, ':slug');
        route = route.replace(/\[id\]/g, ':id');
        
        pages.add(route);
      }
    }
  }
  
  await scanDir(APP_DIR);
  return Array.from(pages).sort();
}

async function main() {
  console.log('🔍 Finding missing pages...\n');
  
  const referencedRoutes = await extractRoutesFromComponents();
  const existingPages = await findExistingPages();
  
  console.log(`📋 Referenced routes: ${referencedRoutes.length}`);
  console.log(`📁 Existing pages: ${existingPages.length}\n`);
  
  const missing = [];
  const found = [];
  
  for (const route of referencedRoutes) {
    // Check if route exists directly
    if (existingPages.includes(route)) {
      found.push(route);
      continue;
    }
    
    // Check for dynamic route match (e.g., /blog/:slug matches /blog/[slug])
    const dynamicMatch = existingPages.find(page => {
      if (page.includes(':slug') && route.startsWith(page.replace(':slug', ''))) {
        return true;
      }
      if (page.includes(':id') && route.startsWith(page.replace(':id', ''))) {
        return true;
      }
      return false;
    });
    
    if (dynamicMatch) {
      found.push(`${route} (via ${dynamicMatch})`);
      continue;
    }
    
    // Check if it's a query param route (blog posts)
    if (route.includes('?slug=')) {
      const baseRoute = route.split('?')[0];
      if (existingPages.includes(baseRoute) || existingPages.includes('/post')) {
        found.push(`${route} (query param)`);
        continue;
      }
    }
    
    // Check if file exists
    const routePath = route === '/' ? 'page.tsx' : route.replace(/^\//, '').replace(/\//g, '\\') + '\\page.tsx';
    const filePath = path.join(APP_DIR, routePath);
    
    try {
      await fs.access(filePath);
      found.push(route);
    } catch (e) {
      missing.push(route);
    }
  }
  
  console.log('='.repeat(60));
  console.log('✅ FOUND PAGES:');
  console.log('='.repeat(60));
  found.forEach(r => console.log(`  ✅ ${r}`));
  
  if (missing.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ MISSING PAGES:');
    console.log('='.repeat(60));
    missing.forEach(r => console.log(`  ❌ ${r}`));
    
    console.log('\n📝 Creating missing pages...\n');
    
    // Create missing pages
    for (const route of missing) {
      await createMissingPage(route);
    }
    
    console.log(`\n✅ Created ${missing.length} missing pages!`);
  } else {
    console.log('\n✅ All pages exist! No missing pages found.');
  }
}

async function createMissingPage(route) {
  const routePath = route === '/' ? 'page.tsx' : route.replace(/^\//, '').replace(/\//g, '\\') + '\\page.tsx';
  const filePath = path.join(APP_DIR, routePath);
  const dirPath = path.dirname(filePath);
  
  // Skip if it's a dynamic route or query param
  if (route.includes(':') || route.includes('?')) {
    console.log(`  ⏭️  Skipped (dynamic/query): ${route}`);
    return;
  }
  
  // Create directory
  await fs.mkdir(dirPath, { recursive: true });
  
  // Generate page content
  const pageName = route === '/' ? 'Home' : route.split('/').pop().split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  const content = `import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${pageName} | Police Station Agent',
  description: '${pageName} page for Police Station Agent.',
  alternates: {
    canonical: \`https://policestationagent.com${route}\`,
  },
};

export default function ${pageName.replace(/\s+/g, '')}Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-6">${pageName}</h1>
            <div className="prose prose-lg">
              <p>This page is being updated. Please check back soon.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
`;
  
  await fs.writeFile(filePath, content, 'utf8');
  console.log(`  ✅ Created: ${route} -> ${filePath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { findMissingPages: main };

