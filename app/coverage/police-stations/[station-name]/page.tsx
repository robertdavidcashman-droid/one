import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BreadcrumbList } from '@/components/StructuredData';

// Station data - factual information only
const STATIONS: Record<string, {
  name: string;
  address: string;
  custodyType: '24-hour Custody' | 'Voluntary Interviews Only' | 'Tactical Operations Base';
  areaCovered: string;
  notes: string;
}> = {
  'medway': {
    name: 'Medway',
    address: 'Purser Way, Gillingham ME7 1NE',
    custodyType: '24-hour Custody',
    areaCovered: 'Medway',
    notes: 'Main Medway custody suite'
  },
  'north-kent-gravesend': {
    name: 'North Kent (Gravesend)',
    address: 'Thames Way, Northfleet DA11 8BD',
    custodyType: '24-hour Custody',
    areaCovered: 'North Kent',
    notes: 'North Kent custody suite'
  },
  'canterbury': {
    name: 'Canterbury',
    address: 'Old Dover Road, Canterbury',
    custodyType: '24-hour Custody',
    areaCovered: 'East Kent',
    notes: 'East Kent 24-hour custody suite'
  },
  'folkestone': {
    name: 'Folkestone',
    address: 'Bouverie House, Folkestone',
    custodyType: '24-hour Custody',
    areaCovered: 'East Kent',
    notes: 'South coast 24-hour custody suite'
  },
  'maidstone': {
    name: 'Maidstone',
    address: 'Palace Avenue, Maidstone ME15 6NF',
    custodyType: 'Voluntary Interviews Only',
    areaCovered: 'Mid Kent',
    notes: 'Custody closed October 2025 – voluntary interviews only'
  },
  'tonbridge': {
    name: 'Tonbridge',
    address: '1 Pembury Road, Tonbridge TN9 2HS',
    custodyType: '24-hour Custody',
    areaCovered: 'West Kent',
    notes: 'West Kent 24-hour custody suite'
  },
  'ashford': {
    name: 'Ashford',
    address: 'Tufton Street, Ashford',
    custodyType: 'Voluntary Interviews Only',
    areaCovered: 'Mid Kent',
    notes: 'Voluntary interview station'
  },
  'dover': {
    name: 'Dover',
    address: 'Park Place, Dover',
    custodyType: 'Voluntary Interviews Only',
    areaCovered: 'East Kent',
    notes: 'Voluntary interview station'
  },
  'margate': {
    name: 'Margate',
    address: 'Fort Hill, Margate',
    custodyType: '24-hour Custody',
    areaCovered: 'East Kent',
    notes: 'Thanet 24-hour custody suite'
  },
  'sevenoaks': {
    name: 'Sevenoaks',
    address: 'Argyle Road, Sevenoaks TN13 1HG',
    custodyType: 'Voluntary Interviews Only',
    areaCovered: 'West Kent',
    notes: 'Voluntary interview station'
  },
  'sittingbourne': {
    name: 'Sittingbourne',
    address: 'Central Avenue, Sittingbourne',
    custodyType: 'Voluntary Interviews Only',
    areaCovered: 'North Kent',
    notes: 'Voluntary interview station'
  },
  'swanley': {
    name: 'Swanley',
    address: 'London Road, Swanley BR8 7AJ',
    custodyType: 'Voluntary Interviews Only',
    areaCovered: 'North West Kent',
    notes: 'Voluntary interview station'
  },
  'tunbridge-wells': {
    name: 'Tunbridge Wells',
    address: 'Crescent Road, Tunbridge Wells',
    custodyType: 'Voluntary Interviews Only',
    areaCovered: 'West Kent',
    notes: 'Voluntary interview station'
  },
  'coldharbour': {
    name: 'Coldharbour',
    address: 'London Road, Maidstone',
    custodyType: 'Tactical Operations Base',
    areaCovered: 'Maidstone',
    notes: 'Tactical operations (not public custody)'
  }
};

interface PageProps {
  params: {
    'station-name': string;
  };
}

