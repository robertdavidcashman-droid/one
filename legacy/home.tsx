import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import db from '@/lib/db';
import { JsonLd } from '@/components/JsonLd';

export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://policestationagent.com';
  
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Police Station Agent',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Expert legal representation at police stations across the UK. Available 24/7.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'GB',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: 'English',
    },
    sameAs: [],
  };
  const stations = db.prepare('SELECT * FROM police_stations ORDER BY name LIMIT 3').all() as Array<{
    id: number;
    name: string;
    slug: string;
    address: string | null;
  }>;

  const services = db.prepare('SELECT * FROM services ORDER BY title LIMIT 3').all() as Array<{
    id: number;
    title: string;
    slug: string;
    description: string | null;
  }>;

  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={organizationSchema} />
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#0A2342] text-white py-20">
          <div className="container-custom">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Expert Police Station Representation
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-200">
                Professional legal services available 24/7 across the UK
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-white text-[#0A2342] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Get Help Now
                </Link>
                <Link
                  href="/services"
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#0A2342] transition"
                >
                  Our Services
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">24/7 Availability</h3>
                <p className="text-gray-600">Round-the-clock legal assistance for urgent police station matters</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Expert Solicitors</h3>
                <p className="text-gray-600">Experienced legal professionals with deep knowledge of police procedures</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">UK Wide Coverage</h3>
                <p className="text-gray-600">Professional representation at police stations across the United Kingdom</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service) => (
                <div key={service.id} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-4">
                    {service.description || 'Professional legal service tailored to your needs.'}
                  </p>
                  <Link 
                    href={`/services/${service.slug}`} 
                    className="text-[#0A2342] hover:text-[#08192e] font-semibold"
                  >
                    Learn More →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Police Stations Section */}
        <section className="py-16">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-center mb-12">Police Stations We Cover</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stations.map((station) => (
                <Link 
                  key={station.id}
                  href={`/police-stations/${station.slug}`} 
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-semibold mb-2">{station.name}</h3>
                  {station.address && (
                    <p className="text-gray-600">{station.address}</p>
                  )}
                  <span className="text-[#0A2342] font-semibold mt-4 inline-block">
                    Learn More →
                  </span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link 
                href="/police-stations" 
                className="text-[#0A2342] hover:text-[#08192e] font-semibold"
              >
                View All Police Stations →
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-[#0A2342] text-white">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#CBA135] mb-2">24/7</div>
                <p className="text-gray-200">Always Available</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#CBA135] mb-2">100%</div>
                <p className="text-gray-200">Confidential</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#CBA135] mb-2">Expert</div>
                <p className="text-gray-200">Solicitors</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#CBA135] mb-2">UK</div>
                <p className="text-gray-200">Wide Coverage</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-[#0A2342] text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-4">Need Legal Assistance?</h2>
            <p className="text-xl mb-8 text-gray-200">
              We're available 24/7 for urgent police station matters
            </p>
            <Link
              href="/contact"
              className="bg-white text-[#0A2342] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
            >
              Contact Us Now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}



