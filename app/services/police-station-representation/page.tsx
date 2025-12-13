import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { Phone, Shield, MessageCircle, Mail, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: "Police Station Solicitor Kent | 24/7 Duty Solicitor",
  description: "Expert police station representation across Kent. Accredited duty solicitor available 24/7 for interviews under caution. FREE legal advice at all Kent police stations.",
  alternates: {
    canonical: "https://policestationagent.com/services/police-station-representation",
  },
  openGraph: {
    title: "Police Station Solicitor Kent | 24/7 Duty Solicitor",
    description: "Expert police station representation across Kent. Accredited duty solicitor available 24/7 for interviews under caution. FREE legal advice at all Kent police stations.",
    url: "https://policestationagent.com/services/police-station-representation",
    siteName: 'Criminal Defence Kent',
    type: 'website',
  },
};

const schemaData = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  "name": "Police Station Solicitor Kent | 24/7 Duty Solicitor",
  "description": "Expert police station representation across Kent. Accredited duty solicitor available 24/7 for interviews under caution.",
  "serviceType": "Police Station Representation",
  "provider": {
    "@type": "Organization",
    "name": "Criminal Defence Kent",
    "telephone": "01732247427",
    "email": "robertcashman@defencelegalservices.co.uk",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kent",
      "addressRegion": "Kent",
      "addressCountry": "GB"
    }
  },
  "areaServed": {
    "@type": "AdministrativeArea",
    "name": "Kent"
  },
  "url": "https://policestationagent.com/services/police-station-representation"
};

