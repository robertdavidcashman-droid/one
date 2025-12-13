#!/usr/bin/env node

/**
 * Full sync: Update navigation menu and all page content to match policestationagent.com exactly
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

const PSA_URL = 'https://policestationagent.com';
const APP_DIR = path.join(__dirname, '..', 'app');

// Known navigation structure from manual inspection
const PSA_NAVIGATION = {
  mainMenu: [
    { text: 'Home', href: '/' },
    { text: 'Services', href: '/services', hasDropdown: true },
    { text: 'About', href: '/about', hasDropdown: true },
    { text: 'Coverage', href: '/coverage', hasDropdown: true },
    { text: 'Articles', href: '/blog', hasDropdown: true },
    { text: 'Information', href: '/faq', hasDropdown: true },
    { text: 'Blog', href: '/blog', hasDropdown: true },
    { text: 'Contact', href: '/contact' },
  ],
  dropdowns: {
    'Services': [
      { text: 'All Services', href: '/services' },
      { text: 'What We Do', href: '/what-we-do' },
      { text: 'For Solicitors', href: '/for-solicitors' },
      { text: 'For Clients', href: '/for-clients' },
      { text: 'Voluntary Interviews', href: '/voluntary-interviews' },
      { text: 'Voluntary Interview Services', href: '/servicesvoluntaryinterviews' },
      { text: 'Legal Aid & Fees', href: '/fees' },
      { text: 'Private Client Services', href: '/privatecrime' },
      { text: 'Private Client FAQ', href: '/privateclientfaq' },
      { text: 'Court Representation', href: '/courtrepresentation' },
    ],
    'About': [
      { text: 'About Us', href: '/about' },
      { text: 'Why Use Us', href: '/why-use-us' },
      { text: 'What is a Criminal Solicitor', href: '/what-is-a-criminal-solicitor' },
      { text: 'What is a Police Station Rep', href: '/what-is-a-police-station-rep' },
    ],
    'Coverage': [
      { text: 'Areas Covered', href: '/coverage' },
      { text: 'Police Stations', href: '/police-stations' },
      { text: 'Kent Police Stations', href: '/kent-police-stations' },
      { text: 'Areas', href: '/areas' },
    ],
    'Articles': [
      { text: 'All Articles', href: '/blog' },
      { text: 'Vulnerable Adults in Custody', href: '/vulnerable-adults-in-custody' },
      { text: 'Preparing for Police Interview', href: '/preparing-for-police-interview' },
      { text: 'Importance of Early Legal Advice', href: '/importance-of-early-legal-advice' },
      { text: 'Arrival Times & Delays', href: '/arrival-times-delays' },
      { text: 'Booking In Procedure in Kent', href: '/booking-in-procedure-in-kent' },
      { text: 'What to do if a Loved One is Arrested', href: '/what-to-do-if-a-loved-one-is-arrested' },
      { text: 'Voluntary Interviews', href: '/voluntary-interviews' },
      { text: 'After a Police Interview', href: '/after-a-police-interview' },
    ],
    'Information': [
      { text: 'FAQ', href: '/faq' },
      { text: 'Privacy Policy', href: '/privacy' },
      { text: 'Cookies Policy', href: '/cookies' },
      { text: 'Accessibility', href: '/accessibility' },
      { text: 'Complaints', href: '/complaints' },
      { text: 'GDPR', href: '/gdpr' },
      { text: 'Terms and Conditions', href: '/termsandconditions' },
    ],
    'Blog': [
      { text: 'All Blog Posts', href: '/blog' },
    ],
  },
};

// Get all local page files
async function getLocalPages() {
  const files = await glob('**/page.tsx', {
    cwd: APP_DIR,
    ignore: ['**/node_modules/**', '**/.next/**', '**/admin/**', '**/api/**'],
  });
  
  const pages = new Map();
  files.forEach(file => {
    const route = file
      .replace(/\/page\.tsx$/, '')
      .replace(/\[slug\]/g, '*')
      .replace(/\[id\]/g, '*');
    
    const normalizedRoute = route ? `/${route}` : '/';
    pages.set(normalizedRoute, path.join(APP_DIR, file));
  });
  
  return pages;
}

