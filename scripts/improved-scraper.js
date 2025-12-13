#!/usr/bin/env node

/**
 * Improved scraper with better content detection
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const PSA_URL = 'https://policestationagent.com';
const APP_DIR = path.join(__dirname, '..', 'app');

// Pages that need content
const PAGES_TO_SCRAPE = [
  { route: '/vulnerable-adults-in-custody', file: 'app/vulnerable-adults-in-custody/page.tsx' },
  { route: '/preparing-for-police-interview', file: 'app/preparing-for-police-interview/page.tsx' },
  { route: '/importance-of-early-legal-advice', file: 'app/importance-of-early-legal-advice/page.tsx' },
  { route: '/arrival-times-delays', file: 'app/arrival-times-delays/page.tsx' },
  { route: '/booking-in-procedure-in-kent', file: 'app/booking-in-procedure-in-kent/page.tsx' },
  { route: '/what-to-do-if-a-loved-one-is-arrested', file: 'app/what-to-do-if-a-loved-one-is-arrested/page.tsx' },
];

// Improved content extraction
async function scrapePSAPage(browser, route) {
  const page = await browser.newPage();
  
  try {
    // Set a longer viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Try multiple URL formats
    const urls = [
      `${PSA_URL}${route}`,
      `${PSA_URL}${route}/`,
      `${PSA_URL}${route.replace(/-/g, '')}`,
      `${PSA_URL}/blog${route}`,
      `${PSA_URL}/articles${route}`,
    ];
    
    let data = null;
    for (const url of urls) {
      try {
        console.log(`    Trying: ${url}`);
        
        // Navigate with longer timeout
        await page.goto(url, { 
          waitUntil: 'networkidle0', 
          timeout: 60000 
        });
        
        // Wait for content to load (handle dynamic content)
        await new Promise(r => setTimeout(r, 5000));
        
        // Wait for specific content selectors
        try {
          await page.waitForSelector('main, article, [role="main"], .content, #content', { timeout: 10000 });
        } catch {
          // Continue even if selector not found
        }
        
        data = await page.evaluate(() => {
          const title = document.title || '';
          const metaDesc = document.querySelector('meta[name="description"]');
          const description = metaDesc ? metaDesc.getAttribute('content') || '' : '';
          
          // Try multiple content selectors in order of preference
          const selectors = [
            'main article',
            'main',
            'article',
            '[role="main"]',
            '.content',
            '#content',
            '.post-content',
            '.article-content',
            '.blog-post',
            'body',
          ];
          
          let main = null;
          let html = '';
          
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
              const textContent = element.textContent || '';
              // Check if it has substantial content (not just navigation/header)
              if (textContent.length > 500 && !textContent.includes('404')) {
                main = element;
                break;
              }
            }
          }
          
          if (main) {
            const clone = main.cloneNode(true);
            // Remove unwanted elements
            clone.querySelectorAll('script, style, noscript, nav, header, footer, .header, .footer, .nav, .cookie-banner, [class*="cookie"], [id*="cookie"], [class*="sidebar"], [class*="widget"], [class*="menu"]').forEach(el => el.remove());
            html = clone.innerHTML;
          }
          
          // Get all text content to check for 404
          const bodyText = document.body ? document.body.textContent || '' : '';
          const is404 = html.includes('404') || 
                       html.includes('Page Not Found') || 
                       html.includes('not found') ||
                       bodyText.includes('404') ||
                       bodyText.includes('Page Not Found');
          
          // Check content length
          const hasContent = html.length > 500 && !is404;
          
          return { 
            title, 
            description, 
            html, 
            is404, 
            hasContent,
            bodyTextLength: bodyText.length,
            htmlLength: html.length
          };
        });
        
        if (data && data.hasContent) {
          console.log(`    ✅ Found content (${data.htmlLength} chars)`);
          break; // Success!
        } else {
          console.log(`    ⚠️  Content check: is404=${data?.is404}, hasContent=${data?.hasContent}, htmlLength=${data?.htmlLength}`);
        }
      } catch (error) {
        console.log(`    ⚠️  Error on ${url}: ${error.message}`);
        // Try next URL
        continue;
      }
    }
    
    await page.close();
    
    if (!data || !data.hasContent) {
      return null;
    }
    
    return data;
  } catch (error) {
    await page.close();
    console.error(`    ❌ Scraping error: ${error.message}`);
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
  console.log(`  IMPROVED SCRAPER - Better Content Detection`);
  console.log(`${'═'.repeat(70)}\n`);

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
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
          console.log(`    ⚠️  Could not find content`);
          failed++;
        }
      } catch (error) {
        console.error(`    ❌ Error: ${error.message}`);
        failed++;
      }
      
      await new Promise(r => setTimeout(r, 3000)); // Rate limiting
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













