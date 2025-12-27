import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact | Police Station Advice in Kent | Call 01732 247427",
  description:
    "Contact Police Station Agent for police station advice and representation in Kent. Free legal advice at the police station under Legal Aid. Call 01732 247427 or text 07535 494446.",
  alternates: {
    canonical: "https://criminaldefencekent.co.uk/contact",
  },
  openGraph: {
    title: "Contact Police Station Agent | Police Station Advice Kent | Call 01732 247427",
    description:
      "Contact Police Station Agent for police station representation in Kent. Extended hours availability. Call 01732 247427, text 07535 494446 or email for advice.",
    url: "https://criminaldefencekent.co.uk/contact",
    siteName: 'Police Station Agent',
    type: 'website',
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-16">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-16 rounded-xl mb-8" aria-labelledby="page-title">
              <div className="max-w-3xl mx-auto text-center px-4">
                <h1 id="page-title" className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  Contact for Police Station Advice
                </h1>
                <p className="text-xl text-blue-100 mb-8">
                  Get expert legal advice now. We are available during extended hours to protect your rights. Our advice at the police station is free.
                </p>
                <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-3 md:px-6 md:py-3 rounded-full font-semibold text-sm md:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone w-5 h-5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Urgent Help Line: 01732 247427
                </div>
                <p className="text-amber-300 font-bold mt-4">
                  Ask for Robert Cashman, Tuckers Duty Solicitor — The DSCC have our details
                </p>
              </div>
            </section>
            
            {/* Contact Form */}
            <ContactForm />
            
            {/* Additional Contact Methods */}
            <section className="mt-12 bg-white rounded-xl border border-slate-200 shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Other Ways to Contact Us</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone w-8 h-8 text-white">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-xl mb-2">Call Now</h3>
                  <a href="tel:01732247427" className="text-lg font-semibold text-red-600 hover:underline break-all">
                    01732 247427
                  </a>
                  <p className="text-sm text-gray-600 mt-2">For immediate assistance</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle w-8 h-8 text-white">
                      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-xl mb-2">Text Message</h3>
                  <a href="sms:07535494446?body=I need urgent police station advice" className="text-lg font-semibold text-green-600 hover:underline break-all">
                    Text Us
                  </a>
                  <p className="text-sm text-gray-600 mt-2">Fast SMS response - 07535 494446</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail w-8 h-8 text-white">
                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-xl mb-2">Email</h3>
                  <a href="mailto:robertcashman@defencelegalservices.co.uk" className="text-lg font-semibold text-blue-600 hover:underline break-all">
                    Email Us
                  </a>
                  <p className="text-sm text-gray-600 mt-2">We aim to respond during office hours</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
