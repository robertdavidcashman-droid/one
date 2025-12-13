#!/usr/bin/env node

/**
 * Complete verification: Ensure all pages, links, and menus match policestationagent.com exactly
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const crypto = require('crypto');

const PSA_URL = 'https://policestationagent.com';
const APP_DIR = path.join(__dirname, '..', 'app');

// Get all local page files
async function getLocalPages() {
  const files = await glob('**/page.tsx', {
    cwd: APP_DIR,
    ignore: ['**/node_modules/**', '**/.next/**', '**/admin/**', '**/api/**', '**/criminaldefencekent/**'],
  });
  
  const pages = new Map();
  files.forEach(file => {
    const route = file
      .replace(/\/page\.tsx$/, '')
      .replace(/\[slug\]/g, '*')
      .replace(/\[id\]/g, '*');
    
    const normalizedRoute = route ? `/${route}` : '/';
    pages.set(normalizedRoute, path.join(APP_DIR, file));
  });
  
  return pages;
}

// Get content hash for comparison
function getContentHash(content) {
  // Remove dynamic elements that might differ
  const cleaned = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return crypto.createHash('sha256').update(cleaned).digest('hex').substring(0, 16);
}

// Scrape page content from PSA
async function scrapePSAPage(browser, route) {
  const page = await browser.newPage();
  
  try {
    const url = `${PSA_URL}${route}`;
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
      
      // Check for 404
      const is404 = html.includes('404') || 
                   html.includes('Page Not Found') || 
                   html.includes('not found') ||
                   document.body.textContent.includes('404');
      
      return { title, description, html, is404 };
    });
    
    await page.close();
    
    if (data.is404 || !data.html || data.html.length < 200) {
      return null;
    }
    
    return data;
  } catch (error) {
    await page.close();
    return null;
  }
}

