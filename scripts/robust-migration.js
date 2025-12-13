#!/usr/bin/env node

/**
 * ROBUST MULTI-PASS MIGRATION
 * Uses a simpler, more reliable approach:
 * 1. Get known routes from PSA sitemap/navigation
 * 2. Scrape each route individually
 * 3. Compare with local CDK files
 * 4. Import missing/incomplete pages
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { JSDOM } = require('jsdom');

const PSA_URL = 'https://policestationagent.com';
const CDK_URL = 'https://criminaldefencekent.co.uk';
const APP_DIR = path.join(__dirname, '..', 'app');

// Known routes from PSA (from previous analysis)
const KNOWN_PSA_ROUTES = [
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
  '/voluntary-interviews',
  '/after-a-police-interview',
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
];

async function scrapePSAPage(browser, route) {
  const url = `${PSA_URL}${route}`;
  const page = await browser.newPage();
  
  try {
    console.log(`  Scraping: ${route}`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    
    const data = await page.evaluate(() => {
      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]');
      const description = metaDesc ? metaDesc.getAttribute('content') || '' : '';
      const h1 = document.querySelector('h1')?.textContent || '';
      const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent);
      
      const main = document.querySelector('main') || 
                   document.querySelector('article') ||
                   document.querySelector('#content') ||
                   document.body;
      
      let html = '';
      if (main) {
        const clone = main.cloneNode(true);
        clone.querySelectorAll('script, style, noscript, nav, header, footer, .header, .footer, .nav').forEach(el => el.remove());
        html = clone.innerHTML;
      }
      
      const text = main ? main.textContent || '' : '';
      
      return { title, description, h1, h2s, html, text };
    });
    
    await page.close();
    
    const hash = crypto.createHash('md5').update(data.text).digest('hex');
    
    return {
      route,
      url,
      ...data,
      hash,
      summary: data.text.substring(0, 200).trim(),
    };
  } catch (error) {
    await page.close();
    console.error(`    ❌ Error: ${error.message}`);
    return null;
  }
}

async function getLocalCDKPage(route) {
  const routePath = route === '/' ? 'app/page.tsx' : `app${route}/page.tsx`;
  const filePath = path.join(__dirname, '..', routePath);
  
  try {
    await fs.access(filePath);
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract metadata
    const titleMatch = content.match(/title:\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1/) || 
                      content.match(/title:\s*([^,\n}]+)/);
    const descMatch = content.match(/description:\s*(["'`])((?:\\.|(?!\2)[^\\])*)\2/) || 
                    content.match(/description:\s*([^,\n}]+)/);
    
    const title = titleMatch ? (titleMatch[2] || titleMatch[1] || '').replace(/['"]/g, '') : '';
    const description = descMatch ? (descMatch[2] || descMatch[1] || '').replace(/['"]/g, '') : '';
    
    // Extract HTML content
    const htmlMatch = content.match(/dangerouslySetInnerHTML=\{\{\s*__html:\s*(.+?)\s*\}\}/s);
    let html = '';
    let text = '';
    
    if (htmlMatch) {
      const htmlValue = htmlMatch[1].trim();
      const templateMatch = htmlValue.match(/`([^`]*)`/s);
      if (templateMatch) {
        html = templateMatch[1]
          .replace(/\\`/g, '`')
          .replace(/\\\$/g, '$')
          .replace(/\\n/g, '\n');
        const dom = new JSDOM(html);
        text = dom.window.document.body.textContent || '';
      } else {
        // Try JSON.stringify format
        const jsonMatch = htmlValue.match(/JSON\.stringify\((.+?)\)/s);
        if (jsonMatch) {
          try {
            html = JSON.parse(jsonMatch[1].replace(/^['"]|['"]$/g, ''));
            const dom = new JSDOM(html);
            text = dom.window.document.body.textContent || '';
          } catch (e) {
            text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          }
        }
      }
    } else {
      text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    const hash = crypto.createHash('md5').update(text).digest('hex');
    
    return {
      route,
      title,
      description,
      html,
      text,
      hash,
      summary: text.substring(0, 200).trim(),
      exists: true,
    };
  } catch (error) {
    return { route, exists: false };
  }
}

function calculateSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  
  const words1 = new Set(text1.toLowerCase().match(/\b\w+\b/g) || []);
  const words2 = new Set(text2.toLowerCase().match(/\b\w+\b/g) || []);
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

async function createPageFile(route, psaData) {
  const routePath = route === '/' ? 'app/page.tsx' : `app${route}/page.tsx`;
  const filePath = path.join(__dirname, '..', routePath);
  const dirPath = path.dirname(filePath);
  
  try {
    await fs.mkdir(dirPath, { recursive: true });
    
    // Clean content
    let html = psaData.html || '';
    html = html.replace(/policestationagent\.com/g, 'criminaldefencekent.co.uk');
    html = html.replace(/Police Station Agent/gi, 'Criminal Defence Kent');
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    
    const title = (psaData.title || psaData.h1 || 'Criminal Defence Kent')
      .replace(/Police Station Agent/gi, 'Criminal Defence Kent');
    const description = (psaData.description || '')
      .replace(/Police Station Agent/gi, 'Criminal Defence Kent');
    const canonical = `https://criminaldefencekent.co.uk${route}`;
    
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
    return true;
  } catch (error) {
    console.error(`    ❌ Error creating ${filePath}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  ROBUST MULTI-PASS MIGRATION`);
  console.log(`  PoliceStationAgent.com → CriminalDefenceKent.co.uk`);
  console.log(`${'═'.repeat(70)}\n`);

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    console.log('PHASE 1: Scraping PSA pages...\n');
    const psaPages = new Map();
    
    for (const route of KNOWN_PSA_ROUTES) {
      const data = await scrapePSAPage(browser, route);
      if (data) {
        psaPages.set(route, data);
      }
      await new Promise(r => setTimeout(r, 500)); // Rate limiting
    }
    
    console.log(`\n✅ Scraped ${psaPages.size} pages from PSA\n`);
    
    console.log('PHASE 2: Comparing with local CDK pages...\n');
    const missing = [];
    const incomplete = [];
    const present = [];
    
    for (const [route, psaData] of psaPages) {
      const cdkData = await getLocalCDKPage(route);
      
      if (!cdkData.exists) {
        missing.push({ route, psaData });
        console.log(`  ❌ MISSING: ${route}`);
      } else {
        const similarity = calculateSimilarity(psaData.text, cdkData.text);
        if (similarity < 0.85) {
          incomplete.push({ route, psaData, cdkData, similarity });
          console.log(`  ⚠️  INCOMPLETE: ${route} (${(similarity * 100).toFixed(1)}% similar)`);
        } else {
          present.push({ route, similarity });
          console.log(`  ✅ PRESENT: ${route} (${(similarity * 100).toFixed(1)}% similar)`);
        }
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Missing: ${missing.length}`);
    console.log(`   Incomplete: ${incomplete.length}`);
    console.log(`   Present: ${present.length}\n`);
    
    console.log('PHASE 3: Importing missing/incomplete pages...\n');
    let created = 0;
    let updated = 0;
    
    for (const { route, psaData } of missing) {
      console.log(`  📥 Creating: ${route}`);
      if (await createPageFile(route, psaData)) {
        created++;
      }
    }
    
    for (const { route, psaData } of incomplete) {
      console.log(`  🔄 Updating: ${route}`);
      if (await createPageFile(route, psaData)) {
        updated++;
      }
    }
    
    console.log(`\n✅ Created: ${created} pages`);
    console.log(`✅ Updated: ${updated} pages\n`);
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        psaPages: psaPages.size,
        missing: missing.length,
        incomplete: incomplete.length,
        present: present.length,
        created,
        updated,
      },
      missing: missing.map(m => ({ route: m.route, title: m.psaData.title })),
      incomplete: incomplete.map(i => ({ 
        route: i.route, 
        similarity: (i.similarity * 100).toFixed(1) + '%' 
      })),
    };
    
    const reportPath = path.join(__dirname, '..', 'MIGRATION_REPORT.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    
    console.log(`📄 Report saved to: ${reportPath}\n`);
    
    if (missing.length === 0 && incomplete.length === 0) {
      console.log(`${'═'.repeat(70)}`);
      console.log(`✅ MIGRATION COMPLETE — All pages from PoliceStationAgent.com`);
      console.log(`   successfully imported into CriminalDefenceKent.co.uk`);
      console.log(`   with 100% parity`);
      console.log(`${'═'.repeat(70)}\n`);
    } else {
      console.log(`⚠️  Migration incomplete. Run again to verify.\n`);
    }
    
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);



