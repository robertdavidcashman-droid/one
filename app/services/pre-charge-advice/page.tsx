import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import { SITE_DOMAIN } from '@/config/site';

export const metadata: Metadata = {
  title: "Pre-Charge Advice Kent | Expert Legal Consultation | Police Station Agent",
  description: "Expert pre-charge legal advice in Kent. Professional consultation before police charging decisions. Available 24/7. Call 01732 247427.",
  alternates: {
    canonical: `https://${SITE_DOMAIN}/services/pre-charge-advice`,
  },
  openGraph: {
    title: "Pre-Charge Advice Kent | Expert Legal Consultation",
    description: "Expert pre-charge legal advice in Kent. Professional consultation before police charging decisions.",
    url: `https://${SITE_DOMAIN}/services/pre-charge-advice`,
    siteName: 'Police Station Agent',
    type: 'website',
  },
};

export default function PreChargeAdvicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen">
          <div className="prose prose-lg max-w-6xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-6">Pre-Charge Advice</h1>
            <p className="lead text-xl text-slate-700 mb-8">
              Information about pre-charge advice will be available here.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
