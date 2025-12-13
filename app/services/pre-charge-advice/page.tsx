import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { Phone, Scale, MessageCircle, Mail, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: "Pre-Charge Advice Solicitor Kent | Prevent Charges",
  description: "Strategic pre-charge representations to prevent weak prosecutions in Kent. Expert advice before charging decisions. Available 24/7.",
  alternates: {
    canonical: "https://policestationagent.com/services/pre-charge-advice",
  },
  openGraph: {
    title: "Pre-Charge Advice Solicitor Kent | Prevent Charges",
    description: "Strategic pre-charge representations to prevent weak prosecutions in Kent. Expert advice before charging decisions.",
    url: "https://policestationagent.com/services/pre-charge-advice",
    siteName: 'Criminal Defence Kent',
    type: 'website',
  },
};

const services = [
  {
    icon: Scale,
    title: "Pre-Charge Representations",
    description: "Strategic submissions to police/CPS before charging decisions are made."
  },
  {
    icon: Clock,
    title: "Time Limit Monitoring",
    description: "Ensuring police comply with custody time limits and bail return dates."
  },
  {
    icon: CheckCircle,
    title: "Disclosure Analysis", 
    description: "Reviewing evidence and identifying weaknesses in the prosecution case."
  },
  {
    icon: AlertTriangle,
    title: "Bail Condition Challenges",
    description: "Varying or removing inappropriate or excessive bail conditions."
  }
];

const schemaData = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  "@id": "https://policestationagent.com/services/pre-charge-advice",
  "name": "Pre-Charge Advice Solicitor Kent | Prevent Charges",
  "description": "Strategic pre-charge representations to prevent weak prosecutions in Kent. Expert advice before charging decisions.",
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
  "serviceType": "Pre-Charge Criminal Defence Advice",
  "areaServed": {
    "@type": "AdministrativeArea",
    "name": "Kent"
  },
  "url": "https://policestationagent.com/services/pre-charge-advice"
};

export default function ServicesPreChargeAdvice() {
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
                  <a href="tel:01732247427" className="flex-1 bg-white text-blue-800 hover:bg-slate-100 text-center py-2 rounded text-sm font-bold">
                    Call Now
                  </a>
                  <a href="https://wa.me/447490126251" target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600 hover:bg-green-700 text-center py-2 rounded text-sm font-bold">
                    WhatsApp
                  </a>
                </div>
              </div>

              <div className="text-center mb-12">
                <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-amber-100 text-amber-800 mb-4">
                  Strategic Defence
                </div>
                <h1 className="text-4xl font-bold text-slate-800 mb-4">Pre-Charge Advice & Engagement</h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Proactive legal intervention before charges are brought. Strategic representations to prevent weak or premature prosecutions.
                </p>
              </div>

              {/* Key Message */}
              <div className="rounded-xl border bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500 mb-8">
                <div className="p-6">
                  <div className="flex items-start gap-3">
                    <Scale className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-amber-800 mb-2">Prevention Better Than Cure</h3>
                      <p className="text-amber-700 mb-4">The best time to influence a case is before charges are brought. Strategic pre-charge engagement can prevent prosecutions or secure better outcomes.</p>
                      <p className="text-amber-700 text-sm">Early intervention often achieves results that become impossible once formal proceedings begin.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {services.map((service, index) => (
                  <div key={index} className="rounded-xl border bg-white shadow hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <service.icon className="w-6 h-6 text-blue-600" />
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

              {/* When We Help */}
              <div className="rounded-xl border bg-white shadow mb-8">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">When Pre-Charge Advice Helps</h2>
                  <div className="space-y-4 text-slate-700">
                    <p>Pre-charge advice and engagement is particularly valuable in complex cases, regulatory matters, or where the evidence is unclear or disputed.</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Common Scenarios:</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Corporate or professional investigations</li>
                          <li>• Regulatory enforcement actions</li>
                          <li>• Complex fraud allegations</li>
                          <li>• Historical or historical abuse claims</li>
                          <li>• Cases with disputed evidence</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Potential Outcomes:</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• No further action</li>
                          <li>• Reduced charges</li>
                          <li>• Conditional cautioning</li>
                          <li>• More suitable disposal</li>
                          <li>• Better bail conditions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="rounded-xl border bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-xl">
                <div className="p-8 text-center">
                  <h3 className="text-3xl font-bold text-amber-300 mb-4">Under Investigation?</h3>
                  <p className="text-lg text-blue-100 mb-6">
                    Early intervention can make all the difference. Contact us to discuss strategic pre-charge representations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href="tel:01732247427" className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold px-8 py-3 rounded-md">
                      <Phone className="w-5 h-5" /> Call: 01732 247427
                    </a>
                    <a href="https://wa.me/447490126251?text=I need pre-charge advice" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 border border-green-400 text-green-400 hover:bg-green-400 hover:text-blue-900 px-8 py-3 rounded-md font-bold">
                      <MessageCircle className="w-5 h-5" /> WhatsApp
                    </a>
                    <a href="mailto:robertcashman@defencelegalservices.co.uk" className="inline-flex items-center justify-center gap-2 border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-blue-900 px-8 py-3 rounded-md font-bold">
                      <Mail className="w-5 h-5" /> Email
                    </a>
                  </div>
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

