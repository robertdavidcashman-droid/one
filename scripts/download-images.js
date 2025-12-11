/**
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
        return reject(new Error(`Failed to download: ${response.statusCode}`));
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
  console.log('📥 Extracting and downloading images...\n');
  
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
      const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (match && match[1].startsWith('http')) {
        imageUrls.add(match[1]);
      }
    });
  }
  
  console.log(`Found ${imageUrls.size} unique images\n`);
  
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
        console.log(`⏭️  Skipped (exists): ${filename}`);
        continue;
      } catch (e) {
        // File doesn't exist, proceed with download
      }
      
      await downloadImage(url, outputPath);
      console.log(`✅ Downloaded: ${filename}`);
      downloaded++;
      
      // Be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed: ${url} - ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Summary: ${downloaded} downloaded, ${failed} failed`);
}

if (require.main === module) {
  extractAndDownloadImages().catch(console.error);
}

module.exports = { extractAndDownloadImages };
