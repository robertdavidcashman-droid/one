const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');

const SOURCE_SITE = 'https://policestationagent.com';
const APP_DIR = path.join(__dirname, '..', 'app');

// Known pages from inventory that should exist
const KNOWN_PAGES = [
  '/Fees',
  '/ForClients',
  '/GuidedAssistant',
  '/CaseStatus',
  '/Services',
  '/About',
  '/Contact',
  '/Coverage',
  '/Areas',
  '/CourtRepresentation',
  '/PrivateCrime',
  '/ForSolicitors',
  '/Testimonials',
  '/Blog',
  '/FAQ',
  '/Privacy',
  '/TermsAndConditions',
  '/Cookies',
  '/GDPR',
  '/Accessibility',
  '/Complaints',
  '/CanWeHelp',
  '/OutOfArea',
];

async function scrapePageContent(url) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const content = await page.evaluate(() => {
      const main = document.querySelector('main') || document.querySelector('body');
      return {
        title: document.querySelector('title')?.textContent?.trim() || '',
        h1: document.querySelector('h1')?.textContent?.trim() || '',
        metaDescription: document.querySelector('meta[name="description"]')?.content || '',
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        html: main?.innerHTML || '',
        text: main?.textContent?.replace(/\s+/g, ' ').trim() || '',
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
  // Convert /Fees -> fees, /ForClients -> for-clients
  return pathStr
    .replace(/^\//, '')
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/-+/g, '-');
}

function createNextPage(route, content, sourceUrl) {
  const routeParts = route.split('/').filter(Boolean);
  const dirPath = path.join(APP_DIR, ...routeParts);
  const filePath = path.join(dirPath, 'page.tsx');
  
  const title = content.title || content.h1 || routeParts[routeParts.length - 1] || 'Page';
  const description = content.metaDescription || content.text.substring(0, 160) || '';
  const canonical = `https://criminaldefencekent.co.uk/${route}`;
  
  // Clean HTML - remove script tags and fix links
  let cleanHtml = content.html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/href="\/([^"]+)"/g, (match, p1) => {
      // Convert internal links to Next.js format
      const linkPath = p1.startsWith('/') ? p1 : '/' + p1;
      return `href="${linkPath}"`;
    })
    .replace(/src="\/([^"]+)"/g, 'src="https://policestationagent.com/$1"'); // Keep external images
  
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
          ${content.h1 ? `<h1 className="text-4xl font-bold text-slate-900 mb-6">${content.h1}</h1>` : ''}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: \`${cleanHtml.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }}
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

async function checkIfPageExists(route) {
  const routeParts = route.split('/').filter(Boolean);
  const filePath = path.join(APP_DIR, ...routeParts, 'page.tsx');
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function implementFromInventory() {
  console.log('📋 Implementing pages from inventory...\n');
  
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const pagePath of KNOWN_PAGES) {
    try {
      const route = pathToRoute(pagePath);
      const exists = await checkIfPageExists(route);
      
      if (exists) {
        console.log(`  ⏭️  Skipping ${route} (already exists)`);
        skipped++;
        continue;
      }

      const sourceUrl = `${SOURCE_SITE}${pagePath}`;
      console.log(`  📥 Scraping: ${sourceUrl}`);
      
      const content = await scrapePageContent(sourceUrl);
      
      if (!content.html || content.html.length < 100) {
        console.log(`    ⚠️  No content found, skipping`);
        skipped++;
        continue;
      }

      const { filePath, content: pageContent } = createNextPage(route, content, sourceUrl);
      
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, pageContent, 'utf8');
      
      created++;
      console.log(`    ✅ Created: ${filePath}`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      errors++;
      console.error(`    ❌ Error: ${error.message}`);
    }
  }

  await browser.close();

  console.log(`\n📊 Summary:`);
  console.log(`  ✅ Created: ${created}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ❌ Errors: ${errors}`);
}

if (require.main === module) {
  implementFromInventory().catch(console.error);
}

module.exports = { implementFromInventory };



