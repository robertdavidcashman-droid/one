#!/usr/bin/env node

/**
 * Process "Duty Solicitor Kent" HTML file for what-we-do page
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const APP_DIR = path.join(__dirname, '..', 'app');
const DOWNLOADS_DIR = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads');

function extractMainContent(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Try multiple strategies to find main content
  const selectors = [
    '#root > main',
    '#root main',
    'main',
    '[role="main"]',
    '#root > div > main',
    'body > main',
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent || '';
      if (text.includes('404') || text.includes('Page Not Found')) {
        continue;
      }
      
      const clone = element.cloneNode(true);
      clone.querySelectorAll('script, style, noscript, link[rel="stylesheet"], meta, nav, header, footer, .header, .footer, .nav').forEach(el => el.remove());
      
      const content = clone.innerHTML.trim();
      if (content.length > 500) {
        return content;
      }
    }
  }
  
  // Fallback: find body content
  const body = document.body;
  if (body) {
    const allDivs = Array.from(body.querySelectorAll('div'));
    for (const div of allDivs) {
      const text = div.textContent || '';
      if (text.length > 1000 && !text.includes('404') && !text.includes('Page Not Found')) {
        const clone = div.cloneNode(true);
        clone.querySelectorAll('script, style, noscript, link, meta, nav, header, footer').forEach(el => el.remove());
        const content = clone.innerHTML.trim();
        if (content.length > 500) {
          return content;
        }
      }
    }
  }
  
  return null;
}

function extractMetadata(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const title = document.title || '';
  const metaDesc = document.querySelector('meta[name="description"]');
  const description = metaDesc ? metaDesc.getAttribute('content') || '' : '';
  const canonical = document.querySelector('link[rel="canonical"]');
  const canonicalUrl = canonical ? canonical.getAttribute('href') || '' : '';
  
  return { title, description, canonical: canonicalUrl };
}

function escapeForTemplate(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');
}

async function findFile() {
  try {
    const files = await fs.readdir(DOWNLOADS_DIR);
    const targetFile = files.find(f => 
      f.includes('Duty Solicitor Kent') && 
      f.includes('0333 049 7036') && 
      f.endsWith('.html')
    );
    
    if (targetFile) {
      return path.join(DOWNLOADS_DIR, targetFile);
    }
  } catch (error) {
    console.error('Error reading Downloads directory:', error.message);
  }
  
  return null;
}

async function processFile(filePath) {
  try {
    console.log(`📂 Reading file: ${filePath}`);
    const html = await fs.readFile(filePath, 'utf8');
    
    console.log(`📄 File size: ${(html.length / 1024).toFixed(2)} KB`);
    
    const mainContent = extractMainContent(html);
    const metadata = extractMetadata(html);
    
    if (!mainContent || mainContent.length < 500) {
      console.log(`⚠️  Could not extract sufficient content`);
      console.log(`   Content length: ${mainContent ? mainContent.length : 0} characters`);
      return false;
    }
    
    console.log(`✅ Extracted ${mainContent.length} characters of content`);
    console.log(`📋 Title: ${metadata.title}`);
    
    // Clean up content - replace policestationagent.com with criminaldefencekent.co.uk
    let cleanedContent = mainContent
      .replace(/policestationagent\.com/gi, 'criminaldefencekent.co.uk')
      .replace(/Police Station Agent/gi, 'Criminal Defence Kent');
    
    // Update the page
    const outputPath = path.join(APP_DIR, 'what-we-do', 'page.tsx');
    const existing = await fs.readFile(outputPath, 'utf8');
    const escapedContent = escapeForTemplate(cleanedContent);
    
    // Determine title and description
    const pageTitle = metadata.title 
      ? metadata.title.replace(/Police Station Agent/gi, 'Criminal Defence Kent')
      : 'What We Do | Criminal Defence Kent | Police Station Representation';
    const pageDescription = metadata.description 
      ? metadata.description.replace(/Police Station Agent/gi, 'Criminal Defence Kent')
      : 'Expert police station representation and criminal defence services across Kent. Available 24/7 for arrests, voluntary interviews, and legal advice.';
    const canonical = `https://criminaldefencekent.co.uk/what-we-do`;
    
    // Create new page content
    const pageContent = `import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: ${JSON.stringify(pageTitle)},
  description: ${JSON.stringify(pageDescription)},
  alternates: {
    canonical: ${JSON.stringify(canonical)},
  },
  openGraph: {
    title: ${JSON.stringify(pageTitle)},
    description: ${JSON.stringify(pageDescription)},
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
            <div dangerouslySetInnerHTML={{ __html: \`${escapedContent}\` }} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
`;
    
    await fs.writeFile(outputPath, pageContent, 'utf8');
    console.log(`✅ Updated: /what-we-do`);
    console.log(`\n✅ Successfully populated /what-we-do page!`);
    return true;
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Looking for HTML file...\n');
  
  const filePath = await findFile();
  
  if (!filePath) {
    console.error('❌ Could not find "Duty Solicitor Kent" HTML file in Downloads');
    console.log('   Looking for file containing: "Duty Solicitor Kent" and "0333 049 7036"');
    process.exit(1);
  }
  
  await processFile(filePath);
}

main().catch(console.error);

