#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapePage() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    const url = 'https://policestationagent.com/what-is-a-police-station-rep';
    console.log(`Scraping ${url}...`);
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    const data = await page.evaluate(() => {
      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]');
      const description = metaDesc ? metaDesc.getAttribute('content') || '' : '';
      
      const main = document.querySelector('main') || document.querySelector('#root') || document.body;
      let html = main ? main.innerHTML : '';
      
      const temp = document.createElement('div');
      temp.innerHTML = html;
      temp.querySelectorAll('script, style, noscript').forEach(el => el.remove());
      html = temp.innerHTML;
      
      return { title, description, html };
    });
    
    console.log('Title:', data.title);
    console.log('Description:', data.description);
    console.log('HTML length:', data.html.length);
    
    // Write to file
    const outputPath = path.join(__dirname, 'what-is-police-station-rep-content.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`\nContent saved to ${outputPath}`);
    
    await browser.close();
    return data;
  } catch (error) {
    console.error('Error:', error);
    await browser.close();
    throw error;
  }
}

scrapePage().catch(console.error);

