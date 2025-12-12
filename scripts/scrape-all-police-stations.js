#!/usr/bin/env node

/**
 * Scrape all police station pages from policestationagent.com
 * and update/create them in criminaldefencekent.co.uk
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const PSA_URL = 'https://policestationagent.com';
const APP_DIR = path.join(__dirname, '..', 'app');

// List of police stations to check
const POLICE_STATIONS = [
  'medway-police-station',
  'swanley-police-station',
  'canterbury-police-station',
  'folkestone-police-station',
  'dover-police-station',
  'margate-police-station',
  'tonbridge-police-station',
  'maidstone-police-station',
  'sevenoaks-police-station',
  'tunbridge-wells-police-station',
  'north-kent-gravesend-police-station',
  'gravesend-police-station',
  'bluewater-police-station',
  'sittingbourne-police-station',
  'ashford-police-station',
  'coldharbour-police-station',
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
    
    if (!data.html || data.html.length < 200) {
      console.error(`    ⚠️  No content found for ${route}`);
      return null;
    }
    
    return data;
  } catch (error) {
    await page.close();
    console.error(`    ❌ Error: ${error.message}`);
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
    const content = await fs.readFile(filePath, 'utf-8');
    // Check if it has actual content (not just 404)
    if (content.includes('Page Not Found') || content.includes('404')) {
      return { exists: true, hasContent: false };
    }
    // Check if it has meaningful content
    const htmlMatch = content.match(/dangerouslySetInnerHTML=\{\{\s*__html:\s*(.+?)\s*\}\}/s);
    if (htmlMatch) {
      const htmlValue = htmlMatch[1].trim();
      // Check if it's a template literal with content
      if (htmlValue.length > 500 && !htmlValue.includes('404')) {
        return { exists: true, hasContent: true };
      }
    }
    return { exists: true, hasContent: false };
  } catch (error) {
    return { exists: false, hasContent: false };
  }
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  SCRAPING ALL POLICE STATION PAGES`);
  console.log(`${'═'.repeat(70)}\n`);

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    let updated = 0;
    let created = 0;
    let failed = 0;
    let skipped = 0;
    
    for (const route of POLICE_STATIONS) {
      console.log(`\nProcessing: ${route}`);
      
      // Check local page
      const local = await checkLocalPage(route);
      
      if (local.exists && local.hasContent) {
        console.log(`  ℹ️  Page exists with content, checking if update needed...`);
      }
      
      const data = await scrapePage(browser, route);
      
      if (data) {
        if (local.exists) {
          if (await createOrUpdatePage(route, data)) {
            updated++;
          } else {
            failed++;
          }
        } else {
          if (await createOrUpdatePage(route, data)) {
            created++;
          } else {
            failed++;
          }
        }
      } else {
        if (local.exists && local.hasContent) {
          skipped++;
          console.log(`  ⏭️  Skipped (no content from PSA, but local page exists)`);
        } else {
          failed++;
        }
      }
      
      await new Promise(r => setTimeout(r, 1000)); // Rate limiting
    }
    
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  RESULTS`);
    console.log(`${'═'.repeat(70)}`);
    console.log(`  ✅ Created: ${created} pages`);
    console.log(`  🔄 Updated: ${updated} pages`);
    console.log(`  ⏭️  Skipped: ${skipped} pages`);
    console.log(`  ❌ Failed: ${failed} pages`);
    console.log(`${'═'.repeat(70)}\n`);
    
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);

