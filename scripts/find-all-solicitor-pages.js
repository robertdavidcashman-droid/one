#!/usr/bin/env node

/**
 * Find all solicitor-related pages on policestationagent.com
 * by crawling the sitemap and checking for solicitor pages
 */

const puppeteer = require('puppeteer');

const PSA_URL = 'https://policestationagent.com';

async function findSolicitorPages() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Try to get sitemap
    console.log('🔍 Checking sitemap...');
    try {
      await page.goto(`${PSA_URL}/sitemap.xml`, { waitUntil: 'networkidle0', timeout: 10000 });
      const sitemapContent = await page.content();
      
      // Extract URLs from sitemap
      const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
      if (urlMatches) {
        const urls = urlMatches.map(m => m.replace(/<\/?loc>/g, ''));
        const solicitorUrls = urls.filter(url => 
          url.includes('solicitor') || 
          url.includes('bromley') || 
          url.includes('dartford')
        );
        
        console.log(`\n📋 Found ${solicitorUrls.length} solicitor-related URLs in sitemap:`);
        solicitorUrls.forEach(url => console.log(`  - ${url}`));
      }
    } catch (error) {
      console.log('⚠️  Could not access sitemap, trying homepage links...');
    }
    
    // Check homepage for links
    console.log('\n🔍 Checking homepage for solicitor links...');
    await page.goto(PSA_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    
    const links = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a[href]'));
      return allLinks
        .map(a => {
          const href = a.getAttribute('href');
          if (!href) return null;
          // Convert relative to absolute
          if (href.startsWith('/')) {
            return `https://policestationagent.com${href}`;
          }
          if (href.startsWith('http') && href.includes('policestationagent.com')) {
            return href;
          }
          return null;
        })
        .filter(Boolean)
        .filter(url => 
          url.includes('solicitor') || 
          url.includes('bromley') || 
          url.includes('dartford') ||
          url.includes('police-station-agent')
        );
    });
    
    const uniqueLinks = [...new Set(links)];
    console.log(`\n📋 Found ${uniqueLinks.length} solicitor-related links on homepage:`);
    uniqueLinks.forEach(link => console.log(`  - ${link}`));
    
    // Check if these pages exist
    console.log('\n🔍 Verifying which pages exist...');
    const existingPages = [];
    
    for (const link of uniqueLinks.slice(0, 20)) { // Limit to first 20
      const route = link.replace('https://policestationagent.com', '');
      if (route === '' || route === '/') continue;
      
      try {
        const testPage = await browser.newPage();
        await testPage.goto(link, { waitUntil: 'networkidle0', timeout: 10000 });
        const title = await testPage.title();
        const hasContent = await testPage.evaluate(() => {
          const main = document.querySelector('main');
          return main && main.textContent.length > 200;
        });
        
        if (hasContent && !title.includes('404')) {
          existingPages.push({ route, title, url: link });
          console.log(`  ✅ ${route} - ${title.substring(0, 60)}...`);
        } else {
          console.log(`  ❌ ${route} - Not found or empty`);
        }
        
        await testPage.close();
        await new Promise(r => setTimeout(r, 500));
      } catch (error) {
        console.log(`  ❌ ${route} - Error: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Found ${existingPages.length} existing solicitor pages`);
    
    await page.close();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

findSolicitorPages().catch(console.error);

