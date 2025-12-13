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
  const service = db.prepare('SELECT * FROM services WHERE slug = ?').get(params.slug) as {
    title: string;
    description: string | null;
  } | undefined;

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://policestationagent.com';
  
  return {
    title: `${service.title} - Police Station Agent`,
    description: service.description || `Professional ${service.title} services`,
    alternates: {
      canonical: `${siteUrl}/services/${params.slug}`,
    },
  };
}

export default function ServicePage({ params }: PageProps) {
  const service = db.prepare('SELECT * FROM services WHERE slug = ?').get(params.slug) as {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    content: string | null;
  } | undefined;

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#0A2342] text-white py-12">
          <div className="container-custom">
            <Link 
              href="/services" 
              className="inline-flex items-center gap-2 text-gray-200 hover:text-white mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Services
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{service.title}</h1>
            {service.description && (
              <p className="text-xl text-gray-200 max-w-3xl leading-relaxed">{service.description}</p>
            )}
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              {service.content ? (
                <div className="prose prose-lg max-w-none mb-12 text-gray-700">
                  <div 
                    dangerouslySetInnerHTML={{ __html: service.content }} 
                    className="space-y-4"
                  />
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-xl mb-12 border-l-4 border-[#0A2342]">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    We provide professional {service.title.toLowerCase()} services. Our experienced team is here to help you navigate your legal matters with expertise and care.
                  </p>
                </div>
              )}
              
              <div className="bg-[#0A2342] text-white p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Interested in This Service?</h2>
                <p className="text-gray-200 mb-4">
                  Contact us to discuss how we can help with your legal needs.
                </p>
                <Link
                  href="/contact"
                  className="bg-white text-[#0A2342] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
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

