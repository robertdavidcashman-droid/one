import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import FAQContent from './FAQContent';

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions | Police Station Agent",
  description: "Comprehensive answers about police station representation in Kent. What we do and don't do, legal aid information, and how to get urgent help. Available 24/7.",
  alternates: {
    canonical: "https://criminaldefencekent.co.uk/faq",
  },
  openGraph: {
    title: "FAQ - Frequently Asked Questions | Police Station Agent",
    description: "Comprehensive answers about police station representation in Kent. What we do and don't do, legal aid information, and how to get urgent help. Available 24/7.",
    type: 'website',
    url: "https://criminaldefencekent.co.uk/faq",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main">
        <div className="bg-gradient-to-b from-slate-50 to-white">
          <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-primary/80 bg-amber-400 text-slate-900 mb-6 text-sm font-bold">
                Frequently Asked Questions
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-6">Everything You Need to Know</h1>
              <p className="text-xl text-blue-100 mb-8">Comprehensive answers about our police station representation services across Kent</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:01732247427" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-10 rounded-md px-8 bg-red-600 hover:bg-red-700 font-bold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone w-5 h-5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Emergency: 01732 247 427
                </a>
                <a className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-sm h-10 rounded-md px-8 border-white text-white hover:bg-white hover:text-blue-900" href="/contact">
                  Contact Us
                </a>
              </div>
            </div>
          </section>
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4">
              <FAQContent />
            </div>
          </section>
          <section className="py-20 bg-gradient-to-br from-red-600 to-red-800">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Still Have Questions?</h2>
              <p className="text-xl text-red-100 mb-12">Get immediate answers and expert advice - available 24/7 across Kent</p>
              <div className="grid md:grid-cols-3 gap-4">
                <a href="tel:01732247427" className="bg-white/95 hover:bg-white p-8 rounded-3xl shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone w-12 h-12 mx-auto mb-4 text-red-600">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <div className="text-slate-900 font-bold text-lg mb-2">Call Now</div>
                  <div className="text-slate-700 text-2xl font-black">01732 247 427</div>
                </a>
                <a href="sms:07535494446?body=I have a question about police station representation" className="bg-white/95 hover:bg-white p-8 rounded-3xl shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle w-12 h-12 mx-auto mb-4 text-green-600">
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                  </svg>
                  <div className="text-slate-900 font-bold text-lg mb-2">Text Us</div>
                  <div className="text-slate-700 text-2xl font-black">07535 494446</div>
                </a>
                <a href="mailto:robertcashman@defencelegalservices.co.uk" className="bg-white/95 hover:bg-white p-8 rounded-3xl shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail w-12 h-12 mx-auto mb-4 text-blue-600">
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  <div className="text-slate-900 font-bold text-lg mb-2">Email</div>
                  <div className="text-slate-700 text-sm font-semibold break-words">robertcashman@<br />defencelegalservices.co.uk</div>
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
