#!/usr/bin/env node

/**
 * Comprehensive page audit - generates final report
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function getAllPages() {
  const pageFiles = await glob('app/**/page.tsx', {
    ignore: ['**/node_modules/**', '**/.next/**', '**/admin/**'],
  });

  return pageFiles.map(file => {
    let route = file
      .replace(/^app\//, '/')
      .replace(/\/page\.tsx$/, '');
    
    if (route === '') route = '/';
    
    return {
      file,
      route,
      isDynamic: route.includes('[') || route.includes('*'),
    };
  });
}

async function checkPageContent(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const hasMetadata = /export\s+(const|async\s+function)\s+metadata/.test(content);
    const hasTitle = /title:/.test(content);
    const hasDescription = /description:/.test(content);
    const hasCanonical = /canonical:/.test(content);
    const hasOpenGraph = /openGraph:/.test(content);
    const hasDefaultExport = /export\s+default\s+function/.test(content);
    const hasHeader = /Header/.test(content);
    const hasFooter = /Footer/.test(content);
    
    // Extract title if available
    const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
    const title = titleMatch ? titleMatch[1] : null;
    
    return {
      hasMetadata,
      hasTitle,
      hasDescription,
      hasCanonical,
      hasOpenGraph,
      hasDefaultExport,
      hasHeader,
      hasFooter,
      title,
    };
  } catch (error) {
    return null;
  }
}

async function getNavigationLinks() {
  const headerContent = fs.readFileSync('components/Header.tsx', 'utf8');
  const footerContent = fs.readFileSync('components/Footer.tsx', 'utf8');
  
  const links = new Set();
  
  // Extract href attributes
  const hrefRegex = /href=["']([^"']+)["']/g;
  
  let match;
  while ((match = hrefRegex.exec(headerContent)) !== null) {
    if (match[1].startsWith('/') && !match[1].startsWith('//') && !match[1].includes('#')) {
      links.add(match[1]);
    }
  }
  
  while ((match = hrefRegex.exec(footerContent)) !== null) {
    if (match[1].startsWith('/') && !match[1].startsWith('//') && !match[1].includes('#')) {
      links.add(match[1]);
    }
  }
  
  return links;
}

async function main() {
  console.log('🔍 Comprehensive Page Audit\n');
  
  const allPages = await getAllPages();
  const navLinks = await getNavigationLinks();
  
  const results = {
    pages: [],
    inNavigation: 0,
    missingMetadata: [],
    orphaned: [],
    issues: [],
  };
  
  for (const page of allPages) {
    if (page.isDynamic) continue; // Skip dynamic routes
    
    const content = await checkPageContent(page.file);
    const inNav = navLinks.has(page.route);
    
    if (inNav) results.inNavigation++;
    
    const pageInfo = {
      route: page.route,
      file: page.file,
      inNavigation: inNav,
      hasMetadata: content?.hasMetadata || false,
      hasCanonical: content?.hasCanonical || false,
      hasTitle: content?.hasTitle || false,
      hasDescription: content?.hasDescription || false,
      title: content?.title || 'No title',
    };
    
    results.pages.push(pageInfo);
    
    if (!content?.hasMetadata || !content?.hasCanonical) {
      results.missingMetadata.push(pageInfo);
    }
    
    if (!inNav && content?.hasDefaultExport) {
      results.orphaned.push(pageInfo);
    }
  }
  
  // Generate report
  console.log('📊 AUDIT RESULTS:\n');
  console.log(`Total Pages: ${results.pages.length}`);
  console.log(`In Navigation: ${results.inNavigation}`);
  console.log(`Missing Metadata: ${results.missingMetadata.length}`);
  console.log(`Orphaned Pages: ${results.orphaned.length}\n`);
  
  // Write detailed JSON
  fs.writeFileSync(
    'comprehensive-audit-results.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log('✅ Detailed results saved to comprehensive-audit-results.json');
}

main().catch(console.error);
