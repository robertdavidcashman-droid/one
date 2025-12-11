const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');
const puppeteer = require('puppeteer');

const BASE_URL = 'https://policestationagent.com';
const APP_DIR = path.join(__dirname, '..', 'app');

async function scrapePage(urlPath) {
    const fullUrl = `${BASE_URL}${urlPath}`;
    console.log(`📥 Scraping: ${fullUrl}...`);
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto(fullUrl, { waitUntil: 'networkidle0', timeout: 60000 });
        const htmlContent = await page.content();
        await browser.close();

        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;

        // Extract main content from the main element
        const mainContentElement = document.querySelector('main');
        let extractedHtml = mainContentElement ? mainContentElement.innerHTML : '';

        if (!extractedHtml || extractedHtml.includes('404') || extractedHtml.includes('not found')) {
            console.warn(`⚠️ Scraped content for ${urlPath} appears to be 404 or empty.`);
            return null;
        }

        // Clean up script tags and comments
        extractedHtml = extractedHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        extractedHtml = extractedHtml.replace(/<!--[\s\S]*?-->/g, '');

        return extractedHtml;

    } catch (error) {
        console.error(`Error scraping ${fullUrl}:`, error);
        await browser.close();
        return null;
    }
}

async function updatePage(route, htmlContent, title, description) {
    const pageDirPath = path.join(APP_DIR, route);
    const pageFilePath = path.join(pageDirPath, 'page.tsx');
    const pageName = route.split('/').pop() || 'index';
    const componentName = pageName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');

    const pageContent = `import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "${title}",
  description: "${description}",
  alternates: {
    canonical: "${BASE_URL}${route}",
  },
  openGraph: {
    title: "${title}",
    description: "${description}",
    type: 'website',
    url: "${BASE_URL}${route}",
  },
};

export default function ${componentName}Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen">
          <div 
            className="prose prose-lg max-w-6xl mx-auto px-4 py-16"
            dangerouslySetInnerHTML={{ __html: \`${htmlContent.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
`;

    await fs.mkdir(pageDirPath, { recursive: true });
    await fs.writeFile(pageFilePath, pageContent.trim(), 'utf8');
    console.log(`✅ Updated: ${route}`);
}

async function main() {
    console.log('🔍 Scraping and populating pages...\n');

    // Scrape What We Do
    const whatWeDoContent = await scrapePage('/what-we-do');
    if (whatWeDoContent) {
        await updatePage(
            'what-we-do',
            whatWeDoContent,
            'What We Do | Police Station Agent',
            'Expert police station representation services across Kent. Learn about our comprehensive legal services and how we can help you.'
        );
    } else {
        console.error('❌ Failed to scrape /what-we-do');
    }

    // Scrape Why Use Us
    const whyUseUsContent = await scrapePage('/why-use-us');
    if (whyUseUsContent) {
        await updatePage(
            'why-use-us',
            whyUseUsContent,
            'Why Use Us | Police Station Agent',
            'Discover why Police Station Agent is the trusted choice for police station representation across Kent. Expert solicitors available 24/7.'
        );
    } else {
        console.error('❌ Failed to scrape /why-use-us');
    }

    console.log('\n✅ Scraping complete!');
}

main().catch(console.error);

