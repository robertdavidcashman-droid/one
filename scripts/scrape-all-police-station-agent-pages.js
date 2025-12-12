#!/usr/bin/env node

/**
 * Scrape all police-station-agent-* pages from policestationagent.com
 * These might be the solicitor pages the user is referring to
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const PSA_URL = 'https://policestationagent.com';
const APP_DIR = path.join(__dirname, '..', 'app');

// List of locations to check - both solicitor and police-station-agent formats
const LOCATIONS = [
  'bromley',
  'dartford',
  'maidstone',
  'medway',
  'canterbury',
  'folkestone',
  'dover',
  'margate',
  'tonbridge',
  'sevenoaks',
  'tunbridge-wells',
  'gravesend',
  'bluewater',
  'sittingbourne',
  'ashford',
  'swanley',
  'gillingham',
  'chatham',
  'rochester',
  'ramsgate',
  'whitstable',
  'faversham',
  'deal',
  'sandwich',
  'herne-bay',
];

async function scrapePage(browser, route) {
  const url = `${PSA_URL}/${route}`;
  const page = await browser.newPage();
  
  try {
    console.log(`  📥 Scraping: ${route}`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    const data = await page.evaluate(() => {
      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]');
      const description = metaDesc ? metaDesc.getAttribute('content') || '' : '';
      const h1 = document.querySelector('h1')?.textContent || '';
      
      // Get main content
      const main = document.querySelector('main') || 
                   document.querySelector('article') ||
                   document.querySelector('#content') ||
                   document.querySelector('.content') ||
                   document.body;
      
      let html = '';
      if (main) {
        const clone = main.cloneNode(true);
        clone.querySelectorAll('script, style, noscript, nav, header, footer, .header, .footer, .nav').forEach(el => el.remove());
        html = clone.innerHTML;
      }
      
      return { title, description, h1, html };
    });
    
    await page.close();
    
    // Check if page exists (not 404)
    if (!data.html || data.html.length < 200 || data.html.includes('404') || data.html.includes('Page Not Found')) {
      return null;
    }
    
    return data;
  } catch (error) {
    await page.close();
    return null;
  }
}

async function createOrUpdatePage(route, data) {
  const routePath = `app/${route}/page.tsx`;
  const filePath = path.join(__dirname, '..', routePath);
  const dirPath = path.dirname(filePath);
  
  try {
    await fs.mkdir(dirPath, { recursive: true });
    
    // Clean content
    let html = data.html || '';
    html = html.replace(/policestationagent\.com/gi, 'criminaldefencekent.co.uk');
    html = html.replace(/Police Station Agent/gi, 'Criminal Defence Kent');
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    
    const title = (data.title || data.h1 || 'Criminal Defence Kent')
      .replace(/Police Station Agent/gi, 'Criminal Defence Kent');
    const description = (data.description || '')
      .replace(/Police Station Agent/gi, 'Criminal Defence Kent');
    const canonical = `https://criminaldefencekent.co.uk/${route}`;
    
    const pageContent = `import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(description)},
  alternates: {
    canonical: ${JSON.stringify(canonical)},
  },
  openGraph: {
    title: ${JSON.stringify(title)},
    description: ${JSON.stringify(description)},
    url: ${JSON.stringify(canonical)},
    siteName: 'Criminal Defence Kent',
    type: 'website',
  },
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(html)} }} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
`;
    
    await fs.writeFile(filePath, pageContent, 'utf-8');
    console.log(`    ✅ Created/Updated: ${routePath}`);
    return true;
  } catch (error) {
    console.error(`    ❌ Error creating ${filePath}: ${error.message}`);
    return false;
  }
}

async function checkLocalPage(route) {
  const filePath = path.join(__dirname, '..', `app/${route}/page.tsx`);
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  SCRAPING POLICE STATION AGENT PAGES`);
  console.log(`${'═'.repeat(70)}\n`);

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    let created = 0;
    let updated = 0;
    let notFound = 0;
    
    for (const location of LOCATIONS) {
      // Try both formats
      const routes = [
        `police-station-agent-${location}`,
        `${location}-solicitor`,
      ];
      
      for (const route of routes) {
        console.log(`\nProcessing: ${route}`);
        
        const localExists = await checkLocalPage(route);
        const data = await scrapePage(browser, route);
        
        if (data) {
          if (localExists) {
            if (await createOrUpdatePage(route, data)) {
              updated++;
            }
          } else {
            if (await createOrUpdatePage(route, data)) {
              created++;
            }
          }
        } else {
          if (!localExists) {
            notFound++;
            console.log(`  ⚠️  Page not found on PSA`);
          }
        }
        
        await new Promise(r => setTimeout(r, 1000)); // Rate limiting
      }
    }
    
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  RESULTS`);
    console.log(`${'═'.repeat(70)}`);
    console.log(`  ✅ Created: ${created} pages`);
    console.log(`  🔄 Updated: ${updated} pages`);
    console.log(`  ⚠️  Not Found: ${notFound} pages`);
    console.log(`${'═'.repeat(70)}\n`);
    
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);

