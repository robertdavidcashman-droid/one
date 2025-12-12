#!/usr/bin/env node

/**
 * Comprehensive verification of all pages, links, and menus
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

const APP_DIR = path.join(__dirname, '..', 'app');
const HEADER_FILE = path.join(__dirname, '..', 'components', 'Header.tsx');

// Expected navigation structure (from manual inspection of policestationagent.com)
const EXPECTED_NAVIGATION = {
  mainMenu: ['Home', 'Services', 'About', 'Coverage', 'Articles', 'Information', 'Blog', 'Contact'],
  dropdowns: {
    'Services': [
      'All Services', 'What We Do', 'For Solicitors', 'For Clients', 
      'Voluntary Interviews', 'Voluntary Interview Services', 
      'Legal Aid & Fees', 'Private Client Services', 'Private Client FAQ', 'Court Representation'
    ],
    'About': [
      'About Us', 'Why Use Us', 'What is a Criminal Solicitor', 'What is a Police Station Rep'
    ],
    'Coverage': [
      'Areas Covered', 'Police Stations', 'Kent Police Stations', 'Areas'
    ],
    'Articles': [
      'All Articles', 'Vulnerable Adults in Custody', 'Preparing for Police Interview',
      'Importance of Early Legal Advice', 'Arrival Times & Delays', 
      'Booking In Procedure in Kent', 'What to do if a Loved One is Arrested',
      'Voluntary Interviews', 'After a Police Interview'
    ],
    'Information': [
      'FAQ', 'Privacy Policy', 'Cookies Policy', 'Accessibility', 
      'Complaints', 'GDPR', 'Terms and Conditions'
    ],
    'Blog': ['All Blog Posts']
  }
};

// Route mappings
const ROUTE_MAPPINGS = {
  '/': '/',
  '/home': '/',
  '/services': '/services',
  '/what-we-do': '/what-we-do',
  '/for-solicitors': '/for-solicitors',
  '/for-clients': '/for-clients',
  '/voluntary-interviews': '/voluntary-interviews',
  '/servicesvoluntaryinterviews': '/servicesvoluntaryinterviews',
  '/fees': '/fees',
  '/privatecrime': '/privatecrime',
  '/privateclientfaq': '/privateclientfaq',
  '/courtrepresentation': '/courtrepresentation',
  '/about': '/about',
  '/why-use-us': '/why-use-us',
  '/what-is-a-criminal-solicitor': '/what-is-a-criminal-solicitor',
  '/what-is-a-police-station-rep': '/what-is-a-police-station-rep',
  '/coverage': '/coverage',
  '/police-stations': '/police-stations',
  '/kent-police-stations': '/kent-police-stations',
  '/areas': '/areas',
  '/blog': '/blog',
  '/vulnerable-adults-in-custody': '/vulnerable-adults-in-custody',
  '/preparing-for-police-interview': '/preparing-for-police-interview',
  '/importance-of-early-legal-advice': '/importance-of-early-legal-advice',
  '/arrival-times-delays': '/arrival-times-delays',
  '/booking-in-procedure-in-kent': '/booking-in-procedure-in-kent',
  '/what-to-do-if-a-loved-one-is-arrested': '/what-to-do-if-a-loved-one-is-arrested',
  '/after-a-police-interview': '/after-a-police-interview',
  '/faq': '/faq',
  '/privacy': '/privacy',
  '/cookies': '/cookies',
  '/accessibility': '/accessibility',
  '/complaints': '/complaints',
  '/gdpr': '/gdpr',
  '/termsandconditions': '/termsandconditions',
  '/contact': '/contact',
};

  // Get all local pages
async function getLocalPages() {
  const files = await glob('**/page.tsx', {
    cwd: APP_DIR,
    ignore: ['**/node_modules/**', '**/.next/**', '**/admin/**', '**/api/**', '**/criminaldefencekent/**'],
  });
  
  const pages = new Map();
  files.forEach(file => {
    // Convert file path to route - handle both forward and backslashes
    let route = file.replace(/[\/\\]page\.tsx$/, '');
    
    // Handle root page
    if (route === 'page.tsx' || route === '' || !route) {
      route = '';
    }
    
    // Normalize path separators
    route = route.replace(/\\/g, '/');
    
    // Handle dynamic routes
    if (route.includes('[slug]')) {
      route = route.replace(/\[slug\]/g, '*');
    }
    if (route.includes('[id]')) {
      route = route.replace(/\[id\]/g, '*');
    }
    
    // Create normalized route
    const normalizedRoute = route ? `/${route}` : '/';
    
    // Store with multiple possible keys for matching
    pages.set(normalizedRoute, { path: path.join(APP_DIR, file), route: normalizedRoute });
    
    // Also store without leading slash for root
    if (normalizedRoute === '/') {
      pages.set('', { path: path.join(APP_DIR, file), route: '/' });
    }
    
    // Store the route without the file extension part if it was included
    if (file === 'page.tsx') {
      pages.set('/', { path: path.join(APP_DIR, file), route: '/' });
      pages.set('', { path: path.join(APP_DIR, file), route: '/' });
    }
  });
  
  return pages;
}

