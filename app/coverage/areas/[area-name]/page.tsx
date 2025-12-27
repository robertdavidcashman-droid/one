import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BreadcrumbList } from '@/components/StructuredData';

// Area data with associated police stations
const AREAS: Record<string, {
  name: string;
  displayName: string;
  stations: Array<{ name: string; slug: string; type: string }>;
}> = {
  'medway': {
    name: 'Medway',
    displayName: 'Medway',
    stations: [
      { name: 'Medway', slug: 'medway', type: '24-hour Custody' }
    ]
  },
  'north-kent': {
    name: 'North Kent',
    displayName: 'North Kent',
    stations: [
      { name: 'North Kent (Gravesend)', slug: 'north-kent-gravesend', type: '24-hour Custody' },
      { name: 'Sittingbourne', slug: 'sittingbourne', type: 'Voluntary Interviews' }
    ]
  },
  'east-kent': {
    name: 'East Kent',
    displayName: 'East Kent',
    stations: [
      { name: 'Canterbury', slug: 'canterbury', type: '24-hour Custody' },
      { name: 'Folkestone', slug: 'folkestone', type: '24-hour Custody' },
      { name: 'Margate', slug: 'margate', type: '24-hour Custody' },
      { name: 'Dover', slug: 'dover', type: 'Voluntary Interviews' }
    ]
  },
  'mid-kent': {
    name: 'Mid Kent',
    displayName: 'Mid Kent',
    stations: [
      { name: 'Maidstone', slug: 'maidstone', type: 'Voluntary Interviews' },
      { name: 'Ashford', slug: 'ashford', type: 'Voluntary Interviews' }
    ]
  },
  'west-kent': {
    name: 'West Kent',
    displayName: 'West Kent',
    stations: [
      { name: 'Tonbridge', slug: 'tonbridge', type: '24-hour Custody' },
      { name: 'Sevenoaks', slug: 'sevenoaks', type: 'Voluntary Interviews' },
      { name: 'Tunbridge Wells', slug: 'tunbridge-wells', type: 'Voluntary Interviews' }
    ]
  },
  'north-west-kent': {
    name: 'North West Kent',
    displayName: 'North West Kent',
    stations: [
      { name: 'Swanley', slug: 'swanley', type: 'Voluntary Interviews' }
    ]
  },
  'maidstone': {
    name: 'Maidstone',
    displayName: 'Maidstone',
    stations: [
      { name: 'Maidstone', slug: 'maidstone', type: 'Voluntary Interviews' },
      { name: 'Coldharbour', slug: 'coldharbour', type: 'Tactical Operations' }
    ]
  }
};

// Area-specific city/town mappings for solicitor pages
const AREA_DETAILS: Record<string, {
  description: string;
  cities: string[];
}> = {
  'medway': {
    description: 'Medway includes the towns of Chatham, Gillingham, Rochester, Strood, and Rainham. The area is served by Medway Police Station, which operates a 24-hour custody suite.',
    cities: ['Chatham', 'Gillingham', 'Rochester', 'Strood', 'Rainham']
  },
  'north-kent': {
    description: 'North Kent covers areas including Gravesend, Dartford, and Sittingbourne. The main custody facility is at North Kent (Gravesend) Police Station, with additional voluntary interview facilities at Sittingbourne.',
    cities: ['Gravesend', 'Dartford', 'Sittingbourne']
  },
  'east-kent': {
    description: 'East Kent covers the coastal and rural areas including Canterbury, Folkestone, Margate, and Dover. Major custody facilities operate at Canterbury, Folkestone, and Margate police stations.',
    cities: ['Canterbury', 'Folkestone', 'Margate', 'Dover', 'Ramsgate', 'Deal', 'Sandwich']
  },
  'mid-kent': {
    description: 'Mid Kent includes Maidstone, Ashford, and surrounding areas. Both Maidstone and Ashford police stations conduct voluntary interviews only, following the closure of custody facilities.',
    cities: ['Maidstone', 'Ashford']
  },
  'west-kent': {
    description: 'West Kent covers Tonbridge, Sevenoaks, and Tunbridge Wells. The main custody facility is at Tonbridge Police Station, with voluntary interview facilities at Sevenoaks and Tunbridge Wells.',
    cities: ['Tonbridge', 'Sevenoaks', 'Tunbridge Wells']
  },
  'north-west-kent': {
    description: 'North West Kent includes Swanley and surrounding areas near the London border. Swanley Police Station conducts voluntary interviews only.',
    cities: ['Swanley']
  },
  'maidstone': {
    description: 'Maidstone is the county town of Kent. The town is served by Maidstone Police Station for voluntary interviews and the Coldharbour Police Complex for tactical operations.',
    cities: ['Maidstone']
  }
};

interface PageProps {
  params: {
    'area-name': string;
  };
}

function getAreaData(areaName: string) {
  return AREAS[areaName];
}

