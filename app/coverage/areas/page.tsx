import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BreadcrumbList } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: "Areas Covered - Coverage | Police Station Agent",
  description: "Criminal defence representation across Kent areas including Medway, East Kent, West Kent, North Kent, and Mid Kent. Information about police station coverage by area.",
  alternates: {
    canonical: "https://criminaldefencekent.co.uk/coverage/areas",
  },
};

const AREAS = [
  { name: 'Medway', slug: 'medway', displayName: 'Medway', description: 'Chatham, Gillingham, Rochester, Strood, Rainham' },
  { name: 'North Kent', slug: 'north-kent', displayName: 'North Kent', description: 'Gravesend, Dartford, Sittingbourne' },
  { name: 'East Kent', slug: 'east-kent', displayName: 'East Kent', description: 'Canterbury, Folkestone, Margate, Dover, Ramsgate' },
  { name: 'Mid Kent', slug: 'mid-kent', displayName: 'Mid Kent', description: 'Maidstone, Ashford' },
  { name: 'West Kent', slug: 'west-kent', displayName: 'West Kent', description: 'Tonbridge, Sevenoaks, Tunbridge Wells' },
  { name: 'North West Kent', slug: 'north-west-kent', displayName: 'North West Kent', description: 'Swanley and surrounding areas' },
  { name: 'Maidstone', slug: 'maidstone', displayName: 'Maidstone', description: 'Maidstone and surrounding areas' }
];

export default function AreasPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://criminaldefencekent.co.uk';
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'Coverage', url: `${siteUrl}/coverage` },
    { name: 'Areas', url: `${siteUrl}/coverage/areas` },
  ];

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
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Areas Covered</h1>
              <p className="text-xl text-blue-100">
                Criminal defence representation across Kent and Medway
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {AREAS.map((area) => (
                <Link
                  key={area.slug}
                  href={`/coverage/areas/${area.slug}`}
                  className="block p-6 border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all bg-white"
                >
                  <h2 className="font-bold text-xl text-slate-800 mb-2">{area.displayName}</h2>
                  <p className="text-sm text-slate-600 mb-4">{area.description}</p>
                  <span className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm">
                    View details
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-4 h-4 ml-2">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/coverage/police-stations"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                View coverage by police station
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





























