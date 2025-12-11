import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import db from '@/lib/db';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const station = db.prepare('SELECT * FROM police_stations WHERE slug = ?').get(params.slug) as {
    name: string;
    content: string | null;
  } | undefined;

  if (!station) {
    return {
      title: 'Police Station Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://policestationagent.com';
  
  return {
    title: `${station.name} - Police Station Representation`,
    description: station.content ? station.content.substring(0, 160) : `Expert legal representation at ${station.name}`,
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
    phone: string | null;
    content: string | null;
  } | undefined;

  if (!station) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://policestationagent.com';
  
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${station.name} - Legal Representation`,
    description: `Expert legal representation services at ${station.name}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: station.address || '',
      addressLocality: 'Kent',
      addressCountry: 'GB',
    },
    telephone: station.phone || '',
    url: `${siteUrl}/police-stations/${station.slug}`,
    priceRange: '$$',
    areaServed: {
      '@type': 'City',
      name: 'Kent',
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={localBusinessSchema} />
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#0A2342] text-white py-12">
          <div className="container-custom">
            <Link 
              href="/police-stations" 
              className="inline-flex items-center gap-2 text-gray-200 hover:text-white mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Police Stations
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{station.name}</h1>
            {station.address && (
              <div className="flex items-center gap-2 text-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{station.address}</span>
              </div>
            )}
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              {station.phone && (
                <div className="bg-gray-50 p-6 rounded-xl mb-8 border-l-4 border-[#0A2342]">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-[#0A2342]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Contact</p>
                      <p className="text-lg font-semibold text-gray-900">{station.phone}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {station.content ? (
                <div className="prose prose-lg max-w-none mb-12 text-gray-700">
                  <div 
                    dangerouslySetInnerHTML={{ __html: station.content }} 
                    className="space-y-4"
                  />
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-xl mb-12 border-l-4 border-[#0A2342]">
                  <h2 className="text-2xl font-semibold mb-4">Expert Representation Available</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We provide professional legal representation at {station.name}. Our experienced solicitors are available 24/7 for urgent matters.
                  </p>
                </div>
              )}
              
              <div className="bg-[#0A2342] text-white p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Need Legal Assistance?</h2>
                <p className="text-gray-200 mb-4">
                  If you or someone you know has been arrested or needs legal representation at {station.name}, contact us immediately.
                </p>
                <Link
                  href="/contact"
                  className="bg-white text-[#0A2342] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
                >
                  Contact Us Now
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





