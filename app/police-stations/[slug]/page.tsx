import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import db from '@/lib/db';
import type { Metadata } from 'next';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const station = db.prepare('SELECT * FROM police_stations WHERE slug = ?').get(params.slug) as {
    name: string;
    address: string | null;
  } | undefined;

  if (!station) {
    return {
      title: 'Police Station Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://criminaldefencekent.co.uk';
  
  return {
    title: `${station.name} Police Station - Police Station Agent`,
    description: `Professional police station representation at ${station.name}. Available 24/7 for urgent legal assistance.${station.address ? ' Located at ' + station.address : ''}`,
    alternates: {
      canonical: `${siteUrl}/police-stations/${params.slug}`,
    },
  };
}

export default function PoliceStationPage({ params }: PageProps) {
  const station = db.prepare('SELECT * FROM police_stations WHERE slug = ?').get(params.slug) as {
    id: number;
    name: string;
    slug: string;
    address: string | null;
    content: string | null;
  } | undefined;

  if (!station) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Link 
                href="/police-stations" 
                className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-5 h-5">
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
                Back to Police Stations
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{station.name} Police Station</h1>
              {station.address && (
                <div className="flex items-center gap-2 text-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin w-5 h-5">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <p className="text-lg">{station.address}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {station.content ? (
              <div className="prose prose-lg max-w-none mb-12">
                <div 
                  dangerouslySetInnerHTML={{ __html: station.content }} 
                  className="prose prose-lg max-w-none"
                />
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl mb-12 border-l-4 border-blue-600 shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-slate-800">Police Station Representation at {station.name}</h2>
                <p className="text-slate-700 leading-relaxed text-lg mb-4">
                  We provide professional police station representation services at {station.name}. Our experienced duty solicitors are available 24/7 to protect your rights during police interviews and custody.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle text-green-600 w-5 h-5 mt-0.5 flex-shrink-0">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <p className="text-slate-700">Free legal advice under Legal Aid</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle text-green-600 w-5 h-5 mt-0.5 flex-shrink-0">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <p className="text-slate-700">Available 24/7 for urgent matters</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle text-green-600 w-5 h-5 mt-0.5 flex-shrink-0">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <p className="text-slate-700">Expert representation during interviews</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Need Help at {station.name}?</h2>
              <p className="text-blue-100 mb-4">
                If you or someone you know has been arrested or invited for a police interview at {station.name}, contact us immediately for free legal advice.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="tel:03330497036"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition inline-flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone w-5 h-5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Call 0333 049 7036
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
