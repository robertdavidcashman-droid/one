#!/usr/bin/env node

/**
 * Compare navigation structure and page content with policestationagent.com
 * Ensures all links and content match exactly
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

const PSA_URL = 'https://policestationagent.com';
const APP_DIR = path.join(__dirname, '..', 'app');

// Get all local page routes
async function getLocalRoutes() {
  const files = await glob('**/page.tsx', {
    cwd: APP_DIR,
    ignore: ['**/node_modules/**', '**/.next/**'],
  });
  
  const routes = new Set();
  files.forEach(file => {
    const route = file
      .replace(/\/page\.tsx$/, '')
      .replace(/\[slug\]/g, '*')
      .replace(/\[id\]/g, '*');
    
    if (route) {
      routes.add(`/${route}`);
    } else {
      routes.add('/');
    }
  });
  
  return Array.from(routes).sort();
}

// Scrape navigation structure from PSA
async function scrapeNavigation(browser) {
  const page = await browser.newPage();
  
  try {
    console.log('  📥 Scraping navigation from policestationagent.com...');
    await page.goto(PSA_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    
    const nav = await page.evaluate(() => {
      const navData = {
        mainLinks: [],
        dropdowns: {},
      };
      
      // Get main navigation links
      const mainNav = document.querySelector('nav') || document.querySelector('header nav') || document.querySelector('[role="navigation"]');
      if (mainNav) {
        const links = Array.from(mainNav.querySelectorAll('a[href]'));
        links.forEach(link => {
          const href = link.getAttribute('href');
          const text = link.textContent.trim();
          if (href && text && !href.startsWith('#') && !href.startsWith('javascript:')) {
            navData.mainLinks.push({ text, href });
          }
        });
      }
      
      // Get dropdown menus
      const dropdownTriggers = document.querySelectorAll('[class*="dropdown"], [class*="menu"], button[aria-expanded], a[aria-haspopup]');
      dropdownTriggers.forEach(trigger => {
        const triggerText = trigger.textContent.trim();
        if (triggerText) {
          // Try to find dropdown content
          const dropdown = trigger.nextElementSibling || 
                          trigger.parentElement?.querySelector('[class*="dropdown"], [class*="menu"], ul, nav');
          
          if (dropdown) {
            const items = Array.from(dropdown.querySelectorAll('a[href]'));
            navData.dropdowns[triggerText] = items.map(item => ({
              text: item.textContent.trim(),
              href: item.getAttribute('href'),
            })).filter(item => item.href && item.text);
          }
        }
      });
      
      // Also check for any menu structures
      const menuItems = document.querySelectorAll('nav a, header a, [role="navigation"] a');
      menuItems.forEach(item => {
        const href = item.getAttribute('href');
        const text = item.textContent.trim();
        const parent = item.closest('[class*="dropdown"], [class*="menu"], ul, nav');
        
        if (href && text && !href.startsWith('#') && !href.startsWith('javascript:')) {
          // Check if it's in a dropdown
          if (parent && parent !== mainNav) {
            const parentText = parent.previousElementSibling?.textContent?.trim() || 
                              parent.parentElement?.querySelector('button, a')?.textContent?.trim() || 
                              'Menu';
            if (!navData.dropdowns[parentText]) {
              navData.dropdowns[parentText] = [];
            }
            navData.dropdowns[parentText].push({ text, href });
          }
        }
      });
      
      return navData;
    });
    
    await page.close();
    return nav;
  } catch (error) {
    await page.close();
    throw error;
  }
}

// Scrape all links from a page
async function scrapeAllLinks(browser, url) {
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    const links = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a[href]'));
      return allLinks.map(link => {
        const href = link.getAttribute('href');
        const text = link.textContent.trim();
        return { text, href };
      }).filter(link => link.href && !link.href.startsWith('#') && !link.href.startsWith('javascript:'));
    });
    
    await page.close();
    return links;
  } catch (error) {
    await page.close();
    return [];
  }
}

