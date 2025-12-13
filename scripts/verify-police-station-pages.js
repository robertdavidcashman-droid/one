#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const stations = [
  // East Kent
  { name: 'Canterbury', route: 'canterbury-police-station', type: 'Custody Suite' },
  { name: 'Folkestone', route: 'folkestone-police-station', type: 'Custody Suite' },
  { name: 'Dover', route: 'dover-police-station', type: 'Voluntary' },
  { name: 'Margate', route: 'margate-police-station', type: 'Voluntary' },
  
  // West Kent
  { name: 'Tonbridge', route: 'tonbridge-police-station', type: 'Custody Suite' },
  { name: 'Maidstone', route: 'maidstone-police-station', type: 'Voluntary' },
  { name: 'Sevenoaks', route: 'sevenoaks-police-station', type: 'Voluntary' },
  { name: 'Tunbridge Wells', route: 'tunbridge-wells-police-station', type: 'Voluntary' },
  
  // North Kent
  { name: 'Medway', route: 'medway-police-station', type: 'Major Custody' },
  { name: 'North Kent (Gravesend)', route: 'north-kent-gravesend-police-station', type: 'Custody Suite' },
  { name: 'Swanley', route: 'swanley-police-station', type: 'Voluntary' },
  { name: 'Bluewater', route: 'bluewater-police-station', type: 'Voluntary' },
  { name: 'Sittingbourne', route: 'sittingbourne-police-station', type: 'Voluntary' },
  { name: 'Ashford', route: 'ashford-police-station', type: 'Voluntary' },
  { name: 'Coldharbour', route: 'coldharbour-police-station', type: 'Voluntary' },
];

console.log('Verifying police station pages...\n');

let missing = [];
let empty = [];
let found = [];

stations.forEach(station => {
  const filePath = path.join(__dirname, '..', 'app', station.route, 'page.tsx');
  
  if (!fs.existsSync(filePath)) {
    missing.push(station);
    console.log(`❌ MISSING: ${station.name} (${station.route})`);
  } else {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if content is empty or just has a 404
    if (content.includes('Page Not Found') || content.includes('404') || 
        content.length < 2000 || !content.includes('dangerouslySetInnerHTML')) {
      empty.push(station);
      console.log(`⚠️  EMPTY/404: ${station.name} (${station.route})`);
    } else {
      found.push(station);
      console.log(`✅ FOUND: ${station.name} (${station.route}) - ${station.type}`);
    }
  }
});

console.log(`\n=== Summary ===`);
console.log(`✅ Complete: ${found.length}/${stations.length}`);
console.log(`⚠️  Empty/404: ${empty.length}`);
console.log(`❌ Missing: ${missing.length}`);

if (empty.length > 0) {
  console.log(`\n⚠️  Pages that need content:`);
  empty.forEach(s => console.log(`  - ${s.name} (${s.route})`));
}

if (missing.length > 0) {
  console.log(`\n❌ Missing pages:`);
  missing.forEach(s => console.log(`  - ${s.name} (${s.route})`));
}







