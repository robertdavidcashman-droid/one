/**
 * Generate Final Import & Rebuild Report
 */

const fs = require('fs').promises;
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'app');
const REPORT_DIR = path.join(__dirname, '..', 'legacy', 'import-reports');

async function findPageFiles(dir, basePath = '') {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);
    
    if (entry.isDirectory()) {
      const subFiles = await findPageFiles(fullPath, relativePath);
      files.push(...subFiles);
    } else if (entry.name === 'page.tsx') {
      files.push(relativePath);
    }
  }
  
  return files;
}

async function getAllPages() {
  const pageFiles = await findPageFiles(APP_DIR);
  
  return pageFiles.map(file => {
    const fullPath = path.join(APP_DIR, file);
    const route = fileToRoute(file);
    return { route, file, path: fullPath };
  }).sort((a, b) => a.route.localeCompare(b.route));
}

function fileToRoute(file) {
  // Remove app/ prefix and /page.tsx suffix
  let route = file.replace(/^app\//, '').replace(/\/page\.tsx$/, '');
  
  // Handle dynamic routes
  if (route.includes('[slug]')) {
    route = route.replace('/[slug]', '/:slug');
  }
  
  // Handle root
  if (route === 'page') {
    route = '/';
  } else {
    route = '/' + route;
  }
  
  // Handle special cases
  if (route === '/post') {
    route = '/post?slug=:slug';
  }
  
  return route;
}

async function generateFinalReport() {
  console.log('📊 Generating final import & rebuild report...\n');
  
  const pages = await getAllPages();
  
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalPages: pages.length,
      staticPages: pages.filter(p => !p.route.includes(':') && !p.route.includes('?')).length,
      dynamicPages: pages.filter(p => p.route.includes(':') || p.route.includes('?')).length,
    },
    pages: pages.map(p => ({
      route: p.route,
      file: p.file,
    })),
    limitations: {
      serverSideCode: 'Backend logic, API endpoints, and database queries cannot be imported',
      authentication: 'Admin panels and login-protected areas are excluded',
      formHandlers: 'Contact forms require backend implementation (frontend structure preserved)',
      dynamicContent: 'Content loaded via JavaScript after initial render may be incomplete',
      thirdPartyScripts: 'External services (analytics, chat widgets) need separate setup',
      protectedContent: 'Pages blocked by robots.txt or requiring authentication are excluded',
      images: 'Images are referenced but not downloaded (need manual asset migration)',
    },
    nextSteps: [
      'Review rebuilt pages in app/ directory',
      'Update internal links to use Next.js Link components',
      'Download and organize images to public/ directory',
      'Set up form submission handlers for contact forms',
      'Configure third-party services (analytics, etc.)',
      'Test all routes and navigation',
      'Update sitemap.ts with all new pages',
    ],
  };
  
  // Save JSON report
  const jsonPath = path.join(REPORT_DIR, 'final-import-report.json');
  await fs.mkdir(REPORT_DIR, { recursive: true });
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf8');
  
  // Generate markdown report
  const mdReport = generateMarkdownReport(report);
  const mdPath = path.join(REPORT_DIR, 'FULL_IMPORT_REPORT.md');
  await fs.writeFile(mdPath, mdReport, 'utf8');
  
  console.log('✅ Final report generated!');
  console.log(`📄 JSON: ${jsonPath}`);
  console.log(`📄 Markdown: ${mdPath}`);
  
  return report;
}

function generateMarkdownReport(report) {
  let md = `# Full Site Import & Rebuild Report\n\n`;
  md += `**Generated:** ${new Date(report.generatedAt).toLocaleString()}\n\n`;
  
  md += `## Summary\n\n`;
  md += `- **Total Pages Rebuilt:** ${report.summary.totalPages}\n`;
  md += `- **Static Pages:** ${report.summary.staticPages}\n`;
  md += `- **Dynamic Pages:** ${report.summary.dynamicPages}\n\n`;
  
  md += `## Pages Rebuilt\n\n`;
  md += `| Route | File |\n`;
  md += `|-------|------|\n`;
  report.pages.forEach(p => {
    md += `| \`${p.route}\` | \`${p.file}\` |\n`;
  });
  
  md += `\n## Limitations\n\n`;
  Object.entries(report.limitations).forEach(([key, value]) => {
    md += `### ${key.replace(/([A-Z])/g, ' $1').trim()}\n`;
    md += `${value}\n\n`;
  });
  
  md += `## Next Steps\n\n`;
  report.nextSteps.forEach((step, i) => {
    md += `${i + 1}. ${step}\n`;
  });
  
  md += `\n## File Map\n\n`;
  md += `All rebuilt pages are located in the \`app/\` directory following Next.js App Router conventions:\n\n`;
  md += `- Static pages: \`app/[route]/page.tsx\`\n`;
  md += `- Dynamic pages: \`app/[route]/[slug]/page.tsx\`\n`;
  md += `- Blog posts: \`app/post/page.tsx\` (with query parameter)\n`;
  
  return md;
}

if (require.main === module) {
  generateFinalReport().catch(console.error);
}

module.exports = { generateFinalReport };

