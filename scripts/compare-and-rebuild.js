#!/usr/bin/env node

/**
 * Compare criminaldefencekent.co.uk (local) with policestationagent.com
 * and reconstruct any missing pages
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Get all local pages from the app directory
function getLocalPages() {
  const appDir = path.join(process.cwd(), 'app');
  const pages = [];
  
  function scanDir(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip special Next.js directories
        if (['api', 'components', '_app', '_document'].includes(item)) continue;
        
        // Check if this directory has a page.tsx
        const pagePath = path.join(fullPath, 'page.tsx');
        if (fs.existsSync(pagePath)) {
          const route = prefix + '/' + item;
          pages.push(route);
        }
        
        // Recurse into subdirectories
        scanDir(fullPath, prefix + '/' + item);
      }
    }
  }
  
  // Check root page
  if (fs.existsSync(path.join(appDir, 'page.tsx'))) {
    pages.push('/');
  }
  
  scanDir(appDir);
  return pages;
}

// Fetch a URL and return HTML
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        const redirectUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : `https://policestationagent.com${res.headers.location}`;
        fetchUrl(redirectUrl).then(resolve).catch(reject);
        return;
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, html: data }));
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Extract links from HTML
function extractLinks(html, baseUrl) {
  const links = new Set();
  const linkRegex = /href=["']([^"']+)["']/gi;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    let href = match[1];
    
    // Skip external links, anchors, and special protocols
    if (href.startsWith('http') && !href.includes('policestationagent.com')) continue;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (href.startsWith('javascript:')) continue;
    
    // Normalize the URL
    if (href.startsWith('http')) {
      href = new URL(href).pathname;
    }
    
    // Clean up the path
    href = href.split('?')[0].split('#')[0];
    if (!href.startsWith('/')) href = '/' + href;
    if (href.endsWith('/') && href !== '/') href = href.slice(0, -1);
    
    // Skip static files
    if (href.match(/\.(jpg|jpeg|png|gif|svg|css|js|ico|pdf|xml|txt)$/i)) continue;
    
    links.add(href);
  }
  
  return Array.from(links);
}

// Extract page content
function extractPageContent(html) {
  // Get title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  // Get meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : '';
  
  // Get main content - try various selectors
  let mainContent = '';
  
  // Try to find main content area
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                    html.match(/<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  
  if (mainMatch) {
    mainContent = mainMatch[1];
  } else {
    // Get body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      mainContent = bodyMatch[1];
    }
  }
  
  return { title, description, mainContent };
}

// Create a page file
function createPage(route, content) {
  const pagePath = route === '/' ? 'app/page.tsx' : `app${route}/page.tsx`;
  const dir = path.dirname(pagePath);
  
  // Create directory if needed
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Check if page already exists and has content
  if (fs.existsSync(pagePath)) {
    const existing = fs.readFileSync(pagePath, 'utf8');
    if (existing.length > 500) {
      console.log(`  ⏭️  Skipping ${route} - already has content`);
      return false;
    }
  }
  
  const safeTitle = (content.title || 'Page').replace(/'/g, "\\'").replace(/"/g, '\\"');
  const safeDesc = (content.description || '').replace(/'/g, "\\'").replace(/"/g, '\\"');
  
  // Sanitize HTML content
  let htmlContent = content.mainContent || '<p>Content coming soon</p>';
  htmlContent = htmlContent
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');
  
  const pageContent = `import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "${safeTitle}",
  description: "${safeDesc}",
  alternates: {
    canonical: "https://criminaldefencekent.co.uk${route}",
  },
  openGraph: {
    title: "${safeTitle}",
    description: "${safeDesc}",
    type: 'website',
    url: "https://criminaldefencekent.co.uk${route}",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main">
        <div className="bg-slate-50 min-h-screen">
          <div 
            className="prose prose-lg max-w-6xl mx-auto px-4 py-16"
            dangerouslySetInnerHTML={{ __html: \`${htmlContent}\` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
`;

  fs.writeFileSync(pagePath, pageContent);
  console.log(`  ✅ Created ${route}`);
  return true;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║         COMPARING AND REBUILDING MISSING PAGES                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  // Step 1: Get local pages
  console.log('📂 Scanning local pages...');
  const localPages = getLocalPages();
  console.log(`   Found ${localPages.length} local pages\n`);

  // Step 2: Crawl policestationagent.com
  console.log('🌐 Crawling policestationagent.com...');
  const visitedUrls = new Set();
  const urlsToVisit = ['/'];
  const remotePages = new Map(); // url -> { title, description, mainContent }
  
  while (urlsToVisit.length > 0 && visitedUrls.size < 100) {
    const url = urlsToVisit.shift();
    if (visitedUrls.has(url)) continue;
    visitedUrls.add(url);
    
    try {
      const fullUrl = `https://policestationagent.com${url}`;
      process.stdout.write(`   Fetching ${url}...`);
      
      const result = await fetchUrl(fullUrl);
      
      if (result.status === 200) {
        const content = extractPageContent(result.html);
        remotePages.set(url, content);
        
        // Extract and queue new links
        const links = extractLinks(result.html, 'https://policestationagent.com');
        for (const link of links) {
          if (!visitedUrls.has(link) && !urlsToVisit.includes(link)) {
            urlsToVisit.push(link);
          }
        }
        
        console.log(` ✅ (${content.title.slice(0, 40)}...)`);
      } else {
        console.log(` ❌ ${result.status}`);
      }
    } catch (err) {
      console.log(` ⚠️ ${err.message}`);
    }
    
    // Small delay to be respectful
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log(`\n   Found ${remotePages.size} pages on policestationagent.com\n`);

  // Step 3: Compare and find missing pages
  console.log('🔍 Comparing pages...\n');
  
  const localSet = new Set(localPages.map(p => p.toLowerCase()));
  const missingPages = [];
  
  for (const [url, content] of remotePages) {
    const normalizedUrl = url.toLowerCase();
    if (!localSet.has(normalizedUrl) && normalizedUrl !== '/') {
      missingPages.push({ url, content });
    }
  }
  
  console.log(`   Local pages: ${localPages.length}`);
  console.log(`   Remote pages: ${remotePages.size}`);
  console.log(`   Missing pages: ${missingPages.length}\n`);

  // Step 4: Create missing pages
  if (missingPages.length > 0) {
    console.log('📝 Creating missing pages...\n');
    
    let created = 0;
    for (const { url, content } of missingPages) {
      if (createPage(url, content)) {
        created++;
      }
    }
    
    console.log(`\n✅ Created ${created} new pages`);
  } else {
    console.log('✅ All pages are already present!');
  }

  // Step 5: Summary
  console.log('\n═══════════════════════════════════════════════════════════════════════');
  console.log('                              SUMMARY                                   ');
  console.log('═══════════════════════════════════════════════════════════════════════\n');
  
  console.log('Local pages:');
  for (const page of localPages.sort()) {
    console.log(`  • ${page}`);
  }
  
  if (missingPages.length > 0) {
    console.log('\nNewly created pages:');
    for (const { url } of missingPages) {
      console.log(`  + ${url}`);
    }
  }
  
  console.log('\n📌 Next steps:');
  console.log('   1. Review the created pages');
  console.log('   2. Run: npm run build');
  console.log('   3. Push to GitHub to deploy');
}

main().catch(console.error);





