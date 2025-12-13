#!/usr/bin/env node

/**
 * Full site comparison using Puppeteer
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Known pages on policestationagent.com (based on sitemap and navigation)
const KNOWN_REMOTE_PAGES = [
  '/',
  '/about',
  '/services',
  '/coverage',
  '/courtrepresentation',
  '/privatecrime',
  '/forsolicitors',
  '/contact',
  '/blog',
  '/faq',
  '/privacy',
  '/terms-and-conditions',
  '/accessibility',
  '/what-we-do',
  '/why-use-us',
  '/canwehelp',
  '/arrestednow',
  '/outofarea',
  '/christmashours',
  '/extendedhours',
  '/freelegaladvice',
  '/voluntaryinterviews',
  '/policeinterviewhelp',
  '/refusingpoliceinterview',
  '/nofurtheractionafterpoliceinterview',
  '/what-happens-if-ignore-police-interview',
  '/voluntary-police-interview-risks',
  '/your-rights-in-custody',
  '/police-custody-rights',
  '/police-interview-rights',
  '/article-police-caution-before-interview',
  '/article-interview-under-caution',
  '/article-loved-one-arrested-kent',
  '/what-is-a-police-station-rep',
  '/what-is-a-criminal-solicitor',
  '/areas',
  // Police stations
  '/medway-police-station',
  '/canterbury-police-station',
  '/maidstone-police-station',
  '/north-kent-gravesend-police-station',
  '/folkestone-police-station',
  '/tonbridge-police-station',
  '/ashford-police-station',
  '/dover-police-station',
  '/margate-police-station',
  '/sevenoaks-police-station',
  '/sittingbourne-police-station',
  '/swanley-police-station',
  '/tunbridge-wells-police-station',
  '/bluewater-police-station',
  '/coldharbour-police-station',
  // PSA stations (duplicates with different URL format)
  '/psastations',
  '/police-stations',
  // Agent pages
  '/police-station-agent-kent',
  '/police-station-agent-medway',
  '/police-station-agent-canterbury',
  '/police-station-agent-maidstone',
  '/police-station-agent-gravesend',
  '/police-station-agent-folkestone',
  '/police-station-agent-tonbridge',
  '/police-station-agent-ashford',
  '/police-station-agent-sevenoaks',
  '/police-station-agent-sittingbourne',
  '/police-station-agent-dartford',
  // Other
  '/testimonials',
  '/fees',
  '/hours',
  '/gdpr',
  '/cookies',
  '/complaints',
  '/join',
];

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
        if (['api', 'components', '_app', '_document', 'manifest.json'].includes(item)) continue;
        if (item.startsWith('[')) continue; // Skip dynamic routes for comparison
        
        const pagePath = path.join(fullPath, 'page.tsx');
        if (fs.existsSync(pagePath)) {
          const route = prefix + '/' + item;
          pages.push(route);
        }
        
        scanDir(fullPath, prefix + '/' + item);
      }
    }
  }
  
  if (fs.existsSync(path.join(appDir, 'page.tsx'))) {
    pages.push('/');
  }
  
  scanDir(appDir);
  return pages;
}

// Check if a page has actual content
function pageHasContent(route) {
  const pagePath = route === '/' ? 'app/page.tsx' : `app${route}/page.tsx`;
  
  if (!fs.existsSync(pagePath)) return false;
  
  const content = fs.readFileSync(pagePath, 'utf8');
  
  // Check if it's just a skeleton/placeholder
  if (content.includes('Content coming soon') || content.length < 500) {
    return false;
  }
  
  return true;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║              FULL SITE COMPARISON REPORT                           ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  // Get local pages
  const localPages = getLocalPages();
  const localSet = new Set(localPages.map(p => p.toLowerCase()));
  
  console.log(`📂 Local pages found: ${localPages.length}\n`);

  // Compare with known remote pages
  console.log('🔍 Comparing with policestationagent.com pages...\n');
  
  const missing = [];
  const present = [];
  const needsContent = [];
  
  for (const remotePage of KNOWN_REMOTE_PAGES) {
    const normalized = remotePage.toLowerCase();
    
    if (localSet.has(normalized)) {
      if (pageHasContent(remotePage)) {
        present.push(remotePage);
      } else {
        needsContent.push(remotePage);
      }
    } else {
      missing.push(remotePage);
    }
  }
  
  // Report
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('                              RESULTS                                   ');
  console.log('═══════════════════════════════════════════════════════════════════════\n');
  
  console.log(`✅ Pages present with content: ${present.length}`);
  console.log(`⚠️  Pages present but need content: ${needsContent.length}`);
  console.log(`❌ Pages missing entirely: ${missing.length}\n`);
  
  if (needsContent.length > 0) {
    console.log('⚠️  Pages that need content:');
    for (const page of needsContent) {
      console.log(`   • ${page}`);
    }
    console.log('');
  }
  
  if (missing.length > 0) {
    console.log('❌ Missing pages:');
    for (const page of missing) {
      console.log(`   • ${page}`);
    }
    console.log('');
  }
  
  // Extra local pages not on the known list
  const remoteSet = new Set(KNOWN_REMOTE_PAGES.map(p => p.toLowerCase()));
  const extraLocal = localPages.filter(p => !remoteSet.has(p.toLowerCase()));
  
  if (extraLocal.length > 0) {
    console.log(`📝 Extra local pages (${extraLocal.length} unique to your site):`);
    for (const page of extraLocal.slice(0, 20)) {
      console.log(`   + ${page}`);
    }
    if (extraLocal.length > 20) {
      console.log(`   ... and ${extraLocal.length - 20} more`);
    }
    console.log('');
  }
  
  // Summary
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('                              SUMMARY                                   ');
  console.log('═══════════════════════════════════════════════════════════════════════\n');
  
  const coverage = ((present.length / KNOWN_REMOTE_PAGES.length) * 100).toFixed(1);
  console.log(`📊 Coverage: ${coverage}% (${present.length}/${KNOWN_REMOTE_PAGES.length} pages with content)`);
  console.log(`📂 Total local pages: ${localPages.length}`);
  console.log(`🌐 Known remote pages: ${KNOWN_REMOTE_PAGES.length}`);
  
  if (needsContent.length > 0 || missing.length > 0) {
    console.log('\n📌 To scrape missing content, run:');
    console.log('   node scripts/scrape-missing-pages.js');
  } else {
    console.log('\n✅ All pages are present and have content!');
  }
}

main().catch(console.error);







