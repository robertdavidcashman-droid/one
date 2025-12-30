import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_DOMAIN, SITE_URL } from '@/config/site';
import Script from 'next/script';
import { FAQPage } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: "Police Station Duty Solicitor Kent | Police Station Representation Solicitor | FREE Legal Advice",
  description: "Police Station Duty Solicitor Kent - Expert police station representation by qualified solicitor. FREE legal advice under Legal Aid at all Kent custody suites. Accredited Duty Solicitor & Higher Court Advocate Robert Cashman. Medway, Maidstone, Canterbury, Gravesend. Call 01732 247427.",
  alternates: {
    canonical: `https://${SITE_DOMAIN}/services/police-station-representation`,
  },
  openGraph: {
    title: "Police Station Duty Solicitor Kent | Duty Solicitor Representation Kent | FREE Advice",
    description: "Police Station Duty Solicitor Kent - Expert representation by qualified solicitor Robert Cashman. Accredited Duty Solicitor & Higher Court Advocate. FREE legal advice under Legal Aid at Medway, Canterbury, Maidstone, Gravesend custody suites.",
    url: `https://${SITE_DOMAIN}/services/police-station-representation`,
    siteName: 'Criminal Defence Kent',
    type: 'website',
  },
};

// Service schema for Police Station Representation
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Police Station Representation",
  "description": "Police Station Duty Solicitor Kent - FREE police station representation by qualified solicitor across all Kent custody suites. Accredited Duty Solicitor available for police interviews, voluntary interviews, and custody matters.",
  "provider": {
    "@type": "LegalService",
    "name": "Criminal Defence Kent",
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
      question: "Are police station solicitors independent of the police?",
      answer: "Yes, absolutely. Your solicitor is completely independent of the police and works only for YOU. We are not employed by, paid by, or connected to the police in any way. Legal Aid funds your representation, not the police. Everything you discuss with your solicitor is confidential and cannot be shared with police without your consent."
    },
    {
      question: "Is police station rep service free in Kent?",
      answer: "Yes. Everyone arrested or invited for a voluntary interview in Kent is entitled to FREE legal advice at the police station under Legal Aid. This is a statutory right under PACE 1984 and is not means-tested."
    },
    {
      question: "How quickly can a duty solicitor attend in Kent?",
      answer: "We aim to attend any Kent custody suite within 30-45 minutes. Our extended hours service covers all Kent police stations including evenings, weekends and bank holidays, ensuring rapid response across all Kent custody suites."
    },
    {
      question: "Which Kent custody suites do you cover as a duty solicitor?",
      answer: "We cover all Kent custody suites including Medway (Gillingham), Maidstone, North Kent (Gravesend), Canterbury, Tonbridge, Folkestone, Ashford, Dartford, Sittingbourne, Sevenoaks, Tunbridge Wells, Margate, Dover, Swanley, and Bluewater. We also cover voluntary interview locations across Kent."
    },
    {
      question: "What's the difference between a qualified solicitor and a police station agent?",
      answer: "A qualified solicitor is a fully trained legal professional who has completed the Legal Practice Course and training contract. A police station agent (accredited representative) is a non-solicitor who has passed the Police Station Qualification. Robert Cashman is a qualified solicitor with 35+ years experience and Higher Court Advocate status — not just an agent — providing expert independent legal advice."
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
            <h1 className="text-4xl font-bold mb-6">Independent Police Station Solicitor Kent</h1>
            <p className="lead text-xl text-slate-700 mb-8">
              Expert police station representation by qualified solicitor. FREE legal advice under Legal Aid at all Kent custody suites. Independent Defence Solicitor & Higher Court Advocate Robert Cashman - 35+ years experience, 21,000+ cases.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4 mb-8">
              <p className="text-green-800 font-medium text-sm m-0">🛡️ <strong>We are completely independent of the police.</strong> Your solicitor works for YOU — not the police, not the CPS. Everything you discuss is confidential.</p>
            </div>

            <h2 className="text-2xl font-bold mt-10">What is police station representation?</h2>
            <p>
              Police station representation means having a criminal defence solicitor (or accredited police station representative) advise you and attend with you
              <strong> before</strong> and <strong>during</strong> a police interview. It also includes protecting your rights in custody, challenging unfair procedure,
              and making representations about charging decisions, bail, and release.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-5 my-8">
              <h3 className="text-lg font-bold m-0 mb-2">If you’re in custody right now</h3>
              <p className="m-0">
                Tell the custody sergeant you want <strong>your own solicitor</strong> and ask them to call us. If you don’t have a solicitor, ask for the <strong>duty solicitor</strong>.
                Either way, police station advice is <strong>free</strong> and you should not be interviewed until you’ve had legal advice.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <a
                  href="tel:01732247427"
                  className="no-underline inline-flex items-center justify-center rounded-md px-5 py-3 bg-red-600 text-white font-bold hover:bg-red-700"
                >
                  Call 01732 247427
                </a>
                <Link
                  href="/contact"
                  className="no-underline inline-flex items-center justify-center rounded-md px-5 py-3 bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Contact online
                </Link>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-10">Is it really free?</h2>
            <p>
              Yes. Police station advice is provided under <strong>Legal Aid</strong> and is <strong>not means-tested</strong>. You can request the duty solicitor or ask for your own solicitor.
              Do not be put off by money concerns.
            </p>

            <h2 className="text-2xl font-bold mt-10">Why having a solicitor early matters</h2>
            <p>
              For many cases, the interview under caution is where the police build their evidence. People often try to “explain it away” and end up filling gaps in the police case.
              Early advice helps you avoid mistakes that are difficult to fix later.
            </p>
            <ul>
              <li><strong>Interview strategy:</strong> answer questions, make a prepared statement, or go “no comment” where appropriate.</li>
              <li><strong>Disclosure:</strong> press for enough information to advise you properly before interview.</li>
              <li><strong>Fairness:</strong> challenge improper questioning, oppressive tactics, or failure to follow custody rules.</li>
              <li><strong>Outcomes:</strong> make representations that can help avoid charge, influence bail, or speed up release.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-10">Disclosure before interview (what you should expect)</h2>
            <p>
              Before interview, police should provide enough information about the allegation and why you are suspected to allow your solicitor to advise you.
              If disclosure is vague or incomplete, a solicitor can push back and record objections.
            </p>
            <p>
              Disclosure often includes an outline of the allegation, key points from statements, and any material that is central to the interview (for example CCTV, messages, or forensic issues).
              It is common for people without legal advice to be interviewed “blind” and get caught out by evidence they didn’t know existed.
            </p>

            <h2 className="text-2xl font-bold mt-10">Voluntary interviews are still formal</h2>
            <p>
              “Voluntary” does not mean informal. A voluntary interview is usually recorded and conducted under caution. The consequences can be exactly the same as an interview after arrest.
              You still have the right to free legal advice and representation.
            </p>
            <p>
              See: <Link href="/voluntary-interviews">Voluntary interviews</Link>.
            </p>

            <h2 className="text-2xl font-bold mt-10">Who we help across Kent</h2>
            <p>
              We cover the main custody suites and interview locations across Kent. If you’re not sure where someone has been taken, tell us the arrest location or the officer/station details
              and we’ll advise the next steps.
            </p>
            <p>
              See: <Link href="/kent-police-stations">Kent police stations</Link>.
            </p>

            <h2 className="text-2xl font-bold mt-10">What happens when we attend</h2>
            <ol>
              <li><strong>We speak to the investigating officer</strong> and request pre-interview disclosure.</li>
              <li><strong>We advise you privately</strong> on the allegation, risks, and the safest interview approach.</li>
              <li><strong>We attend the interview</strong> and intervene if questioning becomes unfair or unclear.</li>
              <li><strong>We advise on release</strong> (bail, conditions, RUI) and next steps after interview.</li>
            </ol>

            <h2 className="text-2xl font-bold mt-10">Related guidance</h2>
            <ul>
              <li><Link href="/police-interview-rights">Your rights in a police interview</Link></li>
              <li><Link href="/no-comment-interview">No comment interviews</Link></li>
              <li><Link href="/pace-code-c">PACE Code C (custody rights)</Link></li>
              <li><Link href="/police-custody-rights">Police custody rights</Link></li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
