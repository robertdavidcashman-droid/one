import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sevenoaks Psa Station | Police Station Agent",
  description: "Police Station Agent services and information",
  alternates: {
    canonical: "https://policestationagent.com/sevenoaks-psa-station",
  },
  openGraph: {
    title: "Sevenoaks Psa Station | Police Station Agent",
    description: "Police Station Agent services and information",
    type: 'website',
    url: "https://policestationagent.com/sevenoaks-psa-station",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen">
          <div 
            className="prose prose-lg max-w-6xl mx-auto px-4 py-16"
            dangerouslySetInnerHTML={{ __html: `
  <div id="root">
  </div>
 

` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
