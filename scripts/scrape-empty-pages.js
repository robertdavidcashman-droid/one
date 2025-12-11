#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const EMPTY_PAGES = [
  // PSA stations - these might redirect to their police-station equivalents
  '/ashford-psa-station',
  '/bluewater-psa-station',
  '/canterbury-psa-station',
  '/dover-psa-station',
  '/folkestone-psa-station',
  '/maidstone-psa-station',
  '/margate-psa-station',
  '/medway-psa-station',
  '/north-kent-gravesend-psa-station',
  '/sevenoaks-psa-station',
  '/sittingbourne-psa-station',
  '/swanley-psa-station',
  '/tonbridge-psa-station',
  '/tunbridge-wells-psa-station',
];

async function scrapeAndSave(browser, route) {
  const page = await browser.newPage();
  
  try {
    const url = `https://policestationagent.com${route}`;
    console.log(`  Scraping ${route}...`);
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    // Get page content
    const data = await page.evaluate(() => {
      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]');
      const description = metaDesc ? metaDesc.getAttribute('content') || '' : '';
      
      // Try to get main content
      const main = document.querySelector('main') || document.querySelector('#root') || document.body;
      let html = main ? main.innerHTML : '';
      
      // Clean up - remove scripts and styles
      const temp = document.createElement('div');
      temp.innerHTML = html;
      temp.querySelectorAll('script, style, noscript').forEach(el => el.remove());
      html = temp.innerHTML;
      
      return { title, description, html };
    });
    
    if (data.html && data.html.length > 100) {
      // Save the page
      const pagePath = `app${route}/page.tsx`;
      const dir = path.dirname(pagePath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const safeTitle = (data.title || 'Page').replace(/`/g, "'").replace(/\$/g, '');
      const safeDesc = (data.description || '').replace(/`/g, "'").replace(/\$/g, '');
      const safeHtml = data.html.replace(/`/g, '\\`').replace(/\${/g, '\\${');
      
      const pageContent = `import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "${safeTitle.replace(/"/g, '\\"')}",
  description: "${safeDesc.replace(/"/g, '\\"')}",
  alternates: {
    canonical: "https://criminaldefencekent.co.uk${route}",
  },
  openGraph: {
    title: "${safeTitle.replace(/"/g, '\\"')}",
    description: "${safeDesc.replace(/"/g, '\\"')}",
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
            dangerouslySetInnerHTML={{ __html: \`${safeHtml}\` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
`;

      fs.writeFileSync(pagePath, pageContent);
      console.log(`    ✅ Saved ${route} (${data.html.length} chars)`);
      return true;
    } else {
      console.log(`    ⚠️  No content found for ${route}`);
      return false;
    }
  } catch (err) {
    console.log(`    ❌ Error: ${err.message}`);
    return false;
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║              SCRAPING EMPTY PAGES FROM ORIGINAL SITE               ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let success = 0;
  let failed = 0;

  for (const route of EMPTY_PAGES) {
    const result = await scrapeAndSave(browser, route);
    if (result) success++;
    else failed++;
  }

  await browser.close();

  console.log('\n═══════════════════════════════════════════════════════════════════════');
  console.log(`✅ Successfully scraped: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('═══════════════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);

