import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { Phone, Scale, MessageCircle, Mail, AlertTriangle, CheckCircle, Clock, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: "Magistrates' Court Bail Applications | Criminal Defence Kent",
  description: "Expert bail applications at Magistrates' Court with focus on viable addresses, conditions, and alternatives to remand. Available 24/7 in Kent.",
  alternates: {
    canonical: "https://criminaldefencekent.co.uk/services/bail-applications",
  },
  openGraph: {
    title: "Magistrates' Court Bail Applications | Criminal Defence Kent",
    description: "Expert bail applications at Magistrates' Court with focus on viable addresses, conditions, and alternatives to remand.",
    url: "https://criminaldefencekent.co.uk/services/bail-applications",
    siteName: 'Criminal Defence Kent',
    type: 'website',
  },
};

const bailServices = [
  {
    icon: Scale,
    title: "Magistrates' Court Bail Applications",
    description: "Expert representation for first appearance and bail variation applications."
  },
  {
    icon: Home,
    title: "Bail Address Solutions",
    description: "Help finding suitable bail addresses and preparing supporting documentation."
  },
  {
    icon: CheckCircle,
    title: "Condition Challenges",
    description: "Challenging unreasonable or disproportionate bail conditions."
  },
  {
    icon: Clock,
    title: "Urgent Applications",
    description: "Same-day bail applications for cases requiring immediate attention."
  }
];

const schemaData = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  "@id": "https://www.criminaldefencekent.co.uk/services/bail-applications",
  "name": "Magistrates' Court Bail Applications",
  "description": "Expert bail applications at Magistrates' Court with focus on viable addresses, conditions, and alternatives to remand.",
  "provider": {
    "@type": "Organization",
    "name": "Criminal Defence Kent"
  },
  "serviceType": "Criminal Court Bail Applications"
};

export default function ServicesBailApplications() {
  return (
    <>
      <JsonLd data={schemaData} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
        <Header />
        <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
          <div className="bg-slate-50 py-16">
            <div className="max-w-4xl mx-auto px-4">
              
              {/* Sticky Mobile CTA */}
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-800 text-white p-3 md:hidden">
                <div className="flex gap-2">
                  <a href="tel:03330497036" className="flex-1 bg-white text-blue-800 hover:bg-slate-100 text-center py-2 rounded text-sm font-bold">
                    Call Now
                  </a>
                  <a href="https://wa.me/447732247427" target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600 hover:bg-green-700 text-center py-2 rounded text-sm font-bold">
                    WhatsApp
                  </a>
                </div>
              </div>

              <div className="text-center mb-12">
                <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-blue-100 text-blue-800 mb-4">
                  Court Representation
                </div>
                <h1 className="text-4xl font-bold text-slate-800 mb-4">Magistrates' Court Bail Applications</h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Expert bail applications at the Magistrates' Court. We focus on viable addresses, reasonable conditions, and alternatives to remand.
                </p>
              </div>

              {/* Key Message */}
              <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 mb-8">
                <div className="p-6">
                  <div className="flex items-start gap-3">
                    <Scale className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-blue-800 mb-2">Bail: Your Right, Not a Privilege</h3>
                      <p className="text-blue-700 mb-4">The law presumes you should be granted bail unless there are compelling reasons to refuse it. We ensure the court considers all factors in your favour.</p>
                      <p className="text-blue-700 text-sm">Early preparation and strong advocacy can mean the difference between custody and freedom.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {bailServices.map((service, index) => (
                  <div key={index} className="rounded-xl border bg-white shadow hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <service.icon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 mb-2">{service.title}</h3>
                          <p className="text-slate-600 text-sm">{service.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* When Bail May Be Refused */}
              <div className="rounded-xl border bg-white shadow mb-8">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">When Courts May Refuse Bail</h2>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-red-700">Risk Factors:</h4>
                        <ul className="space-y-2 text-sm text-slate-700">
                          <li>• Risk of failing to surrender to court</li>
                          <li>• Risk of committing further offences</li>
                          <li>• Risk of interfering with witnesses</li>
                          <li>• Risk of obstructing justice</li>
                          <li>• For defendant's own protection</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-green-700">How We Help:</h4>
                        <ul className="space-y-2 text-sm text-slate-700">
                          <li>• Identify suitable bail addresses</li>
                          <li>• Propose realistic conditions</li>
                          <li>• Arrange character references</li>
                          <li>• Present mitigation evidence</li>
                          <li>• Challenge prosecution objections</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bail Conditions */}
              <div className="rounded-xl border bg-white shadow mb-8">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Common Bail Conditions & Challenges</h2>
                  <div className="space-y-4">
                    <p className="text-slate-600">Courts can impose conditions to address specific risks. We ensure conditions are proportionate and manageable:</p>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-amber-800 mb-2">Residence Conditions</h4>
                        <ul className="text-sm text-amber-700 space-y-1">
                          <li>• Live at specified address</li>
                          <li>• Not to leave area</li>
                          <li>• Curfew requirements</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Reporting Conditions</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Report to police station</li>
                          <li>• Regular contact with solicitor</li>
                          <li>• Surrender passport</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Contact Restrictions</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• No contact with witnesses</li>
                          <li>• Exclusion zones</li>
                          <li>• Social media restrictions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Court Partnership */}
              <div className="rounded-xl border bg-slate-100 shadow mb-8">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Court Representation Through Tuckers Solicitors LLP</h2>
                  <div>
                    <p className="text-slate-700 mb-4">
                      Criminal Defence Kent works in partnership with <strong>Tuckers Solicitors LLP</strong> to provide seamless representation from police station through to court appearance.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-slate-700">Magistrates' Court duty cover</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-slate-700">Crown Court representation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-slate-700">Legal aid applications</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-slate-700">Appeals and variations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="rounded-xl border bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl">
                <div className="p-8 text-center">
                  <AlertTriangle className="w-16 h-16 mx-auto text-white mb-4" />
                  <h3 className="text-3xl font-bold mb-4">Need Urgent Bail Application?</h3>
                  <p className="text-lg mb-6">
                    Time is critical for bail applications. Contact us immediately if you or someone you know has been charged and refused bail.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href="tel:03330497036" className="inline-flex items-center justify-center gap-2 bg-white text-red-600 hover:bg-slate-100 font-bold px-8 py-3 rounded-md">
                      <Phone className="w-5 h-5" /> Call: 0333 049 7036
                    </a>
                    <a href="https://wa.me/447732247427?text=I need urgent bail application help" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 border border-white text-white hover:bg-white hover:text-red-600 px-8 py-3 rounded-md font-bold">
                      <MessageCircle className="w-5 h-5" /> WhatsApp
                    </a>
                    <a href="mailto:robertcashman@defencelegalservices.co.uk" className="inline-flex items-center justify-center gap-2 border border-white text-white hover:bg-white hover:text-red-600 px-8 py-3 rounded-md font-bold">
                      <Mail className="w-5 h-5" /> Email
                    </a>
                  </div>
                </div>
              </div>

              {/* Related Services */}
              <div className="mt-12 text-center">
                <p className="text-slate-600 mb-6">Need other legal services?</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/services" className="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-100 text-slate-700">
                    Police Station Representation
                  </Link>
                  <Link href="/services/pre-charge-advice" className="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-100 text-slate-700">
                    Pre-Charge Advice
                  </Link>
                  <Link href="/contact" className="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-100 text-slate-700">
                    Contact Us
                  </Link>
                </div>
              </div>

              {/* Version info */}
              <div className="text-right mt-8">
                <p className="text-xs text-gray-500">v2.4 - {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

