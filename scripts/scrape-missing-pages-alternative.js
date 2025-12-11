/**
 * Try Alternative URL Patterns for Missing Pages
 */

const https = require('https');
const { JSDOM } = require('jsdom');

const BASE_URL = 'https://policestationagent.com';

// Try multiple URL variations for each page
const URL_VARIANTS = {
  '/after-a-police-interview': [
    '/AfterAPoliceInterview',
    '/after-a-police-interview',
    '/afterapoliceinterview',
    '/AfterAPoliceInterview/',
  ],
  '/article-interview-under-caution': [
    '/article-interview-under-caution',
    '/articleinterviewundercaution',
    '/ArticleInterviewUnderCaution',
  ],
  '/terms-and-conditions': [
    '/TermsAndConditions',
    '/terms-and-conditions',
    '/termsandconditions',
    '/Terms',
  ],
  '/voluntary-interviews': [
    '/VoluntaryInterviews',
    '/voluntary-interviews',
    '/voluntaryinterviews',
  ],
};

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    
    https.get(fullUrl, { 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ html: data, statusCode: res.statusCode });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function checkContent(html) {
  if (!html || html.length < 100) return false;
  
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  
  // Check for 404 indicators
  const bodyText = doc.body?.textContent || '';
  if (bodyText.includes('404') || bodyText.includes('Page Not Found') || bodyText.includes('Not Found')) {
    return false;
  }
  
  // Check for main content
  const main = doc.querySelector('#root > main') || doc.querySelector('main') || doc.querySelector('[role="main"]');
  if (main) {
    const text = main.textContent || '';
    return text.length > 500 && !text.includes('404');
  }
  
  return false;
}

async function testUrls(route) {
  const variants = URL_VARIANTS[route];
  console.log(`\n🔍 Testing variants for ${route}:`);
  
  for (const variant of variants) {
    try {
      console.log(`   Testing: ${BASE_URL}${variant}...`);
      const { html, statusCode } = await fetchHtml(variant);
      
      if (statusCode === 200 && checkContent(html)) {
        const dom = new JSDOM(html);
        const doc = dom.window.document;
        const title = doc.querySelector('title')?.textContent || 'No title';
        const main = doc.querySelector('#root > main') || doc.querySelector('main');
        const contentLength = main?.textContent?.length || 0;
        
        console.log(`   ✅ FOUND! Status: ${statusCode}, Content: ${contentLength} chars, Title: ${title.substring(0, 60)}...`);
        return { found: true, url: variant, html, title };
      } else {
        console.log(`   ❌ Status: ${statusCode}, No content or 404`);
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  return { found: false };
}

async function main() {
  console.log('🔍 Testing alternative URL patterns for missing pages...\n');
  
  for (const route of Object.keys(URL_VARIANTS)) {
    const result = await testUrls(route);
    if (result.found) {
      console.log(`\n✅ Found working URL for ${route}: ${result.url}`);
    } else {
      console.log(`\n❌ No working URL found for ${route}`);
    }
  }
  
  console.log('\n✅ Testing complete!');
}

main().catch(console.error);