export default function ServicesPoliceStationRepresentation() {
  return (
    <>
      <JsonLd data={schemaData} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
        <Header />
        <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
          <div className="bg-slate-50 py-16">
            <div className="max-w-4xl mx-auto px-4">

              {/* Sticky Mobile CTA */}
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-red-600 text-white p-3 md:hidden">
                <div className="flex gap-2">
                  <a href="tel:01732247427" className="flex-1 bg-white text-red-600 hover:bg-slate-100 text-center py-2 rounded text-sm font-bold">
                    Call Now
                  </a>
                  <a href="sms:07535494446?body=I need police station representation" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded text-sm font-bold">
                    Text Us
                  </a>
                </div>
              </div>

              <div className="text-center mb-12">
                <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 mb-4">
                  Extended Hours Available
                </div>
                <h1 className="text-4xl font-bold text-slate-800 mb-4">Police Station Solicitor Kent</h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Expert criminal defence solicitor providing immediate police station representation across Kent & Medway. Protect your rights from the moment of arrest.
                </p>
              </div>

              {/* Emergency Alert */}
              <div className="rounded-xl border bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 mb-8">
                <div className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-red-800 mb-2">Going to be arrested? Call Immediately</h3>
                      <p className="text-red-700 mb-4">Time is critical. The sooner we know, the better we can protect your interests and manage your case strategy.</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a href="tel:01732247427" className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-md">
                          <Phone className="w-5 h-5" /> Call Now: 01732 247427
                        </a>
                        <a href="https://wa.me/447732247427?text=I need police station representation" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-md">
                          <MessageCircle className="w-5 h-5" /> WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* How We Help */}
              <div className="rounded-xl border bg-white shadow mb-8">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Step-by-Step: How We Help You</h2>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                      <div>
                        <h4 className="font-semibold mb-2">You Call Us</h4>
                        <p className="text-slate-600">Call 01732 247427 or ask the custody officer to contact Robert Cashman of Tuckers Solicitors LLP. We respond immediately.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                      <div>
                        <h4 className="font-semibold mb-2">We Attend Quickly</h4>
                        <p className="text-slate-600">Attend within 45 mins of police saying they're ready to interview and have a private consultation with you to understand the allegations and your situation.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                      <div>
                        <h4 className="font-semibold mb-2">We Review Evidence</h4>
                        <p className="text-slate-600">We review any disclosure provided by police, discuss the strengths and weaknesses of their case, and advise on the best approach to the interview.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
                      <div>
                        <h4 className="font-semibold mb-2">Interview Representation</h4>
                        <p className="text-slate-600">We sit with you throughout the interview, ensure questions are fair, and can advise you to remain silent if that's in your best interests.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">5</div>
                      <div>
                        <h4 className="font-semibold mb-2">Post-Interview Advice</h4>
                        <p className="text-slate-600">Clear explanation of what happens next, whether that's release, bail conditions, or potential charges. We discuss next steps and future representation needs.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What to Expect */}
              <div className="rounded-xl border bg-white shadow mb-8">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Rights at the Police Station</h2>
                  <div className="space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                      <h4 className="font-semibold text-green-800 mb-2">✓ Your Fundamental Rights:</h4>
                      <ul className="text-green-700 space-y-1">
                        <li>• Right to free legal advice (not means-tested)</li>
                        <li>• Right to have someone informed of your arrest</li>
                        <li>• Right to consult the Codes of Practice</li>
                        <li>• Right to an interpreter if English isn't your first language</li>
                        <li>• Right to medical attention if needed</li>
                      </ul>
                    </div>
                    
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                      <h4 className="font-semibold text-amber-800 mb-2">⚠️ Important to Remember:</h4>
                      <ul className="text-amber-700 space-y-1">
                        <li>• You don't have to say anything - silence cannot be used against you in most circumstances</li>
                        <li>• Anything you do say will be recorded and can be used as evidence</li>
                        <li>• Police may ask the same question in different ways</li>
                        <li>• You can ask for a break at any time</li>
                        <li>• Your solicitor can stop the interview if needed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coverage Areas */}
              <div className="rounded-xl border bg-white shadow mb-8">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Areas We Cover</h2>
                  <p className="text-slate-700 mb-4">We attend all police stations across Kent and Medway, including:</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Main Custody Suites:</h4>
                      <ul className="space-y-1 text-slate-600">
                        <li>• <Link href="/medway-police-station" className="hover:underline text-blue-700">Medway Police Station</Link></li>
                        <li>• <Link href="/canterbury-police-station" className="hover:underline text-blue-700">Canterbury Police Station</Link></li>
                        <li>• <Link href="/folkestone-police-station" className="hover:underline text-blue-700">Folkestone Police Station</Link></li>
                        <li>• <Link href="/tonbridge-police-station" className="hover:underline text-blue-700">Tonbridge Police Station</Link></li>
                        <li>• <Link href="/north-kent-gravesend-police-station" className="hover:underline text-blue-700">North Kent (Gravesend)</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Voluntary Interview Stations:</h4>
                      <ul className="space-y-1 text-slate-600">
                        <li>• <Link href="/maidstone-police-station" className="hover:underline text-blue-700">Maidstone Police Station</Link></li>
                        <li>• <Link href="/ashford-police-station" className="hover:underline text-blue-700">Ashford Police Station</Link></li>
                        <li>• <Link href="/dover-police-station" className="hover:underline text-blue-700">Dover Police Station</Link></li>
                        <li>• <Link href="/margate-police-station" className="hover:underline text-blue-700">Margate Police Station</Link></li>
                        <li>• <Link href="/sevenoaks-police-station" className="hover:underline text-blue-700">Sevenoaks Police Station</Link></li>
                        <li>• <Link href="/sittingbourne-police-station" className="hover:underline text-blue-700">Sittingbourne Police Station</Link></li>
                        <li>• <Link href="/swanley-police-station" className="hover:underline text-blue-700">Swanley Police Station</Link></li>
                        <li>• <Link href="/tunbridge-wells-police-station" className="hover:underline text-blue-700">Tunbridge Wells Police Station</Link></li>
                        <li>• <Link href="/bluewater-police-station" className="hover:underline text-blue-700">Bluewater Police Station</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* What Happens Next - Court Journey CTA */}
              <div className="rounded-xl border bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-blue-200 shadow mb-8">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">What If I've Been Charged and Need Court Representation?</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded">
                      <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Legal Aid Court Work
                      </h4>
                      <p className="text-slate-700 mb-3 leading-relaxed">
                        If you're charged and remanded for court following police station representation, we ensure a seamless handover to the expert court advocacy team at <strong>Tuckers Solicitors LLP</strong>. 
                      </p>
                      <p className="text-slate-700 leading-relaxed">
                        You'll receive continuity of quality representation from a dedicated court solicitor who will handle your Magistrates' Court and Crown Court proceedings under Legal Aid.
                      </p>
                    </div>

                    <div className="bg-purple-50 border-l-4 border-purple-500 p-5 rounded">
                      <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Private Client Court Work
                      </h4>
                      <p className="text-slate-700 mb-3 leading-relaxed">
                        For privately funded clients, <strong>I provide direct and continuous representation</strong> from the police station all the way through to the Magistrates' Court and Crown Court.
                      </p>
                      <p className="text-slate-700 leading-relaxed">
                        As a qualified Higher Court Advocate with over 30 years' experience, I can personally handle your case at every stage, ensuring you have consistent, director-level representation throughout.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link href="/courtrepresentation" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-md">
                      Learn More About Court Representation <ArrowRight className="w-4 h-4 ml-2"/>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Urgent CTA */}
              <div className="rounded-xl border bg-blue-800 text-white shadow-xl">
                <div className="p-8 text-center">
                  <h3 className="text-3xl font-bold text-amber-400 mb-4">Need Representation? Call Now</h3>
                  <p className="text-lg mb-6">
                    Don't face police questioning alone. Expert legal advice is your right and our speciality.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                    <a href="tel:01732247427" className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 font-bold px-8 py-3 rounded-md">
                      <Phone className="w-5 h-5" /> Call: 01732 247427
                    </a>
                    <a href="sms:07535494446?body=I need police station representation" className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-md">
                      <MessageCircle className="w-5 h-5" /> Text: 07535 494446
                    </a>
                    <a href="mailto:robertcashman@defencelegalservices.co.uk" className="inline-flex items-center justify-center gap-2 bg-blue-400 hover:bg-blue-500 text-blue-900 font-bold px-8 py-3 rounded-md">
                      <Mail className="w-5 h-5" /> Email Us
                    </a>
                  </div>
                  <p className="text-sm text-blue-200 mt-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded mr-2">FREE</span>
                    All police station advice is free under Legal Aid - no means test required
                  </p>
                </div>
              </div>

              {/* Contact Reference */}
              <div className="text-center mt-8">
                <p className="text-slate-600">
                  Questions about the process? <Link href="/contact" className="text-blue-600 hover:underline font-semibold">Contact us</Link> for a no-obligation discussion.
                </p>
              </div>

              {/* Legal Disclaimer */}
              <div className="mt-8 p-4 bg-slate-100 rounded-lg text-center">
                <p className="text-sm text-slate-600">
                  This page provides general information and is not legal advice. Every case is unique - contact us for tailored advice on your specific situation.
                </p>
              </div>

              {/* Version Tracking */}
              <div className="text-right mt-4">
                <p className="text-xs text-gray-500">v2.5 - {new Date().toLocaleDateString()}</p>
              </div>

            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

