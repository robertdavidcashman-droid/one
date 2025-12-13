const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '..', 'reports', 'lighthouse');
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Routes to test
const TEST_ROUTES = [
  '/',
  '/services',
  '/contact',
  '/blog',
  '/coverage',
];

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.error(`Failed to create directory ${dir}:`, error);
  }
}

async function runLighthouse(url, outputPath, device = 'mobile') {
  const deviceFlag = device === 'mobile' ? '--preset=mobile' : '--preset=desktop';
  const command = `npx lighthouse "${url}" ${deviceFlag} --output=html,json --output-path="${outputPath}" --chrome-flags="--headless --no-sandbox" --quiet`;
  
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Lighthouse failed for ${url}:`, error.message);
    return false;
  }
}

async function extractScores(jsonPath) {
  try {
    const json = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
    return {
      performance: json.categories?.performance?.score ? Math.round(json.categories.performance.score * 100) : 0,
      accessibility: json.categories?.accessibility?.score ? Math.round(json.categories.accessibility.score * 100) : 0,
      bestPractices: json.categories?.['best-practices']?.score ? Math.round(json.categories['best-practices'].score * 100) : 0,
      seo: json.categories?.seo?.score ? Math.round(json.categories.seo.score * 100) : 0,
    };
  } catch (error) {
    console.error(`Failed to extract scores from ${jsonPath}:`, error.message);
    return { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 };
  }
}

async function generateSummary(scores) {
  const summary = {
    timestamp: new Date().toISOString(),
    routes: scores,
    summary: {
      averagePerformance: 0,
      averageAccessibility: 0,
      averageBestPractices: 0,
      averageSeo: 0,
    },
  };

  // Calculate averages
  const allScores = Object.values(scores).flat();
  if (allScores.length > 0) {
    summary.summary.averagePerformance = Math.round(
      allScores.reduce((sum, s) => sum + s.mobile.performance + s.desktop.performance, 0) / (allScores.length * 2)
    );
    summary.summary.averageAccessibility = Math.round(
      allScores.reduce((sum, s) => sum + s.mobile.accessibility + s.desktop.accessibility, 0) / (allScores.length * 2)
    );
    summary.summary.averageBestPractices = Math.round(
      allScores.reduce((sum, s) => sum + s.mobile.bestPractices + s.desktop.bestPractices, 0) / (allScores.length * 2)
    );
    summary.summary.averageSeo = Math.round(
      allScores.reduce((sum, s) => sum + s.mobile.seo + s.desktop.seo, 0) / (allScores.length * 2)
    );
  }

  return summary;
}

async function main() {
  console.log('🚀 Starting Lighthouse CI...\n');

  // Check if server is running
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error('Server not responding');
    }
  } catch (error) {
    console.error('❌ Server is not running. Please run "npm run build && npm run start" first.');
    console.error('   Or set PORT environment variable if using a different port.');
    process.exit(1);
  }

  await ensureDir(REPORTS_DIR);

  const scores = {};

  for (const route of TEST_ROUTES) {
    const url = `${BASE_URL}${route}`;
    const routeName = route === '/' ? 'home' : route.replace(/\//g, '-').replace(/^-/, '');
    
    console.log(`\n📊 Testing ${route}...`);

    // Mobile
    const mobileHtmlPath = path.join(REPORTS_DIR, `${routeName}-mobile.html`);
    const mobileJsonPath = path.join(REPORTS_DIR, `${routeName}-mobile.json`);
    console.log(`  Mobile: ${url}`);
    await runLighthouse(url, mobileHtmlPath.replace('.html', ''), 'mobile');
    const mobileScores = await extractScores(mobileJsonPath);

    // Desktop
    const desktopHtmlPath = path.join(REPORTS_DIR, `${routeName}-desktop.html`);
    const desktopJsonPath = path.join(REPORTS_DIR, `${routeName}-desktop.json`);
    console.log(`  Desktop: ${url}`);
    await runLighthouse(url, desktopHtmlPath.replace('.html', ''), 'desktop');
    const desktopScores = await extractScores(desktopJsonPath);

    scores[route] = {
      mobile: mobileScores,
      desktop: desktopScores,
    };

    console.log(`  ✅ Mobile: P${mobileScores.performance} A${mobileScores.accessibility} BP${mobileScores.bestPractices} SEO${mobileScores.seo}`);
    console.log(`  ✅ Desktop: P${desktopScores.performance} A${desktopScores.accessibility} BP${desktopScores.bestPractices} SEO${desktopScores.seo}`);
  }

  // Generate summary
  const summary = await generateSummary(scores);
  const summaryPath = path.join(REPORTS_DIR, 'summary.json');
  await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

  console.log('\n📈 Summary:');
  console.log(`  Average Performance: ${summary.summary.averagePerformance}/100`);
  console.log(`  Average Accessibility: ${summary.summary.averageAccessibility}/100`);
  console.log(`  Average Best Practices: ${summary.summary.averageBestPractices}/100`);
  console.log(`  Average SEO: ${summary.summary.averageSeo}/100`);
  console.log(`\n📁 Reports saved to: ${REPORTS_DIR}`);
  console.log(`📄 Summary: ${summaryPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}













