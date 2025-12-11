// Script to seed initial data from policestationagent.com
// Run with: node scripts/seed-data.js

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'data', 'web44ai.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS police_stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    address TEXT,
    phone TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Police Stations from your files
const policeStations = [
  {
    name: 'Maidstone Police Station',
    slug: 'maidstone',
    address: 'Palace Avenue, Maidstone, Kent ME15 6NF',
    phone: null,
    content: `<p>We provide expert legal representation at Maidstone Police Station. Our experienced solicitors are available 24/7 to assist with urgent police station matters.</p>
    <p>If you or someone you know has been arrested or is being questioned at Maidstone Police Station, it's crucial to have professional legal representation. We understand the stress and uncertainty that comes with police station attendance, and we're here to protect your rights and provide expert guidance.</p>
    <h2>Why Choose Us for Maidstone Police Station Representation?</h2>
    <ul>
      <li>24/7 availability for urgent matters</li>
      <li>Experienced criminal defense solicitors</li>
      <li>Expert knowledge of police station procedures</li>
      <li>Protection of your legal rights</li>
      <li>Professional and confidential service</li>
    </ul>
    <p>Contact us immediately if you need legal representation at Maidstone Police Station.</p>`
  },
  {
    name: 'Medway Police Station',
    slug: 'medway',
    address: 'Medway Police Station, Kent',
    phone: null,
    content: `<p>Expert legal representation is available at Medway Police Station. Our experienced solicitors provide professional assistance for all police station matters in the Medway area.</p>
    <p>If you've been arrested or are being questioned at Medway Police Station, having a solicitor present is essential to protect your rights and ensure you receive the best possible outcome.</p>
    <h2>Our Services at Medway Police Station</h2>
    <ul>
      <li>24/7 police station attendance</li>
      <li>Expert legal advice during questioning</li>
      <li>Bail applications and advice</li>
      <li>Protection of your legal rights</li>
      <li>Experienced criminal defense solicitors</li>
    </ul>
    <p>Contact us immediately if you need legal representation at Medway Police Station.</p>`
  },
  {
    name: 'Canterbury Police Station',
    slug: 'canterbury',
    address: 'Canterbury Police Station, Kent',
    phone: null,
    content: `<p>Professional legal representation is available at Canterbury Police Station. Our team of experienced solicitors understands the importance of having expert legal support during police station attendance.</p>
    <p>Whether you've been arrested, are being questioned, or need advice about a police matter, we're here to help. We provide clear, practical legal advice and representation to protect your interests.</p>
    <h2>Legal Representation at Canterbury Police Station</h2>
    <ul>
      <li>Immediate response to police station calls</li>
      <li>Expert legal advice during interviews</li>
      <li>Protection of your legal rights</li>
      <li>Available 24/7 for urgent matters</li>
      <li>Professional and confidential service</li>
    </ul>
    <p>Don't face police questioning alone. Contact us for expert legal representation at Canterbury Police Station.</p>`
  },
  {
    name: 'Gravesend Police Station',
    slug: 'gravesend',
    address: 'Gravesend Police Station, Kent',
    phone: null,
    content: `<p>We provide expert legal representation at Gravesend Police Station. Our experienced solicitors are available 24/7 to assist with urgent police station matters.</p>
    <p>If you or someone you know has been arrested or is being questioned at Gravesend Police Station, it's crucial to have professional legal representation. We understand the stress and uncertainty that comes with police station attendance.</p>
    <h2>Why Choose Us for Gravesend Police Station Representation?</h2>
    <ul>
      <li>24/7 availability for urgent matters</li>
      <li>Experienced criminal defense solicitors</li>
      <li>Expert knowledge of police station procedures</li>
      <li>Protection of your legal rights</li>
      <li>Professional and confidential service</li>
    </ul>
    <p>Contact us immediately if you need legal representation at Gravesend Police Station.</p>`
  },
  {
    name: 'Tonbridge Police Station',
    slug: 'tonbridge',
    address: 'Tonbridge Police Station, Kent',
    phone: null,
    content: `<p>Expert legal representation is available at Tonbridge Police Station. Our experienced solicitors understand the importance of having professional legal support during police station attendance.</p>
    <p>Whether you've been arrested, are being questioned, or need advice about a police matter, our team is here to help. We provide clear, practical legal advice and representation to protect your interests.</p>
    <h2>Legal Representation at Tonbridge Police Station</h2>
    <ul>
      <li>Immediate response to police station calls</li>
      <li>Expert legal advice during interviews</li>
      <li>Protection of your legal rights</li>
      <li>Experienced criminal defense solicitors</li>
      <li>Available 24/7 for urgent matters</li>
    </ul>
    <p>Don't face police questioning alone. Contact us for expert legal representation at Tonbridge Police Station.</p>`
  },
  {
    name: 'Sittingbourne Police Station',
    slug: 'sittingbourne',
    address: 'Sittingbourne Police Station, Kent',
    phone: null,
    content: `<p>Professional legal representation is available at Sittingbourne Police Station. Our team of experienced solicitors provides expert assistance for all police station matters.</p>
    <p>Being questioned at a police station can be a daunting experience. Having the right legal representation is essential to ensure your rights are protected and you receive the best possible outcome.</p>
    <h2>Our Services at Sittingbourne Police Station</h2>
    <ul>
      <li>Police station attendance and representation</li>
      <li>Legal advice during questioning</li>
      <li>Bail applications</li>
      <li>Charge advice</li>
      <li>24/7 emergency service</li>
    </ul>
    <p>We're available around the clock to provide immediate legal assistance at Sittingbourne Police Station.</p>`
  },
  {
    name: 'Swanley Police Station',
    slug: 'swanley',
    address: 'Swanley Police Station, Kent',
    phone: null,
    content: `<p>We provide expert legal representation at Swanley Police Station. Our experienced solicitors are available 24/7 to assist with urgent police station matters.</p>
    <p>If you or someone you know has been arrested or is being questioned at Swanley Police Station, it's crucial to have professional legal representation. We're here to protect your rights and provide expert guidance.</p>
    <h2>Why Choose Us for Swanley Police Station Representation?</h2>
    <ul>
      <li>24/7 availability for urgent matters</li>
      <li>Experienced criminal defense solicitors</li>
      <li>Expert knowledge of police station procedures</li>
      <li>Protection of your legal rights</li>
      <li>Professional and confidential service</li>
    </ul>
    <p>Contact us immediately if you need legal representation at Swanley Police Station.</p>`
  },
  {
    name: 'Ashford Police Station',
    slug: 'ashford',
    address: 'Ashford Police Station, Kent',
    phone: null,
    content: `<p>Expert legal representation is available at Ashford Police Station. Our experienced solicitors provide professional assistance for all police station matters.</p>
    <p>If you've been arrested or are being questioned at Ashford Police Station, having a solicitor present is essential to protect your rights and ensure you receive the best possible outcome.</p>
    <h2>Our Services at Ashford Police Station</h2>
    <ul>
      <li>24/7 police station attendance</li>
      <li>Expert legal advice during questioning</li>
      <li>Bail applications and advice</li>
      <li>Protection of your legal rights</li>
      <li>Experienced criminal defense solicitors</li>
    </ul>
    <p>Contact us immediately if you need legal representation at Ashford Police Station.</p>`
  },
  {
    name: 'Folkestone Police Station',
    slug: 'folkestone',
    address: 'Folkestone Police Station, Kent',
    phone: null,
    content: `<p>Professional legal representation is available at Folkestone Police Station. Our team of experienced solicitors understands the importance of having expert legal support during police station attendance.</p>
    <p>Whether you've been arrested, are being questioned, or need advice about a police matter, we're here to help. We provide clear, practical legal advice and representation to protect your interests.</p>
    <h2>Legal Representation at Folkestone Police Station</h2>
    <ul>
      <li>Immediate response to police station calls</li>
      <li>Expert legal advice during interviews</li>
      <li>Protection of your legal rights</li>
      <li>Available 24/7 for urgent matters</li>
      <li>Professional and confidential service</li>
    </ul>
    <p>Don't face police questioning alone. Contact us for expert legal representation at Folkestone Police Station.</p>`
  },
  {
    name: 'Dover Police Station',
    slug: 'dover',
    address: 'Dover Police Station, Kent',
    phone: null,
    content: `<p>We provide expert legal representation at Dover Police Station. Our experienced solicitors are available 24/7 to assist with urgent police station matters.</p>
    <p>If you or someone you know has been arrested or is being questioned at Dover Police Station, it's crucial to have professional legal representation. We understand the stress and uncertainty that comes with police station attendance.</p>
    <h2>Why Choose Us for Dover Police Station Representation?</h2>
    <ul>
      <li>24/7 availability for urgent matters</li>
      <li>Experienced criminal defense solicitors</li>
      <li>Expert knowledge of police station procedures</li>
      <li>Protection of your legal rights</li>
      <li>Professional and confidential service</li>
    </ul>
    <p>Contact us immediately if you need legal representation at Dover Police Station.</p>`
  },
  {
    name: 'Bluewater Police Station',
    slug: 'bluewater',
    address: 'Bluewater Police Station, Kent',
    phone: null,
    content: `<p>Expert legal representation is available at Bluewater Police Station. Our experienced solicitors provide professional assistance for all police station matters.</p>
    <p>If you've been arrested or are being questioned at Bluewater Police Station, having a solicitor present is essential to protect your rights and ensure you receive the best possible outcome.</p>
    <h2>Our Services at Bluewater Police Station</h2>
    <ul>
      <li>24/7 police station attendance</li>
      <li>Expert legal advice during questioning</li>
      <li>Bail applications and advice</li>
      <li>Protection of your legal rights</li>
      <li>Experienced criminal defense solicitors</li>
    </ul>
    <p>Contact us immediately if you need legal representation at Bluewater Police Station.</p>`
  },
  {
    name: 'Sevenoaks Police Station',
    slug: 'sevenoaks',
    address: 'Sevenoaks Police Station, Kent',
    phone: null,
    content: `<p>Professional legal representation is available at Sevenoaks Police Station. Our team of experienced solicitors understands the importance of having expert legal support during police station attendance.</p>
    <p>Whether you've been arrested, are being questioned, or need advice about a police matter, we're here to help. We provide clear, practical legal advice and representation to protect your interests.</p>
    <h2>Legal Representation at Sevenoaks Police Station</h2>
    <ul>
      <li>Immediate response to police station calls</li>
      <li>Expert legal advice during interviews</li>
      <li>Protection of your legal rights</li>
      <li>Available 24/7 for urgent matters</li>
      <li>Professional and confidential service</li>
    </ul>
    <p>Don't face police questioning alone. Contact us for expert legal representation at Sevenoaks Police Station.</p>`
  },
  {
    name: 'Tunbridge Wells Police Station',
    slug: 'tunbridge-wells',
    address: 'Tunbridge Wells Police Station, Kent',
    phone: null,
    content: `<p>We provide expert legal representation at Tunbridge Wells Police Station. Our experienced solicitors are available 24/7 to assist with urgent police station matters.</p>
    <p>If you or someone you know has been arrested or is being questioned at Tunbridge Wells Police Station, it's crucial to have professional legal representation. We're here to protect your rights and provide expert guidance.</p>
    <h2>Why Choose Us for Tunbridge Wells Police Station Representation?</h2>
    <ul>
      <li>24/7 availability for urgent matters</li>
      <li>Experienced criminal defense solicitors</li>
      <li>Expert knowledge of police station procedures</li>
      <li>Protection of your legal rights</li>
      <li>Professional and confidential service</li>
    </ul>
    <p>Contact us immediately if you need legal representation at Tunbridge Wells Police Station.</p>`
  },
  {
    name: 'Coldharbour Police Station',
    slug: 'coldharbour',
    address: 'Coldharbour Police Station, Kent',
    phone: null,
    content: `<p>Expert legal representation is available at Coldharbour Police Station. Our experienced solicitors provide professional assistance for all police station matters.</p>
    <p>If you've been arrested or are being questioned at Coldharbour Police Station, having a solicitor present is essential to protect your rights and ensure you receive the best possible outcome.</p>
    <h2>Our Services at Coldharbour Police Station</h2>
    <ul>
      <li>24/7 police station attendance</li>
      <li>Expert legal advice during questioning</li>
      <li>Bail applications and advice</li>
      <li>Protection of your legal rights</li>
      <li>Experienced criminal defense solicitors</li>
    </ul>
    <p>Contact us immediately if you need legal representation at Coldharbour Police Station.</p>`
  },
  {
    name: 'Margate Police Station',
    slug: 'margate',
    address: 'Margate Police Station, Kent',
    phone: null,
    content: `<p>Professional legal representation is available at Margate Police Station. Our team of experienced solicitors understands the importance of having expert legal support during police station attendance.</p>
    <p>Whether you've been arrested, are being questioned, or need advice about a police matter, we're here to help. We provide clear, practical legal advice and representation to protect your interests.</p>
    <h2>Legal Representation at Margate Police Station</h2>
    <ul>
      <li>Immediate response to police station calls</li>
      <li>Expert legal advice during interviews</li>
      <li>Protection of your legal rights</li>
      <li>Available 24/7 for urgent matters</li>
      <li>Professional and confidential service</li>
    </ul>
    <p>Don't face police questioning alone. Contact us for expert legal representation at Margate Police Station.</p>`
  },
  {
    name: 'North Kent Police Station',
    slug: 'north-kent',
    address: 'North Kent Police Station, Kent',
    phone: null,
    content: `<p>Professional legal representation is available at North Kent Police Station. Our team of experienced solicitors provides expert assistance for all police station matters.</p>
    <p>Being questioned at a police station can be a daunting experience. Having the right legal representation is essential to ensure your rights are protected and you receive the best possible outcome.</p>
    <h2>Our Services at North Kent Police Station</h2>
    <ul>
      <li>Police station attendance and representation</li>
      <li>Legal advice during questioning</li>
      <li>Bail applications</li>
      <li>Charge advice</li>
      <li>24/7 emergency service</li>
    </ul>
    <p>We're available around the clock to provide immediate legal assistance at North Kent Police Station.</p>`
  }
];