// Extract navigation from Header.tsx
async function extractLocalNavigation() {
  const content = await fs.readFile(HEADER_FILE, 'utf-8');
  
  const nav = {
    mainMenu: [],
    dropdowns: {},
  };
  
  // Extract main menu items (direct links, not in dropdowns)
  const mainMenuPattern = /<Link\s+href=["']([^"']+)["'][^>]*>\s*([^<]+)\s*<\/Link>/g;
  let match;
  while ((match = mainMenuPattern.exec(content)) !== null) {
    const href = match[1];
    const text = match[2].trim();
    
    // Check if it's in a dropdown by looking at context
    const beforeMatch = content.substring(0, match.index);
    const isInDropdown = beforeMatch.includes('absolute top-full') || 
                        beforeMatch.includes('dropdown') ||
                        beforeMatch.includes('z-50');
    
    if (!isInDropdown && href && text) {
      nav.mainMenu.push({ text, href });
    }
  }
  
  // Extract dropdown menus
  const dropdownSections = content.split(/aria-label=["']([^"']+)\s+menu["']/i);
  for (let i = 1; i < dropdownSections.length; i += 2) {
    const menuName = dropdownSections[i];
    const menuContent = dropdownSections[i + 1] || '';
    
    const links = [];
    const linkPattern = /<Link\s+href=["']([^"']+)["'][^>]*>\s*([^<]+)\s*<\/Link>/g;
    let linkMatch;
    while ((linkMatch = linkPattern.exec(menuContent)) !== null) {
      const href = linkMatch[1];
      const text = linkMatch[2].trim();
      if (href && text) {
        links.push({ text, href });
      }
    }
    
    if (links.length > 0) {
      nav.dropdowns[menuName] = links;
    }
  }
  
  return nav;
}

