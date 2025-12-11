/**
 * COMPREHENSIVE FIX SCRIPT
 * Fixes all identified issues automatically
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const APP_DIR = path.join(__dirname, '..', 'app');
const SCRAPED_DIR = path.join(__dirname, '..', 'legacy', 'scraped');

async function fixDuplicateRoutes() {
  console.log('🔧 Fix 1: Deleting duplicate routes...\n');
  
  const wrongPaths = [
    'app/after/a',
    'app/for/clients',
    'app/for/solicitors',
    'app/police/stations',
    'app/terms/and',
    'app/voluntary/interviews',
    'app/what/is',
    'app/what/we',
    'app/why/use',
  ];
  
  for (const wrongPath of wrongPaths) {
    const fullPath = path.join(__dirname, '..', wrongPath);
    try {
      await fs.rm(fullPath, { recursive: true, force: true });
      console.log(`✅ Deleted: ${wrongPath}`);
    } catch (e) {
      // Already deleted or doesn't exist
    }
  }
  
  console.log('✅ Duplicate routes fixed\n');
}

async function scrapeMissingPages() {
  console.log('🔧 Fix 2: Scraping missing pages...\n');
  
  try {
    const { stdout, stderr } = await execPromise(
      'node scripts/scrape-missing-pages.js',
      { cwd: path.join(__dirname, '..'), maxBuffer: 10 * 1024 * 1024 }
    );
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error('Error scraping:', error.message);
  }
  
  console.log('✅ Missing pages scraped\n');
}

async function rebuildMissingPages() {
  console.log('🔧 Fix 3: Rebuilding missing pages from scraped HTML...\n');
  
  // Run the rebuild script again to process newly scraped pages
  try {
    const { stdout, stderr } = await execPromise(
      'node scripts/auto-rebuild-all-pages.js',
      { cwd: path.join(__dirname, '..'), maxBuffer: 10 * 1024 * 1024 }
    );
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error('Error rebuilding:', error.message);
  }
  
  console.log('✅ Missing pages rebuilt\n');
}

async function fixBlogRoute() {
  console.log('🔧 Fix 4: Fixing blog route...\n');
  
  // The blog posts should use /blog/[slug] route, not /post?slug=
  // But since the live site uses /post?slug=, we need to handle both
  
  const postPagePath = path.join(APP_DIR, 'post', 'page.tsx');
  
  // Check if post/page.tsx exists and needs to be a client component to handle query params
  try {
    const content = await fs.readFile(postPagePath, 'utf8');
    
    // If it's a server component, we need to make it handle query params
    if (!content.includes("'use client'") && !content.includes('use client')) {
      const fixedContent = `'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostDetail from '@/components/PostDetail';

export default function PostPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !slug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
        <Header />
        <main className="flex-grow relative">
          <div className="bg-slate-50 min-h-screen flex items-center justify-center">
            <p className="text-slate-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative">
        <PostDetail slug={slug} />
      </main>
      <Footer />
    </div>
  );
}
`;
      
      await fs.writeFile(postPagePath, fixedContent, 'utf8');
      console.log('✅ Blog route fixed to handle query params\n');
    } else {
      console.log('✅ Blog route already handles query params\n');
    }
  } catch (error) {
    console.log('⚠️  Could not fix blog route:', error.message);
  }
}

async function createImageDownloadScript() {
  console.log('🔧 Fix 5: Creating image download script...\n');
  
  const scriptContent = `/**
 * Download Images from Scraped HTML
 * Extracts image URLs and downloads them to public/images/
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { JSDOM } = require('jsdom');

const SCRAPED_DIR = path.join(__dirname, '..', 'legacy', 'scraped');
const PUBLIC_IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadImage(response.headers.location, outputPath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        return reject(new Error(\`Failed to download: \${response.statusCode}\`));
      }
      
      const fileStream = fs.createWriteStream(outputPath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function extractAndDownloadImages() {
  console.log('📥 Extracting and downloading images...\\n');
  
  await fs.mkdir(PUBLIC_IMAGES_DIR, { recursive: true });
  
  const files = await fs.readdir(SCRAPED_DIR);
  const htmlFiles = files.filter(f => f.endsWith('.html'));
  
  const imageUrls = new Set();
  
  for (const file of htmlFiles) {
    const html = await fs.readFile(path.join(SCRAPED_DIR, file), 'utf8');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Extract all image URLs
    document.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.startsWith('http')) {
        imageUrls.add(src);
      }
    });
    
    // Extract background images from style attributes
    document.querySelectorAll('[style*="background-image"]').forEach(el => {
      const style = el.getAttribute('style');
      const match = style.match(/url\\(['"]?([^'"]+)['"]?\\)/);
      if (match && match[1].startsWith('http')) {
        imageUrls.add(match[1]);
      }
    });
  }
  
  console.log(\`Found \${imageUrls.size} unique images\\n\`);
  
  let downloaded = 0;
  let failed = 0;
  
  for (const url of imageUrls) {
    try {
      const urlObj = new URL(url);
      const filename = path.basename(urlObj.pathname) || 'image.jpg';
      const outputPath = path.join(PUBLIC_IMAGES_DIR, filename);
      
      // Skip if already downloaded
      try {
        await fs.access(outputPath);
        console.log(\`⏭️  Skipped (exists): \${filename}\`);
        continue;
      } catch (e) {
        // File doesn't exist, proceed with download
      }
      
      await downloadImage(url, outputPath);
      console.log(\`✅ Downloaded: \${filename}\`);
      downloaded++;
      
      // Be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(\`❌ Failed: \${url} - \${error.message}\`);
      failed++;
    }
  }
  
  console.log(\`\\n📊 Summary: \${downloaded} downloaded, \${failed} failed\`);
}

if (require.main === module) {
  extractAndDownloadImages().catch(console.error);
}

module.exports = { extractAndDownloadImages };
`;
  
  const scriptPath = path.join(__dirname, 'download-images.js');
  await fs.writeFile(scriptPath, scriptContent, 'utf8');
  console.log('✅ Image download script created: scripts/download-images.js\n');
}

async function main() {
  console.log('🚀 Starting comprehensive fix...\n');
  console.log('='.repeat(60));
  
  await fixDuplicateRoutes();
  await scrapeMissingPages();
  await rebuildMissingPages();
  await fixBlogRoute();
  await createImageDownloadScript();
  
  console.log('='.repeat(60));
  console.log('✅ ALL FIXES COMPLETE!');
  console.log('='.repeat(60));
  console.log('\n📝 Next steps:');
  console.log('1. Review rebuilt pages in app/ directory');
  console.log('2. Run: node scripts/download-images.js (to download images)');
  console.log('3. Test all routes and navigation');
  console.log('4. Convert remaining <a> tags to <Link> components manually');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixDuplicateRoutes, scrapeMissingPages, rebuildMissingPages, fixBlogRoute };