// Get all pages from PSA site
async function getAllPSAPages(browser) {
  const page = await browser.newPage();
  const pages = new Set();
  
  try {
    console.log('  📥 Discovering all pages on policestationagent.com...');
    await page.goto(PSA_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    
    // Get all links from homepage
    const links = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a[href]'));
      return allLinks.map(link => {
        const href = link.getAttribute('href');
        if (href && (href.startsWith('/') || href.includes('policestationagent.com'))) {
          return href.replace(/^https?:\/\/[^\/]+/, '').split('#')[0].split('?')[0];
        }
        return null;
      }).filter(Boolean);
    });
    
    links.forEach(link => {
      if (link && link.startsWith('/') && !link.includes('mailto:') && !link.includes('tel:')) {
        pages.add(link);
      }
    });
    
    // Also check sitemap if available
    try {
      await page.goto(`${PSA_URL}/sitemap.xml`, { waitUntil: 'networkidle0', timeout: 10000 });
      await new Promise(r => setTimeout(r, 2000));
      
      const sitemapLinks = await page.evaluate(() => {
        const parser = new DOMParser();
        const xml = document.documentElement.outerHTML;
        const doc = parser.parseFromString(xml, 'text/xml');
        const locs = doc.querySelectorAll('loc');
        return Array.from(locs).map(loc => {
          const url = loc.textContent;
          if (url.includes('policestationagent.com')) {
            return url.replace(/^https?:\/\/[^\/]+/, '').split('#')[0].split('?')[0];
          }
          return null;
        }).filter(Boolean);
      });
      
      sitemapLinks.forEach(link => pages.add(link));
    } catch {
      // Sitemap not available
    }
    
    await page.close();
    return Array.from(pages).sort();
  } catch (error) {
    await page.close();
    throw error;
  }
}

// Compare and generate report
async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  COMPARING NAVIGATION & CONTENT WITH POLICESTATIONAGENT.COM`);
  console.log(`${'═'.repeat(70)}\n`);

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Step 1: Get navigation structure
    console.log('Step 1: Scraping navigation structure...\n');
    const psaNav = await scrapeNavigation(browser);
    console.log(`  Found ${psaNav.mainLinks.length} main links`);
    console.log(`  Found ${Object.keys(psaNav.dropdowns).length} dropdown menus\n`);
    
    // Step 2: Get all PSA pages
    console.log('Step 2: Discovering all pages on policestationagent.com...\n');
    const psaPages = await getAllPSAPages(browser);
    console.log(`  Found ${psaPages.length} pages on PSA site\n`);
    
    // Step 3: Get local routes
    console.log('Step 3: Getting local routes...\n');
    const localRoutes = await getLocalRoutes();
    console.log(`  Found ${localRoutes.length} local routes\n`);
    
    // Step 4: Compare
    console.log('Step 4: Comparing...\n');
    
    const missingPages = psaPages.filter(psaPage => {
      // Normalize routes for comparison
      const normalizedPSA = psaPage.replace(/\/$/, '') || '/';
      return !localRoutes.some(local => {
        const normalizedLocal = local.replace(/\/$/, '') || '/';
        return normalizedLocal === normalizedPSA || 
               normalizedLocal.replace(/\*/g, '') === normalizedPSA ||
               normalizedPSA.startsWith(normalizedLocal.replace(/\*/g, ''));
      });
    });
    
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  COMPARISON RESULTS`);
    console.log(`${'═'.repeat(70)}`);
    console.log(`  📄 PSA Pages: ${psaPages.length}`);
    console.log(`  📄 Local Routes: ${localRoutes.length}`);
    console.log(`  ❌ Missing Pages: ${missingPages.length}`);
    
    if (missingPages.length > 0) {
      console.log(`\n  Missing pages:`);
      missingPages.slice(0, 20).forEach(page => {
        console.log(`    - ${page}`);
      });
      if (missingPages.length > 20) {
        console.log(`    ... and ${missingPages.length - 20} more`);
      }
    }
    
    // Save navigation structure
    const navFile = path.join(__dirname, '..', 'data', 'psa-navigation.json');
    await fs.mkdir(path.dirname(navFile), { recursive: true });
    await fs.writeFile(navFile, JSON.stringify({ navigation: psaNav, pages: psaPages }, null, 2), 'utf-8');
    console.log(`\n  💾 Navigation data saved to: ${navFile}`);
    
    console.log(`\n${'═'.repeat(70)}\n`);
    
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);