// Check if page exists and has content
async function checkPage(route, filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Check if it has actual content (not just empty or 404)
    const hasContent = content.includes('dangerouslySetInnerHTML') || 
                      content.includes('prose') ||
                      content.length > 1000;
    
    // Check for 404 content
    const has404 = content.includes('404') || 
                  content.includes('Page Not Found') ||
                  content.includes('not found');
    
    return {
      exists: true,
      hasContent,
      has404,
      isEmpty: !hasContent && !has404,
    };
  } catch {
    return { exists: false };
  }
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  COMPREHENSIVE VERIFICATION`);
  console.log(`  Checking all pages, links, and menus`);
  console.log(`${'═'.repeat(70)}\n`);

  // Step 1: Get local pages
  console.log('Step 1: Scanning local pages...\n');
  const localPages = await getLocalPages();
  console.log(`  Found ${localPages.size} local pages\n`);
  
  // Step 2: Extract local navigation
  console.log('Step 2: Extracting local navigation...\n');
  const localNav = await extractLocalNavigation();
  console.log(`  Main menu items: ${localNav.mainMenu.length}`);
  console.log(`  Dropdown menus: ${Object.keys(localNav.dropdowns).length}\n`);
  
  // Step 3: Verify navigation structure
  console.log('Step 3: Verifying navigation structure...\n');
  const navIssues = [];
  
  // Check main menu
  const expectedMainMenu = EXPECTED_NAVIGATION.mainMenu;
  const actualMainMenu = localNav.mainMenu.map(m => m.text);
  expectedMainMenu.forEach(item => {
    if (!actualMainMenu.includes(item)) {
      navIssues.push(`Missing main menu item: ${item}`);
    }
  });
  
  // Check dropdowns
  Object.keys(EXPECTED_NAVIGATION.dropdowns).forEach(menuName => {
    const expectedItems = EXPECTED_NAVIGATION.dropdowns[menuName];
    const actualItems = localNav.dropdowns[menuName] || [];
    const actualItemTexts = actualItems.map(i => i.text);
    
    expectedItems.forEach(item => {
      if (!actualItemTexts.includes(item)) {
        navIssues.push(`Missing dropdown item in "${menuName}": ${item}`);
      }
    });
  });
  
  if (navIssues.length > 0) {
    console.log(`  ⚠️  Navigation issues found:\n`);
    navIssues.forEach(issue => console.log(`    - ${issue}`));
  } else {
    console.log(`  ✅ Navigation structure matches expected\n`);
  }
  
  // Step 4: Verify all navigation routes exist
  console.log('Step 4: Verifying all navigation routes exist...\n');
  const missingRoutes = [];
  const emptyRoutes = [];
  const routes404 = [];
  
  // Collect all routes from navigation
  const allNavRoutes = new Set();
  localNav.mainMenu.forEach(item => allNavRoutes.add(item.href));
  Object.values(localNav.dropdowns).forEach(items => {
    items.forEach(item => allNavRoutes.add(item.href));
  });
  
  for (const route of allNavRoutes) {
    const normalizedRoute = ROUTE_MAPPINGS[route] || route;
    let normalized = normalizedRoute.replace(/\/$/, '') || '/';
    
    // Try multiple matching strategies
    let pageInfo = localPages.get(normalized);
    
    // Try with leading slash
    if (!pageInfo && !normalized.startsWith('/')) {
      pageInfo = localPages.get(`/${normalized}`);
      if (pageInfo) normalized = `/${normalized}`;
    }
    
    // Try without leading slash
    if (!pageInfo && normalized.startsWith('/') && normalized !== '/') {
      pageInfo = localPages.get(normalized.substring(1));
      if (pageInfo) normalized = normalized.substring(1);
    }
    
    // Try exact match
    if (!pageInfo) {
      // Check if any page route matches (case-insensitive, handle variations)
      for (const [pageRoute, info] of localPages.entries()) {
        const pageRouteNormalized = pageRoute.toLowerCase().replace(/\/$/, '') || '/';
        const targetNormalized = normalized.toLowerCase().replace(/\/$/, '') || '/';
        if (pageRouteNormalized === targetNormalized) {
          pageInfo = info;
          normalized = pageRoute;
          break;
        }
      }
    }
    
    if (!pageInfo) {
      missingRoutes.push({ route, normalized });
      console.log(`  ❌ MISSING: ${route} (tried: ${normalized})`);
    } else {
      const check = await checkPage(normalized, pageInfo.path);
      if (check.has404) {
        routes404.push({ route, normalized });
        console.log(`  ⚠️  404 CONTENT: ${route}`);
      } else if (check.isEmpty) {
        emptyRoutes.push({ route, normalized });
        console.log(`  ⚠️  EMPTY: ${route}`);
      } else {
        console.log(`  ✅ EXISTS: ${route}`);
      }
    }
  }
  
  // Step 5: Summary
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  VERIFICATION SUMMARY`);
  console.log(`${'═'.repeat(70)}`);
  console.log(`  📄 Total local pages: ${localPages.size}`);
  console.log(`  🔗 Navigation routes checked: ${allNavRoutes.size}`);
  console.log(`  ✅ Complete pages: ${allNavRoutes.size - missingRoutes.length - emptyRoutes.length - routes404.length}`);
  console.log(`  ❌ Missing pages: ${missingRoutes.length}`);
  console.log(`  ⚠️  Empty pages: ${emptyRoutes.length}`);
  console.log(`  ⚠️  404 pages: ${routes404.length}`);
  console.log(`  ⚠️  Navigation issues: ${navIssues.length}`);
  
  if (missingRoutes.length > 0) {
    console.log(`\n  Missing pages:`);
    missingRoutes.forEach(item => console.log(`    - ${item.route}`));
  }
  
  if (emptyRoutes.length > 0) {
    console.log(`\n  Empty pages:`);
    emptyRoutes.forEach(item => console.log(`    - ${item.route}`));
  }
  
  if (routes404.length > 0) {
    console.log(`\n  Pages with 404 content:`);
    routes404.forEach(item => console.log(`    - ${item.route}`));
  }
  
  console.log(`\n${'═'.repeat(70)}\n`);
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: localPages.size,
      navigationRoutes: allNavRoutes.size,
      complete: allNavRoutes.size - missingRoutes.length - emptyRoutes.length - routes404.length,
      missing: missingRoutes.length,
      empty: emptyRoutes.length,
      has404: routes404.length,
      navIssues: navIssues.length,
    },
    missingRoutes,
    emptyRoutes,
    routes404,
    navIssues,
  };
  
  const reportFile = path.join(__dirname, '..', 'data', 'comprehensive-verification-report.json');
  await fs.mkdir(path.dirname(reportFile), { recursive: true });
  await fs.writeFile(reportFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`  💾 Report saved to: ${reportFile}\n`);
}

main().catch(console.error);

