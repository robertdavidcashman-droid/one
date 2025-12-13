import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Importance of Early Legal Advice | Why You Need a Solicitor Immediately',
  description: 'Why early legal advice is crucial when dealing with the police. Learn how getting a solicitor immediately can protect your rights and improve your case outcome.',
  alternates: {
    canonical: 'https://criminaldefencekent.co.uk/importance-of-early-legal-advice',
  },
  openGraph: {
    title: 'Importance of Early Legal Advice | Why You Need a Solicitor Immediately',
    description: 'Why early legal advice is crucial when dealing with the police. Learn how getting a solicitor immediately can protect your rights.',
    url: 'https://criminaldefencekent.co.uk/importance-of-early-legal-advice',
    siteName: 'Criminal Defence Kent',
    type: 'website',
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen">
          <div className="prose prose-lg max-w-6xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-6">The Importance of Early Legal Advice</h1>
            
            <p className="lead text-xl text-slate-700 mb-8">
              Getting legal advice as early as possible when dealing with the police can significantly impact the outcome of your case. Early intervention by a solicitor can protect your rights and improve your position.
            </p>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Why Timing Matters</h2>
              <p className="mb-4">
                The earlier you get legal advice, the better protected you are. Research shows that cases where legal advice is obtained early have better outcomes.<sup>1</sup> This is because:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Your solicitor can advise you before you make any statements</li>
                <li>They can ensure your rights are protected from the start</li>
                <li>They can gather evidence and witness statements early</li>
                <li>They can challenge any procedural irregularities immediately</li>
                <li>They can negotiate with the police before charges are brought</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Protection of Your Rights</h2>
              <p className="mb-4">
                Under PACE Code C, you have the right to free legal advice at any time while in custody.<sup>2</sup> Early legal advice ensures:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>You understand your rights from the beginning</li>
                <li>Any breaches of procedure are identified and challenged early</li>
                <li>You are properly advised before making any decisions</li>
                <li>Your interests are protected throughout the process</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Pre-Interview Advice</h2>
              <p className="mb-4">
                Getting advice before a police interview is crucial. Your solicitor can:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Advise you on whether to answer questions or remain silent</li>
                <li>Help you prepare your responses</li>
                <li>Ensure the interview is conducted fairly</li>
                <li>Challenge inappropriate questions</li>
                <li>Ensure any evidence obtained is admissible</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Early Case Assessment</h2>
              <p className="mb-4">
                An early assessment of your case allows your solicitor to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Identify weaknesses in the prosecution case</li>
                <li>Gather evidence in your favour</li>
                <li>Identify potential witnesses</li>
                <li>Consider whether the case should proceed</li>
                <li>Negotiate with the police or CPS for a better outcome</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">The Consequences of Delay</h2>
              <p className="mb-4">
                Delaying legal advice can have serious consequences:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>You may make statements that harm your case</li>
                <li>Evidence may be lost or destroyed</li>
                <li>Witnesses may become unavailable</li>
                <li>Opportunities to challenge the case may be missed</li>
                <li>Your rights may be breached without challenge</li>
              </ul>
            </section>

            <section className="mb-8 bg-red-50 p-6 rounded-lg border border-red-200">
              <h2 className="text-2xl font-semibold mb-4 text-red-800">Free Legal Advice is Available</h2>
              <p className="mb-4">
                Legal advice at the police station is free under the Legal Aid scheme, regardless of your financial circumstances.<sup>3</sup> There is no reason to delay getting advice.
              </p>
            </section>

            <section className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h2 className="text-2xl font-semibold mb-4">Get Expert Legal Advice Now</h2>
              <p className="mb-4">
                If you are dealing with the police, whether you have been arrested or invited for a voluntary interview, get expert legal advice immediately. We provide free 24/7 legal advice and representation.
              </p>
              <p className="mb-4">
                <strong>Call us immediately on <a href="tel:01732247427" className="text-blue-600 hover:text-blue-800 font-semibold">01732 247427</a></strong> for free legal advice. The earlier you call, the better we can protect your interests.
              </p>
            </section>

            <section className="mt-12 pt-8 border-t border-slate-300">
              <h2 className="text-2xl font-semibold mb-4">References</h2>
              <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600">
                <li>Ministry of Justice, "Legal Aid Statistics: Legal Aid Agency Statistics Quarterly" (2023)</li>
                <li>Police and Criminal Evidence Act 1984, Code C, paragraph 6.1</li>
                <li>Legal Aid, Sentencing and Punishment of Offenders Act 2012, Section 13</li>
              </ol>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
