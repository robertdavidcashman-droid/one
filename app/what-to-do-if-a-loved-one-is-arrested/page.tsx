import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'What to Do If a Loved One is Arrested | Family Guide | Criminal Defence Kent',
  description: 'Practical guide for families when a loved one is arrested in Kent. Learn what to do, your rights, and how to get immediate legal representation.',
  alternates: {
    canonical: 'https://criminaldefencekent.co.uk/what-to-do-if-a-loved-one-is-arrested',
  },
  openGraph: {
    title: 'What to Do If a Loved One is Arrested | Family Guide | Criminal Defence Kent',
    description: 'Practical guide for families when a loved one is arrested in Kent. Learn what to do and how to get immediate legal representation.',
    url: 'https://criminaldefencekent.co.uk/what-to-do-if-a-loved-one-is-arrested',
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
            <h1 className="text-4xl font-bold mb-6">What to Do If a Loved One is Arrested</h1>
            
            <p className="lead text-xl text-slate-700 mb-8">
              Finding out that a loved one has been arrested can be distressing. This guide explains what you can do to help and how to ensure they get the best legal representation.
            </p>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Immediate Steps</h2>
              
              <h3 className="text-2xl font-semibold mb-3 mt-6">1. Stay Calm</h3>
              <p className="mb-4">
                While it's natural to be worried, staying calm will help you take the right steps to help your loved one.
              </p>

              <h3 className="text-2xl font-semibold mb-3 mt-6">2. Find Out Which Police Station</h3>
              <p className="mb-4">
                Ask the police which station your loved one has been taken to. They should inform you of this, and your loved one has the right to have someone informed of their arrest.<sup>1</sup>
              </p>

              <h3 className="text-2xl font-semibold mb-3 mt-6">3. Instruct a Solicitor Immediately</h3>
              <p className="mb-4">
                You can instruct a solicitor on behalf of your loved one. This is crucial because:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Legal advice at the police station is free under Legal Aid<sup>2</sup></li>
                <li>The solicitor can attend the police station to represent them</li>
                <li>Early legal advice can significantly improve the outcome</li>
                <li>The solicitor can ensure their rights are protected</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">What Information to Provide</h2>
              <p className="mb-4">When calling a solicitor, have ready:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>The name of the person arrested</li>
                <li>Which police station they are at</li>
                <li>When they were arrested (if known)</li>
                <li>What they have been arrested for (if known)</li>
                <li>Any relevant medical conditions or vulnerabilities</li>
                <li>Your contact details</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Your Loved One's Rights</h2>
              <p className="mb-4">
                While in custody, your loved one has important rights:<sup>3</sup>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Right to free legal advice</li>
                <li>Right to have someone informed of their arrest</li>
                <li>Right to remain silent</li>
                <li>Right to medical attention if needed</li>
                <li>Right to be treated properly and with dignity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">What Happens Next</h2>
              <p className="mb-4">After arrest, the process typically involves:</p>
              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li><strong>Booking in:</strong> Your loved one will be processed at the police station</li>
                <li><strong>Legal advice:</strong> A solicitor will attend to provide representation</li>
                <li><strong>Interview:</strong> They may be interviewed (with their solicitor present)</li>
                <li><strong>Decision:</strong> The police will decide whether to charge, release under investigation, or take no further action</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Can You Visit?</h2>
              <p className="mb-4">
                Generally, you cannot visit someone in police custody. However, you can:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Call the police station to check on their welfare</li>
                <li>Ensure they have requested legal advice</li>
                <li>Provide information to their solicitor if helpful</li>
                <li>Be available to collect them if they are released</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">If Your Loved One is Vulnerable</h2>
              <p className="mb-4">
                If your loved one is vulnerable (has mental health issues, learning disabilities, etc.), inform the solicitor immediately. They may be entitled to an appropriate adult in addition to legal representation.<sup>4</sup>
              </p>
            </section>

            <section className="mb-8 bg-red-50 p-6 rounded-lg border border-red-200">
              <h2 className="text-2xl font-semibold mb-4 text-red-800">Emergency: Act Quickly</h2>
              <p className="mb-4">
                Time is important. The sooner a solicitor is instructed, the better. Your loved one should not be interviewed without legal representation unless they specifically waive this right.
              </p>
            </section>

            <section className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h2 className="text-2xl font-semibold mb-4">Get Immediate Legal Representation</h2>
              <p className="mb-4">
                If a loved one has been arrested, call us immediately. We provide free 24/7 legal advice and representation at all Kent police stations. You can instruct us on their behalf.
              </p>
              <p className="mb-4">
                <strong>Call us now on <a href="tel:03330497036" className="text-blue-600 hover:text-blue-800 font-semibold">0333 049 7036</a></strong> for immediate assistance.
              </p>
            </section>

            <section className="mt-12 pt-8 border-t border-slate-300">
              <h2 className="text-2xl font-semibold mb-4">References</h2>
              <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600">
                <li>Police and Criminal Evidence Act 1984, Code C, paragraph 5.1</li>
                <li>Legal Aid, Sentencing and Punishment of Offenders Act 2012, Section 13</li>
                <li>Police and Criminal Evidence Act 1984, Code C, paragraph 3.1</li>
                <li>Police and Criminal Evidence Act 1984, Code C, paragraph 3.15</li>
              </ol>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