// Get local page content
async function getLocalPageContent(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract HTML from dangerouslySetInnerHTML
    const htmlMatch = content.match(/dangerouslySetInnerHTML=\{\{\s*__html:\s*([`'"])([\s\S]*?)\1\s*\}\}/);
    if (htmlMatch) {
      return htmlMatch[2].replace(/\\`/g, '`').replace(/\\\$/g, '$');
    }
    
    // Try to extract any HTML content
    const anyHtmlMatch = content.match(/(<div[^>]*>[\s\S]*?<\/div>)/);
    if (anyHtmlMatch) {
      return anyHtmlMatch[1];
    }
    
    return content;
  } catch {
    return null;
  }
}

// Scrape navigation from PSA
async function scrapePSANavigation(browser) {
  const page = await browser.newPage();
  
  try {
    await page.goto(PSA_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    
    const nav = await page.evaluate(() => {
      const navData = {
        mainMenu: [],
        dropdowns: {},
      };
      
      // Get header navigation
      const header = document.querySelector('header') || document.querySelector('[role="banner"]');
      if (!header) return navData;
      
      // Get all navigation links
      const navLinks = header.querySelectorAll('nav a, header a[href]');
      const menuMap = new Map();
      
      navLinks.forEach(link => {
        const text = link.textContent.trim();
        const href = link.getAttribute('href');
        if (!text || !href || href.startsWith('#') || href.startsWith('javascript:')) return;
        
        // Check if it's in a dropdown
        const dropdown = link.closest('[class*="dropdown"], [class*="menu"], ul, nav ul');
        if (dropdown) {
          const trigger = dropdown.previousElementSibling || 
                         dropdown.parentElement?.querySelector('button, a[aria-haspopup]');
          const menuName = trigger?.textContent?.trim() || 'Menu';
          
          if (!navData.dropdowns[menuName]) {
            navData.dropdowns[menuName] = [];
          }
          navData.dropdowns[menuName].push({ text, href });
        } else {
          navData.mainMenu.push({ text, href });
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

// Get local navigation
async function getLocalNavigation() {
  const headerFile = path.join(__dirname, '..', 'components', 'Header.tsx');
  const content = await fs.readFile(headerFile, 'utf-8');
  
  const nav = {
    mainMenu: [],
    dropdowns: {},
  };
  
  // Extract main menu links
  const mainMenuMatches = content.matchAll(/href=["']([^"']+)["'][^>]*>([^<]+)</g);
  for (const match of mainMenuMatches) {
    const href = match[1];
    const text = match[2].trim();
    if (href && text && !href.startsWith('#') && !href.startsWith('javascript:')) {
      // Check if it's in a dropdown by looking at context
      const beforeMatch = content.substring(0, content.indexOf(match[0]));
      const isInDropdown = beforeMatch.includes('dropdown') || beforeMatch.includes('absolute top-full');
      
      if (isInDropdown) {
        // Find which dropdown
        const dropdownMatch = beforeMatch.match(/(?:aria-label|name)=["']([^"']+)\s+menu["']/i);
        const menuName = dropdownMatch ? dropdownMatch[1] : 'Menu';
        if (!nav.dropdowns[menuName]) {
          nav.dropdowns[menuName] = [];
        }
        nav.dropdowns[menuName].push({ text, href });
      } else {
        nav.mainMenu.push({ text, href });
      }
    }
  }
  
  return nav;
}

// Get all links from a page
async function getAllLinksFromPSA(browser, route) {
  const page = await browser.newPage();
  
  try {
    const url = `${PSA_URL}${route}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    const links = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a[href]'));
      return allLinks.map(link => {
        const href = link.getAttribute('href');
        const text = link.textContent.trim();
        return { text, href };
      }).filter(link => 
        link.href && 
        !link.href.startsWith('#') && 
        !link.href.startsWith('javascript:') &&
        !link.href.startsWith('mailto:') &&
        !link.href.startsWith('tel:') &&
        (link.href.startsWith('/') || link.href.includes('policestationagent.com'))
      );
    });
    
    await page.close();
    return links;
  } catch {
    await page.close();
    return [];
  }
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  COMPLETE DUPLICATION VERIFICATION`);
  console.log(`  Comparing with: ${PSA_URL}`);
  console.log(`${'═'.repeat(70)}\n`);

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Step 1: Get navigation structures
    console.log('Step 1: Comparing navigation structures...\n');
    const psaNav = await scrapePSANavigation(browser);
    const localNav = await getLocalNavigation();
    
    console.log(`  PSA Main Menu: ${psaNav.mainMenu.length} items`);
    console.log(`  Local Main Menu: ${localNav.mainMenu.length} items`);
    console.log(`  PSA Dropdowns: ${Object.keys(psaNav.dropdowns).length}`);
    console.log(`  Local Dropdowns: ${Object.keys(localNav.dropdowns).length}\n`);
    
    // Step 2: Get all routes from navigation
    const allNavRoutes = new Set();
    psaNav.mainMenu.forEach(item => allNavRoutes.add(item.href));
    Object.values(psaNav.dropdowns).forEach(items => {
      items.forEach(item => allNavRoutes.add(item.href));
    });
    
    // Step 3: Get local pages
    console.log('Step 2: Getting local pages...\n');
    const localPages = await getLocalPages();
    console.log(`  Found ${localPages.size} local pages\n`);
    
    // Step 4: Check each navigation route
    console.log('Step 3: Verifying pages from navigation...\n');
    const results = {
      complete: [],
      missing: [],
      incomplete: [],
      different: [],
    };
    
    const routesToCheck = Array.from(allNavRoutes).slice(0, 30); // Limit for now
    
    for (const route of routesToCheck) {
      const normalizedRoute = route.replace(/\/$/, '') || '/';
      const localPath = localPages.get(normalizedRoute);
      
      if (!localPath) {
        console.log(`  ❌ MISSING: ${normalizedRoute}`);
        results.missing.push(normalizedRoute);
        continue;
      }
      
      // Scrape PSA page
      const psaContent = await scrapePSAPage(browser, route);
      if (!psaContent) {
        console.log(`  ⚠️  PSA 404: ${normalizedRoute}`);
        results.incomplete.push({ route: normalizedRoute, reason: 'PSA returns 404' });
        continue;
      }
      
      // Get local content
      const localContent = await getLocalPageContent(localPath);
      if (!localContent) {
        console.log(`  ⚠️  NO LOCAL CONTENT: ${normalizedRoute}`);
        results.incomplete.push({ route: normalizedRoute, reason: 'No local content found' });
        continue;
      }
      
      // Compare content
      const psaHash = getContentHash(psaContent.html);
      const localHash = getContentHash(localContent);
      
      if (psaHash === localHash) {
        console.log(`  ✅ COMPLETE: ${normalizedRoute}`);
        results.complete.push(normalizedRoute);
      } else {
        // Calculate similarity
        const similarity = calculateSimilarity(psaContent.html, localContent);
        if (similarity > 0.8) {
          console.log(`  ⚠️  SIMILAR (${Math.round(similarity * 100)}%): ${normalizedRoute}`);
          results.incomplete.push({ route: normalizedRoute, similarity });
        } else {
          console.log(`  ❌ DIFFERENT (${Math.round(similarity * 100)}%): ${normalizedRoute}`);
          results.different.push({ route: normalizedRoute, similarity });
        }
      }
      
      await new Promise(r => setTimeout(r, 1000)); // Rate limiting
    }
    
    // Step 5: Summary
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`  VERIFICATION RESULTS`);
    console.log(`${'═'.repeat(70)}`);
    console.log(`  ✅ Complete duplicates: ${results.complete.length}`);
    console.log(`  ❌ Missing pages: ${results.missing.length}`);
    console.log(`  ⚠️  Incomplete pages: ${results.incomplete.length}`);
    console.log(`  ❌ Different pages: ${results.different.length}`);
    
    if (results.missing.length > 0) {
      console.log(`\n  Missing pages:`);
      results.missing.forEach(route => console.log(`    - ${route}`));
    }
    
    if (results.incomplete.length > 0) {
      console.log(`\n  Incomplete pages:`);
      results.incomplete.forEach(item => {
        if (typeof item === 'string') {
          console.log(`    - ${item}`);
        } else {
          console.log(`    - ${item.route} (${item.reason || Math.round(item.similarity * 100) + '% similar'})`);
        }
      });
    }
    
    if (results.different.length > 0) {
      console.log(`\n  Different pages:`);
      results.different.forEach(item => {
        console.log(`    - ${item.route} (${Math.round(item.similarity * 100)}% similar)`);
      });
    }
    
    console.log(`\n${'═'.repeat(70)}\n`);
    
    // Save report
    const reportFile = path.join(__dirname, '..', 'data', 'verification-report.json');
    await fs.mkdir(path.dirname(reportFile), { recursive: true });
    await fs.writeFile(reportFile, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`  💾 Report saved to: ${reportFile}\n`);
    
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

// Calculate similarity between two strings
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  // Simple word-based similarity
  const words1 = new Set(str1.toLowerCase().match(/\b\w+\b/g) || []);
  const words2 = new Set(str2.toLowerCase().match(/\b\w+\b/g) || []);
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

main().catch(console.error);



