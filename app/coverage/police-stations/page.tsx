import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BreadcrumbList } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: "Police Stations - Coverage | Police Station Agent",
  description: "Information about police stations covered across Kent and Medway, including 24-hour custody suites and voluntary interview stations.",
  alternates: {
    canonical: "https://criminaldefencekent.co.uk/coverage/police-stations",
  },
};

const STATIONS = [
  { name: 'Medway', slug: 'medway', area: 'Medway', type: '24-hour Custody' },
  { name: 'North Kent (Gravesend)', slug: 'north-kent-gravesend', area: 'North Kent', type: '24-hour Custody' },
  { name: 'Canterbury', slug: 'canterbury', area: 'East Kent', type: '24-hour Custody' },
  { name: 'Folkestone', slug: 'folkestone', area: 'East Kent', type: '24-hour Custody' },
  { name: 'Margate', slug: 'margate', area: 'East Kent', type: '24-hour Custody' },
  { name: 'Tonbridge', slug: 'tonbridge', area: 'West Kent', type: '24-hour Custody' },
  { name: 'Maidstone', slug: 'maidstone', area: 'Mid Kent', type: 'Voluntary Interviews Only' },
  { name: 'Ashford', slug: 'ashford', area: 'Mid Kent', type: 'Voluntary Interviews' },
  { name: 'Dover', slug: 'dover', area: 'East Kent', type: 'Voluntary Interviews' },
  { name: 'Sevenoaks', slug: 'sevenoaks', area: 'West Kent', type: 'Voluntary Interviews' },
  { name: 'Sittingbourne', slug: 'sittingbourne', area: 'North Kent', type: 'Voluntary Interviews' },
  { name: 'Swanley', slug: 'swanley', area: 'North West Kent', type: 'Voluntary Interviews' },
  { name: 'Tunbridge Wells', slug: 'tunbridge-wells', area: 'West Kent', type: 'Voluntary Interviews' },
  { name: 'Coldharbour', slug: 'coldharbour', area: 'Maidstone', type: 'Tactical Operations Base' }
];

export default function PoliceStationsPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://criminaldefencekent.co.uk';
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Coverage', url: `${siteUrl}/coverage` },
    { name: 'Police Stations', url: `${siteUrl}/coverage/police-stations` },
  ];

  const custodyStations = STATIONS.filter(s => s.type.includes('24-hour'));
  const voluntaryStations = STATIONS.filter(s => s.type.includes('Voluntary'));
  const otherStations = STATIONS.filter(s => !s.type.includes('24-hour') && !s.type.includes('Voluntary'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <BreadcrumbList items={breadcrumbItems} />
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
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
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Police Stations</h1>
              <p className="text-xl text-blue-100">
                Information about police stations and custody facilities across Kent and Medway
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4 text-slate-800">24-Hour Custody Suites</h2>
              <p className="text-slate-600 mb-6">Police stations with operational 24-hour custody facilities:</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {custodyStations.map((station) => (
                  <Link
                    key={station.slug}
                    href={`/coverage/police-stations/${station.slug}`}
                    className="block p-6 border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all bg-white"
                  >
                    <h3 className="font-semibold text-lg text-slate-800 mb-2">{station.name}</h3>
                    <p className="text-sm text-slate-600 mb-2">{station.area}</p>
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                      {station.type}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4 text-slate-800">Voluntary Interview Stations</h2>
              <p className="text-slate-600 mb-6">Police stations that conduct voluntary interviews only:</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {voluntaryStations.map((station) => (
                  <Link
                    key={station.slug}
                    href={`/coverage/police-stations/${station.slug}`}
                    className="block p-6 border border-slate-200 rounded-xl hover:border-amber-500 hover:shadow-lg transition-all bg-white"
                  >
                    <h3 className="font-semibold text-lg text-slate-800 mb-2">{station.name}</h3>
                    <p className="text-sm text-slate-600 mb-2">{station.area}</p>
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded">
                      {station.type}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {otherStations.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-4 text-slate-800">Other Facilities</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherStations.map((station) => (
                    <Link
                      key={station.slug}
                      href={`/coverage/police-stations/${station.slug}`}
                      className="block p-6 border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-lg transition-all bg-white"
                    >
                      <h3 className="font-semibold text-lg text-slate-800 mb-2">{station.name}</h3>
                      <p className="text-sm text-slate-600 mb-2">{station.area}</p>
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-800 rounded">
                        {station.type}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 text-center">
              <Link
                href="/coverage/areas"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                View coverage by area
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-4 h-4 ml-2">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}





























