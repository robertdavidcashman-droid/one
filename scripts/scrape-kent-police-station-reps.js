#!/usr/bin/env node

/**
 * Scrape kent-police-station-reps page from policestationagent.com
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const PSA_URL = 'https://policestationagent.com';
const APP_DIR = path.join(__dirname, '..', 'app');

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

async function createPage(route, data) {
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
    console.log(`    ✅ Created: ${routePath}`);
    return true;
  } catch (error) {
    console.error(`    ❌ Error creating ${filePath}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  SCRAPING KENT POLICE STATION REPS PAGE`);
  console.log(`${'═'.repeat(70)}\n`);

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const route = 'kent-police-station-reps';
    console.log(`Processing: ${route}`);
    
    const data = await scrapePage(browser, route);
    
    if (data) {
      if (await createPage(route, data)) {
        console.log(`\n✅ Successfully created ${route} page!`);
      } else {
        console.log(`\n❌ Failed to create ${route} page`);
      }
    } else {
      console.log(`\n❌ No content found for ${route}`);
    }
    
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);



