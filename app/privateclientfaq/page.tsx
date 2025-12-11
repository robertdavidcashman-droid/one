import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import FAQAccordion from './FAQAccordion';

export const metadata: Metadata = {
  title: "Private Client FAQ | Police Station Agent",
  description: "Common questions about private criminal defence representation, requesting Robert Cashman at police stations, and our fee structure.",
  alternates: {
    canonical: "https://criminaldefencekent.co.uk/privateclientfaq",
  },
  openGraph: {
    title: "Private Client FAQ | Police Station Agent",
    description: "Common questions about private criminal defence representation, requesting Robert Cashman at police stations, and our fee structure.",
    type: 'website',
    url: "https://criminaldefencekent.co.uk/privateclientfaq",
  },
};

export default function Page() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-slate-800 mb-4">Private Client FAQ</h1>
              <p className="text-xl text-slate-600">Common questions about private criminal defence representation and requesting Robert Cashman.</p>
            </div>
            
            <div className="rounded-xl border text-card-foreground shadow mb-8 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield w-8 h-8 text-blue-600 flex-shrink-0 mt-1">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                  </svg>
                  <div>
                    <h3 className="font-bold text-blue-800 mb-2 text-lg">How to Request Robert Cashman at Police Station</h3>
                    <p className="text-blue-700 mb-4">When arrested or invited for interview, tell the custody officer: <strong>"I want Robert Cashman"</strong> or <strong>"I want Tuckers Solicitors LLP - Robert Cashman"</strong>. They must contact us. You can also call us directly on <strong>01732 247 427</strong> or <strong>020 8242 1857</strong>.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a href="tel:01732247427" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone w-4 h-4">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        Call: 01732 247 427
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <FAQAccordion />
            
            <div className="rounded-xl border text-card-foreground shadow mb-8 bg-red-50 border-red-200">
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-triangle-alert w-6 h-6 text-red-600 flex-shrink-0 mt-1">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
                    <path d="M12 9v4"></path>
                    <path d="M12 17h.01"></path>
                  </svg>
                  <div>
                    <h3 className="font-bold text-red-800 mb-2">Been Arrested? Need Immediate Help?</h3>
                    <p className="text-red-700 mb-4">Time is critical in police investigations. Don't delay - call us immediately for expert representation.</p>
                    <a href="tel:01732247427" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-10 rounded-md px-8 bg-red-600 hover:bg-red-700 font-bold flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone w-5 h-5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      Emergency Call: 01732 247 427
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border shadow bg-blue-800 text-white text-center">
              <div className="p-10">
                <h3 className="text-2xl font-bold text-amber-300 mb-4">Ready to Discuss Your Case?</h3>
                <p className="mb-6 max-w-2xl mx-auto text-blue-200">Contact us for a confidential discussion about representation. Whether Legal Aid or private, you deserve expert criminal defence.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="tel:01732247427" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-10 rounded-md px-8 bg-red-600 hover:bg-red-700 font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone w-5 h-5">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Call for a Consultation
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
