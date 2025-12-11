/**
 * Paste Content From Browser
 * Helper script to add content copied from browser to pages
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const APP_DIR = path.join(__dirname, '..', 'app');

// Pages that need content
const PAGES_NEEDING_CONTENT = [
  { route: '/police-stations', name: 'Police Stations Listing' },
  { route: '/for-clients', name: 'For Clients' },
  { route: '/what-is-a-police-station-rep', name: 'What is a Police Station Rep' },
  { route: '/what-is-a-criminal-solicitor', name: 'What is a Criminal Solicitor' },
  { route: '/what-we-do', name: 'What We Do' },
  { route: '/why-use-us', name: 'Why Use Us' },
  { route: '/after-a-police-interview', name: 'After a Police Interview' },
  { route: '/voluntary-interviews', name: 'Voluntary Interviews' },
  { route: '/terms-and-conditions', name: 'Terms and Conditions' },
];

function escapeForTemplate(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

async function updatePageWithContent(route, htmlContent) {
  const routePath = route === '/' ? 'page.tsx' : route.replace(/^\//, '').replace(/\//g, '\\') + '\\page.tsx';
  const filePath = path.join(APP_DIR, routePath);
  
  try {
    const existing = await fs.readFile(filePath, 'utf8');
    
    // Escape content for template string
    const escapedContent = escapeForTemplate(htmlContent);
    
    // Replace the dangerouslySetInnerHTML content
    const updated = existing.replace(
      /dangerouslySetInnerHTML=\{\{ __html: `[^`]*` \}\}/s,
      `dangerouslySetInnerHTML={{ __html: \`${escapedContent}\` }}`
    );
    
    await fs.writeFile(filePath, updated, 'utf8');
    console.log(`✅ Updated: ${route}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${route}:`, error.message);
    return false;
  }
}

async function getContentFromUser(pageName) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    console.log(`\n📋 ${pageName}`);
    console.log('1. Open the page in your browser');
    console.log('2. Right-click on the main content area');
    console.log('3. Select "Inspect" or "Inspect Element"');
    console.log('4. Find the <main> element or main content container');
    console.log('5. Right-click on it and select "Copy" > "Copy outerHTML"');
    console.log('6. Paste the HTML here (press Enter twice when done):\n');
    
    let content = '';
    
    rl.on('line', (line) => {
      if (line.trim() === '' && content !== '') {
        rl.close();
        resolve(content.trim());
      } else {
        content += line + '\n';
      }
    });
  });
}

async function main() {
  console.log('📝 Add Content From Browser\n');
  console.log('This script will help you add content to pages that are showing 404.\n');
  console.log('Pages needing content:');
  PAGES_NEEDING_CONTENT.forEach((page, i) => {
    console.log(`  ${i + 1}. ${page.name} (${page.route})`);
  });
  
  console.log('\n💡 Instructions:');
  console.log('For each page:');
  console.log('  1. Open https://policestationagent.com{route} in your browser');
  console.log('  2. View page source or inspect the main content');
  console.log('  3. Copy the HTML content');
  console.log('  4. Paste it here\n');
  
  for (const page of PAGES_NEEDING_CONTENT) {
    const content = await getContentFromUser(page.name);
    
    if (content && content.length > 100) {
      await updatePageWithContent(page.route, content);
    } else {
      console.log(`⏭️  Skipped ${page.name} (content too short or empty)`);
    }
  }
  
  console.log('\n✅ Done! All pages updated.');
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updatePageWithContent, escapeForTemplate };

