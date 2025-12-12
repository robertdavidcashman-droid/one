const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');

const REPORT_PATH = path.join(__dirname, '..', 'CONTENT_PARITY_REPORT.json');
const APP_DIR = path.join(__dirname, '..', 'app');

async function scrapePageContent(url) {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const content = await page.evaluate(() => {
      // Extract main content
      const main = document.querySelector('main') || document.body;
      return {
        title: document.querySelector('title')?.textContent?.trim() || '',
        h1: document.querySelector('h1')?.textContent?.trim() || '',
        metaDescription: document.querySelector('meta[name="description"]')?.content || '',
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        html: main.innerHTML,
        text: main.textContent?.replace(/\s+/g, ' ').trim() || '',
      };
    });
    
    await browser.close();
    return content;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

function pathToRoute(pathStr) {
  return pathStr.replace(/^\//, '').replace(/\/$/, '') || 'page';
}

function createNextPage(route, content, sourceUrl) {
  const routeParts = route.split('/').filter(Boolean);
  const fileName = routeParts.length > 0 ? routeParts[routeParts.length - 1] : 'page';
  const dirPath = path.join(APP_DIR, ...routeParts.slice(0, -1));
  const filePath = path.join(APP_DIR, ...routeParts, 'page.tsx');
  
  // Extract structured content
  const title = content.title || content.h1 || fileName;
  const description = content.metaDescription || content.text.substring(0, 160);
  const canonical = `https://criminaldefencekent.co.uk/${route}`;
  
  const pageContent = `import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "${title.replace(/"/g, '\\"')} | Criminal Defence Kent",
  description: "${description.replace(/"/g, '\\"')}",
  alternates: {
    canonical: "${canonical}",
  },
  openGraph: {
    title: "${title.replace(/"/g, '\\"')} | Criminal Defence Kent",
    description: "${description.replace(/"/g, '\\"')}",
    url: "${canonical}",
    siteName: 'Criminal Defence Kent',
    type: 'website',
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">${content.h1 || title}</h1>
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: \`${content.html.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
`;

  return { filePath, content: pageContent };
}

async function implementMissingPages() {
  console.log('📋 Reading content parity report...');
  
  let report;
  try {
    const reportData = await fs.readFile(REPORT_PATH, 'utf8');
    report = JSON.parse(reportData);
  } catch (error) {
    console.error('❌ Could not read report. Run deep-crawl-parity.js first.');
    return;
  }

  console.log(`\n📊 Report Summary:`);
  console.log(`  Source pages: ${report.summary.sourcePages}`);
  console.log(`  Target pages: ${report.summary.targetPages}`);
  console.log(`  Missing pages: ${report.summary.missing}`);
  console.log(`  Parity issues: ${report.summary.parityIssues}\n`);

  // Find missing pages
  const missingPages = report.routeMatrix.filter(m => m.targetUrl === 'MISSING');
  
  if (missingPages.length === 0) {
    console.log('✅ No missing pages found!');
    return;
  }

  console.log(`\n🔨 Implementing ${missingPages.length} missing pages...\n`);

  const browser = await puppeteer.launch({ headless: true });
  let created = 0;
  let errors = 0;

  for (const missing of missingPages.slice(0, 20)) { // Limit to 20 for now
    try {
      console.log(`  Creating: ${missing.sourcePath}`);
      
      // Scrape source page
      const sourceContent = await scrapePageContent(missing.sourceUrl);
      
      // Create Next.js page
      const route = pathToRoute(missing.sourcePath);
      const { filePath, content } = createNextPage(route, sourceContent, missing.sourceUrl);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      
      // Write file
      await fs.writeFile(filePath, content, 'utf8');
      
      created++;
      console.log(`    ✅ Created: ${filePath}`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      errors++;
      console.error(`    ❌ Error creating ${missing.sourcePath}:`, error.message);
    }
  }

  await browser.close();

  console.log(`\n✅ Created ${created} pages`);
  if (errors > 0) {
    console.log(`⚠️  ${errors} errors`);
  }
}

if (require.main === module) {
  implementMissingPages().catch(console.error);
}

module.exports = { implementMissingPages, scrapePageContent, createNextPage };

