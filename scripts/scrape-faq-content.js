#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function scrapeFAQ() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    console.log('Scraping /faq from policestationagent.com...');
    
    await page.goto('https://policestationagent.com/faq', { 
      waitUntil: 'networkidle0', 
      timeout: 30000 
    });
    await new Promise(r => setTimeout(r, 5000));
    
    // Click all accordion items to expand them
    const faqData = await page.evaluate(async () => {
      const results = [];
      
      // Find all accordion buttons
      const buttons = document.querySelectorAll('button[class*="flex"]');
      const accordionButtons = Array.from(buttons).filter(btn => 
        btn.textContent.includes('?') && 
        btn.querySelector('svg[class*="chevron"]')
      );
      
      console.log(`Found ${accordionButtons.length} accordion buttons`);
      
      // Click each button and extract content
      for (let i = 0; i < accordionButtons.length; i++) {
        const btn = accordionButtons[i];
        const question = btn.textContent.trim().replace(/\s+/g, ' ');
        
        // Click to expand
        btn.click();
        await new Promise(r => setTimeout(r, 500));
        
        // Find the content div
        let content = '';
        const parent = btn.closest('[class*="rounded"]');
        if (parent) {
          const contentDiv = parent.querySelector('[class*="prose"]') || 
                            parent.querySelector('p') ||
                            parent.nextElementSibling;
          if (contentDiv) {
            content = contentDiv.textContent.trim() || contentDiv.innerHTML;
          }
        }
        
        results.push({ question, content });
      }
      
      return results;
    });
    
    console.log('Extracted FAQ data:', JSON.stringify(faqData, null, 2));
    
    // Save to file
    const fs = require('fs');
    fs.writeFileSync('faq-content.json', JSON.stringify(faqData, null, 2));
    console.log('✅ Saved to faq-content.json');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

scrapeFAQ().catch(console.error);

















