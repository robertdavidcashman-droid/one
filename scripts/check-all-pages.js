#!/usr/bin/env node

/**
 * Check all pages to find any that are still empty or have 404 content
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

const APP_DIR = path.join(__dirname, '..', 'app');

async function checkPage(route, filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Check for 404 content
    if (content.includes('Page Not Found') || 
        content.includes('404') ||
        content.includes('could not be found')) {
      return { route, status: '404', filePath };
    }
    
    // Check for empty content
    const htmlMatch = content.match(/dangerouslySetInnerHTML=\{\{\s*__html:\s*(.+?)\s*\}\}/s);
    if (htmlMatch) {
      const htmlValue = htmlMatch[1].trim();
      const templateMatch = htmlValue.match(/`([^`]*)`/s);
      if (templateMatch) {
        const html = templateMatch[1];
        if (html.length < 200 || html.includes('404') || html.includes('Page Not Found')) {
          return { route, status: 'empty', filePath };
        }
      }
    }
    
    // Check if description is empty
    const descMatch = content.match(/description:\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1/);
    if (descMatch && (!descMatch[2] || descMatch[2].trim().length === 0)) {
      return { route, status: 'no-description', filePath };
    }
    
    return { route, status: 'ok', filePath };
  } catch (error) {
    return { route, status: 'error', filePath, error: error.message };
  }
}

async function scanDirectory(dir, baseRoute = '') {
  const issues = [];
  
  async function scanDir(dir, baseRoute = '') {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('_') || 
            entry.name.startsWith('.') ||
            entry.name === 'api' ||
            entry.name === 'admin' ||
            entry.name === 'manifest.json' ||
            entry.name === 'globals.css' ||
            entry.name === 'layout.tsx' ||
            entry.name === 'sitemap.ts' ||
            entry.name === 'robots.ts') {
          continue;
        }
        
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const routeSegment = entry.name;
          const newRoute = baseRoute ? `${baseRoute}/${routeSegment}` : `/${routeSegment}`;
          await scanDir(fullPath, newRoute);
        } else if (entry.name === 'page.tsx') {
          const route = baseRoute || '/';
          const result = await checkPage(route, fullPath);
          if (result.status !== 'ok') {
            issues.push(result);
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }
  
  await scanDir(dir, baseRoute);
  return issues;
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  CHECKING ALL PAGES FOR ISSUES`);
  console.log(`${'═'.repeat(70)}\n`);

  const issues = await scanDirectory(APP_DIR);
  
  if (issues.length === 0) {
    console.log('✅ All pages are OK!\n');
    return;
  }
  
  console.log(`Found ${issues.length} pages with issues:\n`);
  
  const byStatus = {};
  issues.forEach(issue => {
    if (!byStatus[issue.status]) {
      byStatus[issue.status] = [];
    }
    byStatus[issue.status].push(issue);
  });
  
  if (byStatus['404']) {
    console.log(`❌ Pages with 404 content (${byStatus['404'].length}):`);
    byStatus['404'].forEach(issue => {
      console.log(`   ${issue.route}`);
    });
    console.log('');
  }
  
  if (byStatus['empty']) {
    console.log(`⚠️  Pages with empty content (${byStatus['empty'].length}):`);
    byStatus['empty'].forEach(issue => {
      console.log(`   ${issue.route}`);
    });
    console.log('');
  }
  
  if (byStatus['no-description']) {
    console.log(`⚠️  Pages without description (${byStatus['no-description'].length}):`);
    byStatus['no-description'].forEach(issue => {
      console.log(`   ${issue.route}`);
    });
    console.log('');
  }
  
  if (byStatus['error']) {
    console.log(`❌ Pages with errors (${byStatus['error'].length}):`);
    byStatus['error'].forEach(issue => {
      console.log(`   ${issue.route}: ${issue.error}`);
    });
    console.log('');
  }
  
  // Save report
  const reportPath = path.join(__dirname, '..', 'PAGE_ISSUES_REPORT.json');
  await fs.writeFile(reportPath, JSON.stringify(issues, null, 2), 'utf-8');
  console.log(`📄 Report saved to: ${reportPath}\n`);
}

main().catch(console.error);













