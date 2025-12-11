/**
 * Process "Xmas Hours" HTML File
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const APP_DIR = path.join(__dirname, '..', 'app');

function extractMainContent(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
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
      clone.querySelectorAll('script, style, noscript, link[rel="stylesheet"], meta').forEach(el => el.remove());
      
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
        clone.querySelectorAll('script, style, noscript, link, meta').forEach(el => el.remove());
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
  
  return {
    title: document.querySelector('title')?.textContent?.trim() || 'Christmas Hours | Police Station Agent',
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
  };
}

function escapeForTemplate(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

async function processFile(filePath, route) {
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
    
    // Determine route - xmas hours might be a new page or part of contact/about
    // For now, we'll need to determine the route or create a new page
    // Let's check if there's a route in the metadata
    const canonical = metadata.canonical || '';
    let targetRoute = route;
    
    if (canonical) {
      try {
        const url = new URL(canonical);
        targetRoute = url.pathname;
      } catch (e) {
        // Use provided route
      }
    }
    
    // If no route provided, try to infer from title
    if (!targetRoute) {
      const title = metadata.title.toLowerCase();
      if (title.includes('contact')) {
        targetRoute = '/contact';
      } else if (title.includes('about')) {
        targetRoute = '/about';
      } else {
        // Create a new page for xmas hours
        targetRoute = '/christmas-hours';
      }
    }
    
    // Update the page
    const routePath = targetRoute === '/' ? 'page.tsx' : targetRoute.replace(/^\//, '').replace(/\//g, '\\') + '\\page.tsx';
    const outputPath = path.join(APP_DIR, routePath);
    
    // Check if page exists, if not create it
    let existing;
    try {
      existing = await fs.readFile(outputPath, 'utf8');
    } catch (e) {
      // Page doesn't exist, create it
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });
      
      existing = `import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ${JSON.stringify(metadata.title)},
  description: ${JSON.stringify(metadata.description || '')},
  alternates: {
    canonical: ${JSON.stringify(metadata.canonical || `https://policestationagent.com${targetRoute}`)},
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
            dangerouslySetInnerHTML={{ __html: \`\` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
`;
    }
    
    const escapedContent = escapeForTemplate(mainContent);
    const finalCanonical = metadata.canonical || `https://policestationagent.com${targetRoute}`;
    
    // Update metadata
    let updated = existing.replace(
      /title:\s*["'][^"']*["']/,
      `title: ${JSON.stringify(metadata.title)}`
    );
    
    if (metadata.description) {
      updated = updated.replace(
        /description:\s*["'][^"']*["']/,
        `description: ${JSON.stringify(metadata.description)}`
      );
    }
    
    updated = updated.replace(
      /canonical:\s*["'][^"']*["']/,
      `canonical: ${JSON.stringify(finalCanonical)}`
    );
    
    // Update content
    updated = updated.replace(
      /dangerouslySetInnerHTML=\{\{ __html: `[^`]*` \}\}/s,
      `dangerouslySetInnerHTML={{ __html: \`${escapedContent}\` }}`
    );
    
    await fs.writeFile(outputPath, updated, 'utf8');
    console.log(`✅ Updated: ${targetRoute}`);
    return { success: true, route: targetRoute };
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return { success: false, route: null };
  }
}

async function main() {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const downloadsDir = path.join(homeDir, 'Downloads');
  
  // Try to find the file
  let filePath = null;
  
  try {
    const files = await fs.readdir(downloadsDir);
    const matchingFile = files.find(file => {
      const lower = file.toLowerCase();
      return (lower.includes('xmas') || lower.includes('christmas')) && 
             (lower.includes('hours') || lower.includes('time')) && 
             file.endsWith('.html');
    });
    
    if (matchingFile) {
      filePath = path.join(downloadsDir, matchingFile);
      console.log(`✅ Found file: ${matchingFile}`);
    }
  } catch (error) {
    console.log(`⚠️  Could not read Downloads folder: ${error.message}`);
  }
  
  if (!filePath) {
    console.log('📝 Process "Xmas Hours" HTML\n');
    console.log('❌ File not found in Downloads folder.');
    console.log('\n💡 Please provide the full path:');
    console.log('   node scripts/process-xmas-hours.js "path/to/file.html"');
    process.exit(1);
  }
  
  const result = await processFile(filePath);
  
  if (result.success) {
    console.log(`\n✅ Successfully updated ${result.route} page!`);
  } else {
    console.log('\n❌ Could not process file.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processFile, extractMainContent };