function getAreaDetails(areaName: string) {
  return AREA_DETAILS[areaName] || { description: '', cities: [] };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const area = getAreaData(params['area-name']);
  
  if (!area) {
    return {
      title: 'Area Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://criminaldefencekent.co.uk';
  
  return {
    title: `${area.displayName} Criminal Solicitor | Police Station Representation`,
    description: `Criminal defence representation in ${area.displayName}. Information about police station coverage, duty solicitor services, and legal aid in ${area.displayName}.`,
    alternates: {
      canonical: `${siteUrl}/coverage/areas/${params['area-name']}`,
    },
    openGraph: {
      title: `${area.displayName} Criminal Solicitor | Police Station Representation`,
      description: `Criminal defence representation in ${area.displayName}. Information about police station coverage, duty solicitor services, and legal aid.`,
      url: `${siteUrl}/coverage/areas/${params['area-name']}`,
      siteName: 'Police Station Agent',
      type: 'website',
    },
  };
}

export default function AreaPage({ params }: PageProps) {
  const area = getAreaData(params['area-name']);
  const details = getAreaDetails(params['area-name']);

  if (!area) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://criminaldefencekent.co.uk';
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Coverage', url: `${siteUrl}/coverage` },
    { name: 'Areas', url: `${siteUrl}/coverage/areas` },
    { name: area.displayName, url: `${siteUrl}/coverage/areas/${params['area-name']}` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <BreadcrumbList items={breadcrumbItems} />
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Link 
                href="/coverage" 
                className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-5 h-5">
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
                Back to Coverage
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Criminal Defence Representation in {area.displayName}</h1>
              <p className="text-xl text-blue-100">
                Information about police station representation and criminal defence services in {area.displayName}
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-xl mb-8 border-l-4 border-blue-600 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Criminal Defence in {area.displayName}</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                {details.description || `Criminal defence representation is available across ${area.displayName} through the duty solicitor scheme and private representation.`}
              </p>
              
              {details.cities.length > 0 && (
                <div className="mt-4">
                  <p className="text-slate-700 font-medium mb-2">Areas covered include:</p>
                  <p className="text-slate-600">{details.cities.join(', ')}</p>
                </div>
              )}
            </div>

            <div className="bg-white p-8 rounded-xl mb-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Police Stations in {area.displayName}</h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                The following police stations serve {area.displayName}:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {area.stations.map((station) => (
                  <Link
                    key={station.slug}
                    href={`/coverage/police-stations/${station.slug}`}
                    className="block p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-slate-800 mb-2">{station.name} Police Station</h3>
                    <p className="text-sm text-slate-600">{station.type}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-xl mb-8 border border-blue-200">
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Duty Solicitor Scheme</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Under the Legal Aid scheme, you have the right to free legal advice if you are:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
                <li>Arrested and held in police custody</li>
                <li>Invited to attend a voluntary interview under caution</li>
                <li>Questioned by police about a criminal offence</li>
              </ul>
              <p className="text-slate-700 leading-relaxed text-sm italic">
                Legal Aid for police station representation is not means-tested. This means legal advice is free at the police station regardless of your financial circumstances. The duty solicitor scheme ensures access to legal representation when you need it most.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl mb-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-4 text-slate-800">What Happens at a Police Station</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you are arrested or attend a voluntary interview, you will typically:
              </p>
              <ol className="list-decimal list-inside text-slate-700 space-y-2 mb-4">
                <li>Be informed of your rights, including the right to legal advice</li>
                <li>Have the opportunity to contact a solicitor</li>
                <li>Be interviewed under caution, during which you have the right to have a solicitor present</li>
                <li>Receive a decision on bail, charge, or release</li>
              </ol>
              <p className="text-slate-700 leading-relaxed text-sm italic mb-4">
                These procedures are governed by the Police and Criminal Evidence Act 1984 (PACE) and its codes of practice. The duty solicitor will explain your rights and provide advice throughout the process.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl mb-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-4 text-slate-800">References</h2>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>
                  <a href="https://www.gov.uk/legal-aid" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                    GOV.UK - Legal Aid information
                  </a>
                </li>
                <li>
                  <a href="https://www.gov.uk/police-powers-of-arrest-your-rights" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                    GOV.UK - Police powers of arrest and your rights
                  </a>
                </li>
                <li>
                  <a href="https://www.kent.police.uk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                    Kent Police - Official website
                  </a>
                </li>
                <li>
                  Police and Criminal Evidence Act 1984 (PACE) - Code C and Code G
                </li>
                <li>
                  Legal Aid Agency - Duty Solicitor Arrangements
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Need Legal Representation in {area.displayName}?</h2>
              <p className="text-blue-100 mb-4">
                If you need criminal defence representation in {area.displayName}, contact us for free legal advice under the Legal Aid scheme.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="tel:01732247427"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition inline-flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone w-5 h-5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Call 01732 247427
                </a>
                <Link
                  href="/contact"
                  className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition inline-flex items-center gap-2"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}





























