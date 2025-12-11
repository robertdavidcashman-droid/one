import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import db from '@/lib/db';

export default function ServicesPage() {
  const services = db.prepare('SELECT * FROM services ORDER BY title').all() as Array<{
    id: number;
    title: string;
    slug: string;
    description: string | null;
  }>;

  // Default services if none in database
  const defaultServices = [
    {
      id: 1,
      title: 'Police Station Representation',
      slug: 'police-station-representation',
      description: 'Expert legal representation when you need it most. Available 24/7 for urgent matters.',
    },
    {
      id: 2,
      title: 'Criminal Defense',
      slug: 'criminal-defense',
      description: 'Comprehensive criminal defense services with experienced solicitors.',
    },
    {
      id: 3,
      title: 'Legal Advice',
      slug: 'legal-advice',
      description: 'Professional legal advice and guidance for all criminal matters.',
    },
  ];

  const displayServices = services.length > 0 ? services : defaultServices;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#0A2342] text-white py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
            <p className="text-xl text-gray-200">
              Professional legal services tailored to your needs
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12 bg-gray-50">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayServices.map((service) => (
                <Link
                  key={service.id || service.slug}
                  href={`/services/${service.slug}`}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  <h2 className="text-2xl font-semibold mb-4">{service.title}</h2>
                  <p className="text-gray-600 mb-4">
                    {service.description || 'Professional legal service tailored to your needs.'}
                  </p>
                  <span className="text-[#0A2342] font-semibold">
                    Learn More →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}





