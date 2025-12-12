#!/usr/bin/env node

/**
 * Scrape and populate the 11 pages that currently have 404 content
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const PSA_URL = 'https://policestationagent.com';
const APP_DIR = path.join(__dirname, '..', 'app');

// Pages that need content
const PAGES_TO_SCRAPE = [
  { route: '/what-we-do', file: 'app/what-we-do/page.tsx' },
  { route: '/voluntary-interviews', file: 'app/voluntary-interviews/page.tsx' },
  { route: '/what-is-a-criminal-solicitor', file: 'app/what-is-a-criminal-solicitor/page.tsx' },
  { route: '/what-is-a-police-station-rep', file: 'app/what-is-a-police-station-rep/page.tsx' },
  { route: '/vulnerable-adults-in-custody', file: 'app/vulnerable-adults-in-custody/page.tsx' },
  { route: '/preparing-for-police-interview', file: 'app/preparing-for-police-interview/page.tsx' },
  { route: '/importance-of-early-legal-advice', file: 'app/importance-of-early-legal-advice/page.tsx' },
  { route: '/arrival-times-delays', file: 'app/arrival-times-delays/page.tsx' },
  { route: '/booking-in-procedure-in-kent', file: 'app/booking-in-procedure-in-kent/page.tsx' },
  { route: '/what-to-do-if-a-loved-one-is-arrested', file: 'app/what-to-do-if-a-loved-one-is-arrested/page.tsx' },
  { route: '/after-a-police-interview', file: 'app/after-a-police-interview/page.tsx' },
];

// Scrape page content from PSA
async function scrapePSAPage(browser, route) {
  const page = await browser.newPage();
  
  try {
    // Try multiple URL formats
    const urls = [
      `${PSA_URL}${route}`,
      `${PSA_URL}${route}/`,
      `${PSA_URL}${route.replace(/-/g, '')}`,
    ];
    
    let data = null;
    for (const url of urls) {
      try {
        console.log(`    Trying: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        await new Promise(r => setTimeout(r, 3000));
        
        data = await page.evaluate(() => {
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
          
          // Check for 404
          const is404 = html.includes('404') || 
                       html.includes('Page Not Found') || 
                       html.includes('not found') ||
                       document.body.textContent.includes('404');
          
          return { title, description, html, is404 };
        });
        
        if (data && !data.is404 && data.html && data.html.length > 500) {
          break; // Success!
        }
      } catch (error) {
        // Try next URL
        continue;
      }
    }
    
    await page.close();
    
    if (!data || data.is404 || !data.html || data.html.length < 500) {
      return null;
    }
    
    return data;
  } catch (error) {
    await page.close();
    return null;
  }
}

// Update page with scraped content
async function updatePage(filePath, data, route) {
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
    
    const fullPath = path.join(__dirname, '..', filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, pageContent, 'utf-8');
    return true;
  } catch (error) {
    console.error(`    ❌ Error updating ${filePath}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  SCRAPING MISSING CONTENT FOR 11 PAGES`);
  console.log(`${'═'.repeat(70)}\n`);

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    let success = 0;
    let failed = 0;
    
    for (let i = 0; i < PAGES_TO_SCRAPE.length; i++) {
      const { route, file } = PAGES_TO_SCRAPE[i];
      console.log(`[${i + 1}/${PAGES_TO_SCRAPE.length}] Processing: ${route}`);
      
      try {
        const data = await scrapePSAPage(browser, route);
        
        if (data) {
          if (await updatePage(file, data, route)) {
            console.log(`    ✅ Successfully scraped and updated`);
            success++;
          } else {
            console.log(`    ❌ Failed to update file`);
            failed++;
          }
        } else {
          console.log(`    ⚠️  No content found (may be 404 on original site)`);
          failed++;
        }
      } catch (error) {
        console.error(`    ❌ Error: ${error.message}`);
        failed++;
      }
      
      await new Promise(r => setTimeout(r, 2000)); // Rate limiting
    }
    
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  RESULTS`);
    console.log(`${'═'.repeat(70)}`);
    console.log(`  ✅ Successfully updated: ${success} pages`);
    console.log(`  ❌ Failed: ${failed} pages`);
    console.log(`${'═'.repeat(70)}\n`);
    
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);

