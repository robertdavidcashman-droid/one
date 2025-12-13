#!/usr/bin/env node

/**
 * Update navigation menu to match policestationagent.com exactly
 * Scrape and update all page content to match
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const PSA_URL = 'https://policestationagent.com';
const HEADER_FILE = path.join(__dirname, '..', 'components', 'Header.tsx');

// Scrape exact navigation structure
async function scrapeExactNavigation(browser) {
  const page = await browser.newPage();
  
  try {
    console.log('  📥 Scraping exact navigation structure...');
    await page.goto(PSA_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    
    const nav = await page.evaluate(() => {
      const navStructure = {
        mainMenu: [],
        dropdowns: {},
      };
      
      // Find the main navigation
      const header = document.querySelector('header') || document.querySelector('[role="banner"]');
      if (!header) return navStructure;
      
      // Get all top-level nav items
      const navItems = header.querySelectorAll('nav > * > a, nav > a, header > nav > * > a');
      navItems.forEach(item => {
        const text = item.textContent.trim();
        const href = item.getAttribute('href');
        if (text && href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          navStructure.mainMenu.push({ text, href });
        }
      });
      
      // Find dropdown menus - look for buttons/links with dropdowns
      const allLinks = header.querySelectorAll('a, button');
      allLinks.forEach(link => {
        const text = link.textContent.trim();
        if (!text) return;
        
        // Check if this has a dropdown
        const parent = link.parentElement;
        const dropdown = parent?.querySelector('ul, [class*="dropdown"], [class*="menu"]');
        
        if (dropdown) {
          const items = Array.from(dropdown.querySelectorAll('a[href]'));
          navStructure.dropdowns[text] = items.map(item => ({
            text: item.textContent.trim(),
            href: item.getAttribute('href'),
          })).filter(item => item.href && item.text);
        }
      });
      
      // Also check for any menu structures in the DOM
      const menus = header.querySelectorAll('[class*="menu"], [class*="dropdown"], nav ul');
      menus.forEach(menu => {
        const trigger = menu.previousElementSibling || menu.parentElement?.querySelector('button, a');
        if (trigger) {
          const triggerText = trigger.textContent.trim();
          if (triggerText) {
            const items = Array.from(menu.querySelectorAll('a[href]'));
            if (items.length > 0) {
              navStructure.dropdowns[triggerText] = items.map(item => ({
                text: item.textContent.trim(),
                href: item.getAttribute('href'),
              })).filter(item => item.href && item.text);
            }
          }
        }
      });
      
      return navStructure;
    });
    
    await page.close();
    return nav;
  } catch (error) {
    await page.close();
    throw error;
  }
}

// Get all public pages (exclude admin, API, etc.)
async function getPublicPSAPages(browser) {
  const page = await browser.newPage();
  const pages = new Set();
  
  try {
    console.log('  📥 Discovering all public pages...');
    
    // Start from homepage
    await page.goto(PSA_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    
    // Get all links
    const links = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a[href]'));
      return allLinks.map(link => {
        const href = link.getAttribute('href');
        if (href && (href.startsWith('/') || href.includes('policestationagent.com'))) {
          let path = href.replace(/^https?:\/\/[^\/]+/, '').split('#')[0].split('?')[0];
          // Normalize
          path = path.replace(/\/$/, '') || '/';
          // Exclude admin, API, etc.
          if (!path.includes('/Admin') && 
              !path.includes('/admin') && 
              !path.includes('/api') &&
              !path.includes('/Api') &&
              !path.startsWith('mailto:') &&
              !path.startsWith('tel:')) {
            return path;
          }
        }
        return null;
      }).filter(Boolean);
    });
    
    links.forEach(link => pages.add(link));
    
    // Also check sitemap
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
            let path = url.replace(/^https?:\/\/[^\/]+/, '').split('#')[0].split('?')[0];
            path = path.replace(/\/$/, '') || '/';
            if (!path.includes('/Admin') && !path.includes('/admin') && !path.includes('/api')) {
              return path;
            }
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

// Scrape page content
async function scrapePageContent(browser, route) {
  const page = await browser.newPage();
  
  try {
    const url = route.startsWith('http') ? route : `${PSA_URL}${route}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    
    const data = await page.evaluate(() => {
      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]');
      const description = metaDesc ? metaDesc.getAttribute('content') || '' : '';
      
      // Get main content
      const main = document.querySelector('main') || 
                   document.querySelector('article') ||
                   document.querySelector('#content') ||
                   document.querySelector('.content') ||
                   document.body;
      
      let html = '';
      if (main) {
        const clone = main.cloneNode(true);
        clone.querySelectorAll('script, style, noscript, nav, header, footer, .header, .footer, .nav, .cookie-banner, [class*="cookie"], [id*="cookie"]').forEach(el => el.remove());
        html = clone.innerHTML;
      }
      
      return { title, description, html };
    });
    
    await page.close();
    
    if (!data.html || data.html.length < 200 || data.html.includes('404')) {
      return null;
    }
    
    return data;
  } catch (error) {
    await page.close();
    return null;
  }
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  UPDATING NAVIGATION & CONTENT TO MATCH POLICESTATIONAGENT.COM`);
  console.log(`${'═'.repeat(70)}\n`);

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Step 1: Scrape navigation
    console.log('Step 1: Scraping navigation structure...\n');
    const psaNav = await scrapeExactNavigation(browser);
    console.log(`  Main menu items: ${psaNav.mainMenu.length}`);
    console.log(`  Dropdown menus: ${Object.keys(psaNav.dropdowns).length}\n`);
    
    // Save navigation data
    const navFile = path.join(__dirname, '..', 'data', 'psa-navigation-detailed.json');
    await fs.mkdir(path.dirname(navFile), { recursive: true });
    await fs.writeFile(navFile, JSON.stringify(psaNav, null, 2), 'utf-8');
    console.log(`  💾 Navigation saved to: ${navFile}\n`);
    
    // Step 2: Get public pages
    console.log('Step 2: Discovering public pages...\n');
    const psaPages = await getPublicPSAPages(browser);
    console.log(`  Found ${psaPages.length} public pages\n`);
    
    // Save pages list
    const pagesFile = path.join(__dirname, '..', 'data', 'psa-public-pages.json');
    await fs.writeFile(pagesFile, JSON.stringify(psaPages, null, 2), 'utf-8');
    console.log(`  💾 Pages list saved to: ${pagesFile}\n`);
    
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  SUMMARY`);
    console.log(`${'═'.repeat(70)}`);
    console.log(`  ✅ Navigation structure scraped`);
    console.log(`  ✅ ${psaPages.length} public pages discovered`);
    console.log(`\n  Next steps:`);
    console.log(`  1. Review navigation data in: ${navFile}`);
    console.log(`  2. Update Header.tsx to match navigation structure`);
    console.log(`  3. Scrape missing pages using the pages list`);
    console.log(`${'═'.repeat(70)}\n`);
    
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);



