import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import { SITE_DOMAIN, SITE_URL } from '@/config/site';
import Script from 'next/script';
import { FAQPage } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: "Police Station Rep Services Kent | FREE 24/7 | Accredited Duty Solicitor",
  description: "Expert police station rep service across Kent. FREE legal advice 24/7 at all Kent custody suites. Accredited duty solicitor Robert Cashman. Call 01732 247427.",
  alternates: {
    canonical: `https://${SITE_DOMAIN}/services/police-station-representation`,
  },
  openGraph: {
    title: "Police Station Representation Kent | FREE Legal Advice 24/7",
    description: "Expert police station representation across Kent. FREE legal advice at all custody suites. Available 24/7.",
    url: `https://${SITE_DOMAIN}/services/police-station-representation`,
    siteName: 'Police Station Agent',
    type: 'website',
  },
};

// Service schema for Police Station Representation
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Police Station Representation",
  "description": "FREE police station representative service across all Kent custody suites. Accredited duty solicitor available 24/7 for police interviews, voluntary interviews, and custody matters.",
  "provider": {
    "@type": "LegalService",
    "name": "Police Station Agent",
    "url": SITE_URL
  },
  "areaServed": {
    "@type": "State",
    "name": "Kent"
  },
  "serviceType": "Police Station Representation",
  "category": "Legal Services",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "GBP",
    "description": "FREE under Legal Aid",
    "availability": "https://schema.org/InStock",
    "validFrom": "2025-01-01"
  },
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceType": "Telephone",
    "servicePhone": "+441732247427",
    "availableLanguage": "English"
  }
};

export default function PoliceStationRepresentationPage() {
  const faqItems = [
    {
      question: "What is a police station rep in Kent?",
      answer: "A police station rep (police station representative) is an accredited legal professional who provides FREE legal advice and representation at Kent police stations. Robert Cashman is a qualified solicitor and accredited duty solicitor, not just an agent."
    },
    {
      question: "Is police station rep service free in Kent?",
      answer: "Yes. Everyone arrested or invited for a voluntary interview in Kent is entitled to FREE legal advice at the police station under Legal Aid. This is a statutory right under PACE 1984 and is not means-tested."
    },
    {
      question: "How quickly can a police station rep attend in Kent?",
      answer: "We aim to attend any Kent custody suite within 45 minutes. Our extended hours service covers all Kent police stations 24/7, including weekends and bank holidays."
    },
    {
      question: "Which Kent towns do you cover as a police station rep?",
      answer: "We cover all Kent towns including Medway, Maidstone, Canterbury, Gravesend, Tonbridge, Folkestone, Ashford, Dartford, Sittingbourne, Sevenoaks, Tunbridge Wells, Margate, Dover, Swanley, and Bluewater."
    },
    {
      question: "What's the difference between a police station rep and a call centre service?",
      answer: "We provide direct access to qualified solicitor Robert Cashman (35+ years experience, 6000+ cases). Unlike call-centre competitors, you get a qualified solicitor, not just an agent. We focus exclusively on Kent, not national coverage."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <FAQPage items={faqItems} />
      <Script
        id="service-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen">
          <div className="prose prose-lg max-w-6xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-6">Police Station Representation</h1>
            <p className="lead text-xl text-slate-700 mb-8">
              Information about police station representation will be available here.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
