#!/usr/bin/env node

/**
 * Comprehensive page audit script
 * Discovers all pages, checks navigation, sitemap, and cross-linking
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function getAllPages() {
  const pageFiles = await glob('app/**/page.tsx', {
    ignore: ['**/node_modules/**', '**/.next/**'],
  });

  const pages = pageFiles.map(file => {
    const route = file
      .replace(/^app\//, '/')
      .replace(/\/page\.tsx$/, '')
      .replace(/\[slug\]/g, '*')
      .replace(/\[id\]/g, '*');
    
    return {
      file,
      route: route === '/' ? '/' : route,
      isDynamic: route.includes('*'),
    };
  });

  return pages;
}

async function getSitemapPages() {
  const sitemapContent = fs.readFileSync('app/sitemap.ts', 'utf8');
  const urlMatches = sitemapContent.matchAll(/url:\s*[`'"](\${baseUrl})?([^`'"]+)[`'"]/g);
  const pages = new Set();
  
  for (const match of urlMatches) {
    const url = match[2];
    if (url.startsWith('/')) {
      pages.add(url);
    } else if (url.includes('baseUrl')) {
      // Handle template literals
      const cleanUrl = url.replace(/\$\{baseUrl\}/g, '').replace(/`/g, '').trim();
      if (cleanUrl && cleanUrl !== '/') {
        pages.add(cleanUrl);
      }
    }
  }
  
  // Also check for baseUrl entries
  const baseUrlMatches = sitemapContent.matchAll(/url:\s*`\$\{baseUrl\}([^`]+)`/g);
  for (const match of baseUrlMatches) {
    pages.add(match[1]);
  }
  
  return pages;
}

async function getNavigationLinks() {
  const headerContent = fs.readFileSync('components/Header.tsx', 'utf8');
  const footerContent = fs.readFileSync('components/Footer.tsx', 'utf8');
  
  const links = new Set();
  
  // Extract href attributes
  const hrefRegex = /href=["']([^"']+)["']/g;
  
  let match;
  while ((match = hrefRegex.exec(headerContent)) !== null) {
    if (match[1].startsWith('/') && !match[1].startsWith('//')) {
      links.add(match[1]);
    }
  }
  
  while ((match = hrefRegex.exec(footerContent)) !== null) {
    if (match[1].startsWith('/') && !match[1].startsWith('//')) {
      links.add(match[1]);
    }
  }
  
  return links;
}

async function checkPageMetadata(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const hasMetadata = /export\s+(const|async\s+function)\s+metadata/.test(content);
    const hasTitle = /title:/.test(content);
    const hasDescription = /description:/.test(content);
    const hasCanonical = /canonical:/.test(content);
    const hasOpenGraph = /openGraph:/.test(content);
    
    return {
      hasMetadata,
      hasTitle,
      hasDescription,
      hasCanonical,
      hasOpenGraph,
    };
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('🔍 Auditing all pages...\n');
  
  const allPages = await getAllPages();
  const sitemapPages = await getSitemapPages();
  const navLinks = await getNavigationLinks();
  
  console.log(`Found ${allPages.length} pages in codebase`);
  console.log(`Found ${sitemapPages.size} pages in sitemap`);
  console.log(`Found ${navLinks.size} links in navigation\n`);
  
  const results = {
    inSitemap: [],
    inNavigation: [],
    orphaned: [],
    missingMetadata: [],
    missingCanonical: [],
  };
  
  for (const page of allPages) {
    if (page.isDynamic) continue; // Skip dynamic routes for now
    
    const inSitemap = sitemapPages.has(page.route);
    const inNav = navLinks.has(page.route);
    const metadata = await checkPageMetadata(page.file);
    
    if (!inSitemap && !inNav) {
      results.orphaned.push(page);
    }
    
    if (inSitemap) results.inSitemap.push(page);
    if (inNav) results.inNavigation.push(page);
    
    if (metadata && (!metadata.hasMetadata || !metadata.hasCanonical)) {
      results.missingMetadata.push({ ...page, metadata });
    }
  }
  
  console.log('\n📊 RESULTS:\n');
  console.log(`✅ In sitemap: ${results.inSitemap.length}`);
  console.log(`✅ In navigation: ${results.inNavigation.length}`);
  console.log(`⚠️  Orphaned (not in sitemap or nav): ${results.orphaned.length}`);
  console.log(`⚠️  Missing metadata: ${results.missingMetadata.length}\n`);
  
  if (results.orphaned.length > 0) {
    console.log('\n🔴 ORPHANED PAGES:\n');
    results.orphaned.slice(0, 20).forEach(page => {
      console.log(`  - ${page.route}`);
    });
    if (results.orphaned.length > 20) {
      console.log(`  ... and ${results.orphaned.length - 20} more`);
    }
  }
  
  if (results.missingMetadata.length > 0) {
    console.log('\n⚠️  PAGES MISSING METADATA:\n');
    results.missingMetadata.slice(0, 10).forEach(({ route, metadata }) => {
      console.log(`  - ${route}`);
      if (!metadata.hasMetadata) console.log('    Missing: metadata export');
      if (!metadata.hasCanonical) console.log('    Missing: canonical URL');
    });
  }
  
  // Write results to JSON for further processing
  fs.writeFileSync(
    'page-audit-results.json',
    JSON.stringify({ results, stats: { total: allPages.length, inSitemap: results.inSitemap.length, inNav: results.inNavigation.length, orphaned: results.orphaned.length } }, null, 2)
  );
  
  console.log('\n✅ Audit complete. Results saved to page-audit-results.json');
}

main().catch(console.error);