function getStationData(stationName: string) {
  return STATIONS[stationName];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const station = getStationData(params['station-name']);
  
  if (!station) {
    return {
      title: 'Police Station Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://criminaldefencekent.co.uk';
  
  const custodyDescription = station.custodyType === '24-hour Custody' 
    ? '24-hour custody facility' 
    : station.custodyType === 'Voluntary Interviews Only' 
      ? 'Voluntary interview station' 
      : 'Tactical operations base';
  
  return {
    title: `${station.name} Police Station - Police Station Coverage`,
    description: `Information about ${station.name} Police Station. ${custodyDescription}. Located in ${station.areaCovered}. Criminal defence representation available.`,
    alternates: {
      canonical: `${siteUrl}/coverage/police-stations/${params['station-name']}`,
    },
    openGraph: {
      title: `${station.name} Police Station - Police Station Coverage`,
      description: `Information about ${station.name} Police Station. ${custodyDescription}. Located in ${station.areaCovered}.`,
      url: `${siteUrl}/coverage/police-stations/${params['station-name']}`,
      siteName: 'Police Station Agent',
      type: 'website',
    },
  };
}

function getCustodyExplanation(custodyType: string): string {
  switch (custodyType) {
    case '24-hour Custody':
      return 'This police station operates a 24-hour custody suite. Individuals who are arrested may be brought here for booking, detention, and interview. The custody suite is staffed around the clock to process arrests and conduct interviews under the Police and Criminal Evidence Act 1984 (PACE).';
    case 'Voluntary Interviews Only':
      return 'This police station conducts voluntary interviews only. The custody suite is not operational for arrests. Individuals may be invited to attend voluntarily for a police interview under caution. Voluntary interviews are conducted under the Police and Criminal Evidence Act 1984 (PACE) Code C.';
    case 'Tactical Operations Base':
      return 'This facility is used for tactical operations and is not a public-facing custody suite. It is not used for routine arrests or voluntary interviews.';
    default:
      return '';
  }
}

function getAreaLink(areaCovered: string): string {
  const areaMap: Record<string, string> = {
    'Medway': 'medway',
    'North Kent': 'north-kent',
    'East Kent': 'east-kent',
    'Mid Kent': 'mid-kent',
    'West Kent': 'west-kent',
    'North West Kent': 'north-west-kent',
    'Maidstone': 'maidstone'
  };
  return areaMap[areaCovered] || areaCovered.toLowerCase().replace(/\s+/g, '-');
}

export default function PoliceStationPage({ params }: PageProps) {
  const station = getStationData(params['station-name']);

  if (!station) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://criminaldefencekent.co.uk';
  const custodyExplanation = getCustodyExplanation(station.custodyType);
  const areaLink = getAreaLink(station.areaCovered);

  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Coverage', url: `${siteUrl}/coverage` },
    { name: 'Police Stations', url: `${siteUrl}/coverage/police-stations` },
    { name: station.name, url: `${siteUrl}/coverage/police-stations/${params['station-name']}` },
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
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{station.name} Police Station</h1>
              <div className="flex items-center gap-2 text-blue-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin w-5 h-5">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <p className="text-lg">{station.address}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold bg-blue-500/20 border-blue-300/50 text-blue-100">
                  {station.custodyType}
                </span>
                <Link 
                  href={`/coverage/areas/${areaLink}`}
                  className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold bg-white/10 border-white/30 text-white hover:bg-white/20 transition-colors"
                >
                  {station.areaCovered}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-xl mb-8 border-l-4 border-blue-600 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-slate-800">About {station.name} Police Station</h2>
              <p className="text-slate-700 leading-relaxed text-lg mb-4">
                {station.notes}
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                {custodyExplanation}
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl mb-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Station Details</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="font-semibold text-slate-800 mb-1">Address</dt>
                  <dd className="text-slate-700">{station.address}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-800 mb-1">Facility Type</dt>
                  <dd className="text-slate-700">{station.custodyType}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-800 mb-1">Area Covered</dt>
                  <dd className="text-slate-700">
                    <Link href={`/coverage/areas/${areaLink}`} className="text-blue-600 hover:text-blue-800 underline">
                      {station.areaCovered}
                    </Link>
                  </dd>
                </div>
              </dl>
            </div>

            {station.custodyType === '24-hour Custody' && (
              <div className="bg-blue-50 p-8 rounded-xl mb-8 border border-blue-200">
                <h2 className="text-2xl font-bold mb-4 text-slate-800">24-Hour Custody Operations</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  This custody suite operates 24 hours a day, seven days a week. Individuals who are arrested may be brought here at any time for:
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
                  <li>Booking-in procedures</li>
                  <li>Detention under the Police and Criminal Evidence Act 1984</li>
                  <li>Police interviews under caution</li>
                  <li>Medical assessments where required</li>
                  <li>Bail considerations</li>
                </ul>
                <p className="text-slate-700 leading-relaxed text-sm italic">
                  Information about custody procedures is subject to current police operational policies and the Police and Criminal Evidence Act 1984 (PACE).
                </p>
              </div>
            )}

            {station.custodyType === 'Voluntary Interviews Only' && (
              <div className="bg-amber-50 p-8 rounded-xl mb-8 border border-amber-200">
                <h2 className="text-2xl font-bold mb-4 text-slate-800">Voluntary Interviews</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  This station conducts voluntary interviews only. The custody suite is not operational for arrests. If you are invited to attend a voluntary interview, you have the right to:
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
                  <li>Free legal advice under the Legal Aid scheme</li>
                  <li>Have a solicitor present during the interview</li>
                  <li>Request an appropriate adult if you are a juvenile or vulnerable adult</li>
                  <li>Understand the caution and what it means</li>
                </ul>
                <p className="text-slate-700 leading-relaxed text-sm italic">
                  Voluntary interviews are conducted under PACE Code C. You are not under arrest, but anything you say may be used in evidence.
                </p>
              </div>
            )}

            <div className="bg-slate-50 p-8 rounded-xl mb-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Legal Representation</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you are arrested or invited to attend a voluntary interview at {station.name} Police Station, you have the right to free legal advice under the Legal Aid scheme. A duty solicitor can be arranged to attend the station to provide advice and representation.
              </p>
              <p className="text-slate-700 leading-relaxed text-sm italic mb-4">
                Legal Aid is available for police station representation regardless of your financial circumstances. The duty solicitor scheme ensures access to legal advice during police interviews.
              </p>
              <div className="mt-6">
                <Link
                  href={`/coverage/areas/${areaLink}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  Learn more about criminal defence in {station.areaCovered}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-4 h-4 ml-2">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl mb-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-4 text-slate-800">References</h2>
              <ul className="space-y-2 text-sm text-slate-700">
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
                  <a href="https://www.gov.uk/legal-aid" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                    GOV.UK - Legal Aid information
                  </a>
                </li>
                <li>
                  Police and Criminal Evidence Act 1984 (PACE) - Code C
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Need Legal Advice?</h2>
              <p className="text-blue-100 mb-4">
                If you need legal representation at {station.name} Police Station, contact us for free legal advice under the Legal Aid scheme.
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





























