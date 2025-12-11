import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "What We Do | Police Station Agent | Criminal Defence Kent",
  description: "Expert police station representation, legal advice during interviews, and criminal defence services across Kent. FREE legal aid available 24/7.",
  alternates: {
    canonical: "https://criminaldefencekent.co.uk/what-we-do",
  },
  openGraph: {
    title: "What We Do | Police Station Agent | Criminal Defence Kent",
    description: "Expert police station representation, legal advice during interviews, and criminal defence services across Kent. FREE legal aid available 24/7.",
    type: 'website',
    url: "https://criminaldefencekent.co.uk/what-we-do",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main">
        <div className="bg-slate-50 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-16">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                What We Do
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Expert police station representation and criminal defence services across Kent. 
                We provide FREE legal advice under Legal Aid for anyone detained or invited for a voluntary interview.
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Police Station Representation */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Police Station Representation</h2>
                <p className="text-slate-600 mb-4">
                  We attend all Kent police stations to provide expert legal representation during interviews. 
                  This service is FREE under Legal Aid - you don&apos;t pay a penny.
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>24/7 availability including weekends and bank holidays</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>All Kent custody suites covered</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Pre-interview consultations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Present during all interviews</span>
                  </li>
                </ul>
              </div>

              {/* Voluntary Interviews */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
                <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Voluntary Interview Assistance</h2>
                <p className="text-slate-600 mb-4">
                  Received a letter asking you to attend a voluntary interview? Don&apos;t go alone. 
                  We provide FREE legal representation for voluntary police interviews.
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Pre-interview preparation and advice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Understand your rights before attending</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Full representation during interview</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Post-interview advice</span>
                  </li>
                </ul>
              </div>

              {/* Agent Services */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
                <div className="w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Agent Services for Solicitors</h2>
                <p className="text-slate-600 mb-4">
                  We provide reliable police station agent cover for criminal law firms across Kent. 
                  Professional representation with detailed attendance notes.
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Competitive fixed fee rates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Comprehensive attendance notes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>35+ years experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Available evenings and weekends</span>
                  </li>
                </ul>
              </div>

              {/* Court Representation */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
                <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Court Representation</h2>
                <p className="text-slate-600 mb-4">
                  Seamless handover from police station to court through our partnership with Tuckers Solicitors LLP. 
                  Magistrates&apos; Court and Crown Court representation available.
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Magistrates&apos; Court appearances</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Crown Court advocacy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Higher Court Advocate available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Legal Aid and private options</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-8 md:p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Need Legal Help Now?</h2>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                Whether you&apos;ve been arrested or invited for a voluntary interview, we&apos;re here to help 24/7. 
                All police station advice is FREE under Legal Aid.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="tel:01732247427" 
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call 01732 247 427
                </a>
                <a 
                  href="sms:07535494446" 
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Text 07535 494446
                </a>
              </div>
              <p className="text-amber-300 font-semibold mt-6">
                Ask for Robert Cashman, Tuckers Duty Solicitor
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
