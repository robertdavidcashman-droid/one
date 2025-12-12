/**
 * Site Audit Script
 * Detects hidden pages (routes not linked from navigation or content)
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const APP_DIR = path.join(__dirname, '..', 'app');
const REPORTS_DIR = path.join(__dirname, '..', 'reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

interface RouteInfo {
  route: string;
  path: string;
  filePath: string;
  title?: string;
  h1?: string;
  description?: string;
  isNoIndex?: boolean;
  isDraft?: boolean;
  isAdmin?: boolean;
  isApi?: boolean;
  isError?: boolean;
}

interface LinkGraph {
  [route: string]: string[]; // route -> array of routes it links to
}

interface AuditReport {
  totalRoutes: number;
  routes: RouteInfo[];
  linkGraph: LinkGraph;
  reachableRoutes: Set<string>;
  hiddenRoutes: RouteInfo[];
  navigationRoutes: Set<string>;
  generatedAt: string;
}

/**
 * Extract all routes from app directory
 */
function enumerateRoutes(): RouteInfo[] {
  const routes: RouteInfo[] = [];
  
  // Find all page.tsx, page.ts files
  const pageFiles = glob.sync('**/page.{tsx,ts}', {
    cwd: APP_DIR,
    absolute: true,
  });

  for (const filePath of pageFiles) {
    const relativePath = path.relative(APP_DIR, filePath);
    const route = '/' + relativePath
      .replace(/\\/g, '/')
      .replace(/\/page\.(tsx|ts)$/, '')
      .replace(/^\/+/, '')
      .replace(/\/+$/, '') || '/';

    // Skip certain routes
    if (route.startsWith('/api/') || 
        route.startsWith('/_') ||
        route.includes('/[') && !route.includes('/blog/[')) {
      continue;
    }

    const routeInfo: RouteInfo = {
      route,
      path: route === '/' ? '/' : route,
      filePath: relativePath,
      isApi: route.startsWith('/api'),
      isAdmin: route.startsWith('/admin'),
      isError: route.includes('404') || route.includes('error'),
    };

    // Try to extract metadata from file
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract title from metadata
      const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
      if (titleMatch) {
        routeInfo.title = titleMatch[1];
      }

      // Extract H1
      const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
      if (h1Match) {
        routeInfo.h1 = h1Match[1];
      }

      // Check for noindex
      if (content.includes('noindex') || content.includes('index: false')) {
        routeInfo.isNoIndex = true;
      }

      // Check for draft
      if (content.includes('draft:') && content.match(/draft:\s*true/)) {
        routeInfo.isDraft = true;
      }

      // Extract description
      const descMatch = content.match(/description:\s*["']([^"']+)["']/);
      if (descMatch) {
        routeInfo.description = descMatch[1];
      }
    } catch (error) {
      // File read error, skip metadata extraction
    }

    routes.push(routeInfo);
  }

  return routes;
}

/**
 * Extract links from navigation components
 */
function extractNavigationLinks(): Set<string> {
  const navRoutes = new Set<string>();
  
  // Read Header and Footer components
  const headerPath = path.join(__dirname, '..', 'components', 'Header.tsx');
  const footerPath = path.join(__dirname, '..', 'components', 'Footer.tsx');

  [headerPath, footerPath].forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract href attributes
      const hrefMatches = content.matchAll(/href=["']([^"']+)["']/g);
      for (const match of hrefMatches) {
        const href = match[1];
        if (href.startsWith('/') && !href.startsWith('//')) {
          navRoutes.add(href.split('?')[0].split('#')[0]);
        }
      }
    }
  });

  return navRoutes;
}

/**
 * Crawl internal links starting from home page
 */
function crawlInternalLinks(routes: RouteInfo[]): { linkGraph: LinkGraph; reachable: Set<string> } {
  const linkGraph: LinkGraph = {};
  const reachable = new Set<string>();
  const visited = new Set<string>();
  const queue: string[] = ['/'];

  // Initialize link graph
  routes.forEach(route => {
    linkGraph[route.route] = [];
  });

  // Extract links from page files
  routes.forEach(routeInfo => {
    try {
      const fullPath = path.join(APP_DIR, routeInfo.filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Find all href attributes
        const hrefMatches = content.matchAll(/href=["']([^"']+)["']/g);
        const links = new Set<string>();
        
        for (const match of hrefMatches) {
          let href = match[1];
          
          // Only process internal links
          if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/api')) {
            href = href.split('?')[0].split('#')[0];
            if (href && href !== routeInfo.route) {
              links.add(href);
            }
          }
        }
        
        linkGraph[routeInfo.route] = Array.from(links);
      }
    } catch (error) {
      // Skip if file can't be read
    }
  });

  // BFS crawl from home
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    reachable.add(current);

    const links = linkGraph[current] || [];
    for (const link of links) {
      if (!visited.has(link) && !queue.includes(link)) {
        queue.push(link);
      }
    }
  }

  return { linkGraph, reachable };
}

/**
 * Main audit function
 */
function runAudit(): AuditReport {
  console.log('🔍 Starting site audit...\n');

  // Enumerate all routes
  console.log('📋 Enumerating routes...');
  const routes = enumerateRoutes();
  console.log(`   Found ${routes.length} routes\n`);

  // Extract navigation links
  console.log('🧭 Extracting navigation links...');
  const navRoutes = extractNavigationLinks();
  console.log(`   Found ${navRoutes.size} navigation links\n`);

  // Crawl internal links
  console.log('🕷️  Crawling internal links...');
  const { linkGraph, reachable } = crawlInternalLinks(routes);
  console.log(`   Found ${reachable.size} reachable routes\n`);

  // Identify hidden routes
  const hiddenRoutes = routes.filter(route => {
    // Exclude intentionally hidden routes
    if (route.isNoIndex || route.isDraft || route.isAdmin || route.isApi || route.isError) {
      return false;
    }

    // Exclude if in navigation
    if (navRoutes.has(route.route)) {
      return false;
    }

    // Exclude if reachable from crawl
    if (reachable.has(route.route)) {
      return false;
    }

    return true;
  });

  console.log(`📊 Audit Results:\n`);
  console.log(`   Total routes: ${routes.length}`);
  console.log(`   Reachable routes: ${reachable.size}`);
  console.log(`   Hidden routes: ${hiddenRoutes.length}\n`);

  if (hiddenRoutes.length > 0) {
    console.log('🔍 Hidden Routes:\n');
    hiddenRoutes.forEach(route => {
      console.log(`   - ${route.route}`);
      if (route.title) console.log(`     Title: ${route.title}`);
      if (route.h1) console.log(`     H1: ${route.h1}`);
    });
  }

  const report: AuditReport = {
    totalRoutes: routes.length,
    routes,
    linkGraph,
    reachableRoutes: reachable,
    hiddenRoutes,
    navigationRoutes: navRoutes,
    generatedAt: new Date().toISOString(),
  };

  // Write JSON report
  const reportPath = path.join(REPORTS_DIR, 'site-audit.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n✅ Report written to: ${reportPath}`);

  return report;
}

// Run if executed directly
if (require.main === module) {
  runAudit();
}

export { runAudit, enumerateRoutes };