// Scrape page content from PSA
async function scrapePSAPage(browser, route) {
  const page = await browser.newPage();
  
  try {
    const url = `${PSA_URL}${route}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    
    const data = await page.evaluate(() => {
      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]');
      const description = metaDesc ? metaDesc.getAttribute('content') || '' : '';
      
      // Get main content
      const main = document.querySelector('main') || 
                   document.querySelector('article') ||
                   document.querySelector('#content') ||
                   document.querySelector('.content') ||
                   document.body;
      
      let html = '';
      if (main) {
        const clone = main.cloneNode(true);
        clone.querySelectorAll('script, style, noscript, nav, header, footer, .header, .footer, .nav, .cookie-banner, [class*="cookie"], [id*="cookie"]').forEach(el => el.remove());
        html = clone.innerHTML;
      }
      
      return { title, description, html };
    });
    
    await page.close();
    
    if (!data.html || data.html.length < 200 || data.html.includes('404') || data.html.includes('Page Not Found')) {
      return null;
    }
    
    return data;
  } catch (error) {
    await page.close();
    return null;
  }
}

// Update page content
async function updatePageContent(filePath, data, route) {
  try {
    // Clean content
    let cleanContent = data.html
      .replace(/policestationagent\.com\/blog\//gi, '/criminaldefencekent/blog/')
      .replace(/policestationagent\.com\/post\?slug=/gi, '/criminaldefencekent/blog/')
      .replace(/policestationagent\.com\//gi, '/')
      .replace(/href=["']\/blog\//gi, 'href="/criminaldefencekent/blog/')
      .replace(/href=["']\/post\?slug=/gi, 'href="/criminaldefencekent/blog/')
      .replace(/01732\s*247\s*427/gi, '0333 049 7036')
      .replace(/01732247427/gi, '03330497036');
    
    const routeName = route.replace(/\//g, '').replace(/\*/g, 'slug') || 'home';
    const pageContent = `import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ${JSON.stringify(data.title.replace(/Police Station Agent/g, 'Criminal Defence Kent'))},
  description: ${JSON.stringify(data.description.replace(/Police Station Agent/g, 'Criminal Defence Kent'))},
  alternates: {
    canonical: ${JSON.stringify(`https://criminaldefencekent.co.uk${route}`)},
  },
  openGraph: {
    title: ${JSON.stringify(data.title.replace(/Police Station Agent/g, 'Criminal Defence Kent'))},
    description: ${JSON.stringify(data.description.replace(/Police Station Agent/g, 'Criminal Defence Kent'))},
    url: ${JSON.stringify(`https://criminaldefencekent.co.uk${route}`)},
    siteName: 'Criminal Defence Kent',
    type: 'website',
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
            dangerouslySetInnerHTML={{ __html: ${JSON.stringify(cleanContent)} }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
`;
    
    await fs.writeFile(filePath, pageContent, 'utf-8');
    return true;
  } catch (error) {
    console.error(`    ❌ Error updating ${filePath}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  FULL NAVIGATION & CONTENT SYNC`);
  console.log(`  Syncing with: ${PSA_URL}`);
  console.log(`${'═'.repeat(70)}\n`);

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Step 1: Get all routes from navigation
    console.log('Step 1: Collecting routes from navigation...\n');
    const allRoutes = new Set();
    
    // Add main menu routes
    PSA_NAVIGATION.mainMenu.forEach(item => {
      allRoutes.add(item.href);
    });
    
    // Add dropdown routes
    Object.values(PSA_NAVIGATION.dropdowns).forEach(items => {
      items.forEach(item => {
        allRoutes.add(item.href);
      });
    });
    
    const routesToCheck = Array.from(allRoutes).sort();
    console.log(`  Found ${routesToCheck.length} routes in navigation\n`);
    
    // Step 2: Get local pages
    console.log('Step 2: Getting local pages...\n');
    const localPages = await getLocalPages();
    console.log(`  Found ${localPages.size} local pages\n`);
    
    // Step 3: Check and update pages
    console.log('Step 3: Checking and updating pages...\n');
    let updated = 0;
    let created = 0;
    let skipped = 0;
    
    for (const route of routesToCheck) {
      const localPath = localPages.get(route);
      
      if (localPath) {
        console.log(`  ✓ ${route} - exists`);
        // Could check if content needs updating here
        skipped++;
      } else {
        console.log(`  📝 ${route} - needs to be created`);
        // Create the page
        const routePath = route === '/' ? 'page.tsx' : `${route.replace(/^\//, '').replace(/\//g, '/')}/page.tsx`;
        const filePath = path.join(APP_DIR, routePath);
        const dirPath = path.dirname(filePath);
        
        await fs.mkdir(dirPath, { recursive: true });
        
        // Scrape content
        const content = await scrapePSAPage(browser, route);
        if (content) {
          if (await updatePageContent(filePath, content, route)) {
            created++;
            console.log(`    ✅ Created`);
          }
        } else {
          console.log(`    ⚠️  No content found`);
        }
        
        await new Promise(r => setTimeout(r, 1500)); // Rate limiting
      }
    }
    
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  RESULTS`);
    console.log(`${'═'.repeat(70)}`);
    console.log(`  ✅ Pages updated: ${updated}`);
    console.log(`  📄 Pages created: ${created}`);
    console.log(`  ⏭️  Pages skipped: ${skipped}`);
    console.log(`\n  📋 Next: Update Header.tsx with navigation structure`);
    console.log(`${'═'.repeat(70)}\n`);
    
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);













