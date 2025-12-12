#!/usr/bin/env node

/**
 * Process "Contact Police Station Agent" HTML file for contact page
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
      f.includes('Contact Police Station Agent') && 
      f.includes('24_7 Legal Advice Kent') && 
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
    const outputPath = path.join(APP_DIR, 'contact', 'page.tsx');
    
    // Check if contact directory exists, if not create it
    const contactDir = path.dirname(outputPath);
    await fs.mkdir(contactDir, { recursive: true });
    
    const escapedContent = escapeForTemplate(cleanedContent);
    
    // Determine title and description
    const pageTitle = metadata.title 
      ? metadata.title.replace(/Police Station Agent/gi, 'Criminal Defence Kent')
      : 'Contact Us | Criminal Defence Kent | 24/7 Legal Advice';
    const pageDescription = metadata.description 
      ? metadata.description.replace(/Police Station Agent/gi, 'Criminal Defence Kent')
      : 'Contact Criminal Defence Kent for 24/7 legal advice. Call 01732 247 427 for free police station representation across Kent.';
    const canonical = `https://criminaldefencekent.co.uk/contact`;
    
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
    console.log(`✅ Updated: /contact`);
    console.log(`\n✅ Successfully populated /contact page!`);
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
    console.error('❌ Could not find "Contact Police Station Agent" HTML file in Downloads');
    console.log('   Looking for file containing: "Contact Police Station Agent" and "24_7 Legal Advice Kent"');
    process.exit(1);
  }
  
  await processFile(filePath);
}

main().catch(console.error);