// Services
const services = [
  {
    title: 'Police Station Representation',
    slug: 'police-station-representation',
    description: 'Expert legal representation when you need it most. Available 24/7 for urgent matters.',
    content: `<h2>Police Station Representation</h2>
    <p>If you've been arrested or are being questioned at a police station, having expert legal representation is crucial. Our experienced solicitors are available 24/7 to provide immediate assistance.</p>
    
    <h3>Why You Need Legal Representation</h3>
    <p>Being questioned at a police station can be stressful and confusing. Having a solicitor present ensures:</p>
    <ul>
      <li>Your legal rights are protected</li>
      <li>You understand the questions being asked</li>
      <li>You receive expert legal advice</li>
      <li>Your interests are properly represented</li>
    </ul>
    
    <h3>Our Service Includes</h3>
    <ul>
      <li>24/7 availability for urgent matters</li>
      <li>Immediate attendance at police stations</li>
      <li>Expert legal advice during questioning</li>
      <li>Protection of your rights</li>
      <li>Professional and confidential service</li>
    </ul>
    
    <p>Contact us immediately if you or someone you know needs legal representation at a police station.</p>`
  },
  {
    title: 'Criminal Defense',
    slug: 'criminal-defense',
    description: 'Comprehensive criminal defense services with experienced solicitors.',
    content: `<h2>Criminal Defense Services</h2>
    <p>Our experienced criminal defense solicitors provide comprehensive representation for a wide range of criminal matters. We understand the serious consequences of criminal charges and work tirelessly to achieve the best possible outcome for our clients.</p>
    
    <h3>Areas of Expertise</h3>
    <ul>
      <li>Assault and violent offences</li>
      <li>Theft and fraud</li>
      <li>Drug offences</li>
      <li>Driving offences</li>
      <li>Public order offences</li>
      <li>And many other criminal matters</li>
    </ul>
    
    <h3>Our Approach</h3>
    <p>We provide:</p>
    <ul>
      <li>Expert legal advice from the outset</li>
      <li>Thorough case preparation</li>
      <li>Strong representation in court</li>
      <li>Clear communication throughout</li>
      <li>Dedicated support for you and your family</li>
    </ul>
    
    <p>If you're facing criminal charges, contact us for expert legal representation.</p>`
  },
  {
    title: 'Legal Advice',
    slug: 'legal-advice',
    description: 'Professional legal advice and guidance for all criminal matters.',
    content: `<h2>Legal Advice Services</h2>
    <p>Getting the right legal advice at the right time can make all the difference. Our experienced solicitors provide clear, practical legal advice for all criminal matters.</p>
    
    <h3>When You Need Legal Advice</h3>
    <p>You may need legal advice if:</p>
    <ul>
      <li>You've been arrested or questioned by police</li>
      <li>You're facing criminal charges</li>
      <li>You need to understand your legal rights</li>
      <li>You're unsure about a legal situation</li>
      <li>You need guidance on a criminal matter</li>
    </ul>
    
    <h3>What We Provide</h3>
    <ul>
      <li>Clear explanation of your legal position</li>
      <li>Expert advice on your options</li>
      <li>Guidance on police procedures</li>
      <li>Advice on court proceedings</li>
      <li>24/7 availability for urgent matters</li>
    </ul>
    
    <p>Don't navigate the legal system alone. Contact us for expert legal advice.</p>`
  }
];

// Insert police stations
console.log('Seeding police stations...');
for (const station of policeStations) {
  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO police_stations (name, slug, address, phone, content, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(station.name, station.slug, station.address, station.phone, station.content);
    console.log(`✓ Added: ${station.name}`);
  } catch (error) {
    console.error(`✗ Error adding ${station.name}:`, error.message);
  }
}

// Insert services
console.log('\nSeeding services...');
for (const service of services) {
  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO services (title, slug, description, content, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(service.title, service.slug, service.description, service.content);
    console.log(`✓ Added: ${service.title}`);
  } catch (error) {
    console.error(`✗ Error adding ${service.title}:`, error.message);
  }
}

console.log('\n✓ Data seeding completed!');
db.close();

