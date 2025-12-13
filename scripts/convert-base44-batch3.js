const fs = require('fs').promises;
const path = require('path');

// Base44 export content - these need to be converted to Next.js
const pagesToConvert = {
  'ashford-police-station': {
    route: 'app/ashford-police-station/page.tsx',
    // Will use PoliceStationPageLayout component
  },
  'bluewater-police-station': {
    route: 'app/bluewater-police-station/page.tsx',
  },
  'sittingbourne-police-station': {
    route: 'app/sittingbourne-police-station/page.tsx',
  },
  'swanley-police-station': {
    route: 'app/swanley-police-station/page.tsx',
  },
  'coldharbour-police-station': {
    route: 'app/coldharbour-police-station/page.tsx',
  },
  'services-for-clients': {
    route: 'app/services-for-clients/page.tsx',
    altRoute: 'app/for-clients/page.tsx',
  },
  'services-for-solicitors': {
    route: 'app/services-for-solicitors/page.tsx',
    altRoute: 'app/for-solicitors/page.tsx',
  },
  'extended-hours': {
    route: 'app/extended-hours/page.tsx',
    altRoute: 'app/extendedhours/page.tsx',
  },
  'rep-cover': {
    route: 'app/rep-cover/page.tsx',
    altRoute: 'app/repcover/page.tsx',
  },
  'accredited-police-rep': {
    route: 'app/accredited-police-rep/page.tsx',
    altRoute: 'app/accreditedpolicerep/page.tsx',
  },
};

console.log('📋 Pages to convert from Base44 Batch 3:');
Object.keys(pagesToConvert).forEach(key => {
  const page = pagesToConvert[key];
  console.log(`  - ${key} → ${page.route}${page.altRoute ? ` (or ${page.altRoute})` : ''}`);
});

console.log('\n✅ Conversion plan ready. Use the Base44 exported code to create proper Next.js components.');



