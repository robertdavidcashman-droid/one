#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const stations = [
  // East Kent
  { name: 'Canterbury', route: 'canterbury-police-station', original: 'canterbury-police-station' },
  { name: 'Folkestone', route: 'folkestone-police-station', original: 'folkestone-police-station' },
  { name: 'Dover', route: 'dover-police-station', original: 'dover-police-station' },
  { name: 'Margate', route: 'margate-police-station', original: 'margate-police-station' },
  
  // West Kent
  { name: 'Tonbridge', route: 'tonbridge-police-station', original: 'tonbridge-police-station' },
  { name: 'Maidstone', route: 'maidstone-police-station', original: 'maidstone-police-station' },
  { name: 'Sevenoaks', route: 'sevenoaks-police-station', original: 'sevenoaks-police-station' },
  { name: 'Tunbridge Wells', route: 'tunbridge-wells-police-station', original: 'tunbridge-wells-police-station' },
  
  // North Kent
  { name: 'Medway', route: 'medway-police-station', original: 'medway-police-station' },
  { name: 'North Kent (Gravesend)', route: 'north-kent-gravesend-police-station', original: 'north-kent-gravesend-police-station' },
  { name: 'Swanley', route: 'swanley-police-station', original: 'swanley-police-station' },
  { name: 'Bluewater', route: 'bluewater-police-station', original: 'bluewater-police-station' },
  { name: 'Sittingbourne', route: 'sittingbourne-police-station', original: 'sittingbourne-police-station' },
  { name: 'Ashford', route: 'ashford-police-station', original: 'ashford-police-station' },
  { name: 'Coldharbour', route: 'coldharbour-police-station', original: 'coldharbour-police-station' },
];

async function checkPage(browser, station) {
  const page = await browser.newPage();
  
  try {
    const url = `https://policestationagent.com/${station.original}`;
    console.log(`Checking ${station.name}...`);
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    const is404 = await page.evaluate(() => {
      return document.body.textContent.includes('404') || 
             document.body.textContent.includes('Page Not Found') ||
             document.title.includes('404');
    });
    
    if (is404) {
      console.log(`  ⚠️  404 on original site`);
      return { exists: false, station };
    }
    
    const title = await page.title();
    console.log(`  ✅ Exists: ${title.substring(0, 60)}...`);
    return { exists: true, station, title };
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return { exists: false, station, error: error.message };
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('Comparing police station pages with original site...\n');
  
  const browser = await puppeteer.launch({ headless: true });
  const results = [];
  
  for (const station of stations) {
    const result = await checkPage(browser, station);
    results.push(result);
    await new Promise(r => setTimeout(r, 1000)); // Rate limiting
  }
  
  await browser.close();
  
  console.log(`\n=== Summary ===`);
  const existing = results.filter(r => r.exists);
  const missing = results.filter(r => !r.exists);
  
  console.log(`✅ Pages exist on original site: ${existing.length}/${stations.length}`);
  console.log(`⚠️  Pages missing on original site: ${missing.length}`);
  
  if (missing.length > 0) {
    console.log(`\n⚠️  Missing on original site:`);
    missing.forEach(r => console.log(`  - ${r.station.name} (${r.station.original})`));
  }
}

main().catch(console.error);







