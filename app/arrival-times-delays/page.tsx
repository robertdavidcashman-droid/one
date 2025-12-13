import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Arrival Times & Delays | Police Station Representation | Criminal Defence Kent',
  description: 'Expected arrival times for police station representation in Kent. Understanding delays and your rights when waiting for a solicitor.',
  alternates: {
    canonical: 'https://policestationagent.com/arrival-times-delays',
  },
  openGraph: {
    title: 'Arrival Times & Delays | Police Station Representation | Criminal Defence Kent',
    description: 'Expected arrival times for police station representation in Kent. Understanding delays and your rights when waiting for a solicitor.',
    url: 'https://policestationagent.com/arrival-times-delays',
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
          <div className="prose prose-lg max-w-6xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-6">Arrival Times & Delays for Police Station Representation</h1>
            
            <p className="lead text-xl text-slate-700 mb-8">
              Understanding expected arrival times and your rights regarding delays when waiting for legal representation at the police station.
            </p>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Expected Arrival Times</h2>
              <p className="mb-4">
                Under PACE Code C, the police must allow you to consult with a solicitor as soon as practicable.<sup>1</sup> Typical arrival times vary depending on:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Location:</strong> Urban areas typically 30-60 minutes, rural areas may take longer</li>
                <li><strong>Time of day:</strong> Peak times may have longer delays</li>
                <li><strong>Traffic conditions:</strong> Can significantly impact arrival times</li>
                <li><strong>Availability:</strong> Solicitor availability at the time of request</li>
              </ul>
              <p className="mb-4">
                We aim to arrive within 30-60 minutes for most Kent police stations, though this can vary depending on circumstances.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Your Rights During Delays</h2>
              <p className="mb-4">
                If there is a delay in the solicitor's arrival, you have important rights:<sup>2</sup>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>You should not be interviewed until your solicitor arrives (unless you waive this right)</li>
                <li>You can request updates on the solicitor's estimated arrival time</li>
                <li>You can speak to the solicitor on the phone while waiting</li>
                <li>The police should not put pressure on you to proceed without a solicitor</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">When Can the Police Proceed Without Waiting?</h2>
              <p className="mb-4">
                The police can only proceed with an interview without waiting for a solicitor in very limited circumstances:<sup>3</sup>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>If waiting would cause unreasonable delay to the investigation</li>
                <li>If waiting would lead to interference with evidence</li>
                <li>If waiting would lead to harm to other people</li>
                <li>If waiting would lead to alerting other suspects</li>
                <li>If the solicitor cannot be contacted or refuses to attend</li>
              </ul>
              <p className="mb-4">
                Even in these circumstances, you should still be allowed to speak to a solicitor on the phone before the interview.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Telephone Advice While Waiting</h2>
              <p className="mb-4">
                While waiting for your solicitor to arrive, you can receive advice over the telephone.<sup>4</sup> This allows you to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Get immediate advice on your rights</li>
                <li>Understand what to expect during the interview</li>
                <li>Decide whether to wait for the solicitor or proceed</li>
                <li>Get guidance on how to respond to police questions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">What to Do If There's a Delay</h2>
              <p className="mb-4">If there is an unexpected delay:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Ask the custody officer for an update on the solicitor's arrival time</li>
                <li>Request to speak to the solicitor on the phone</li>
                <li>Do not feel pressured to proceed without a solicitor</li>
                <li>Remember: you have the right to wait for your solicitor</li>
                <li>If the delay is unreasonable, this may be a breach of your rights</li>
              </ul>
            </section>

            <section className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h2 className="text-2xl font-semibold mb-4">24/7 Availability</h2>
              <p className="mb-4">
                We provide 24/7 police station representation across Kent. When you request our services, we will attend as quickly as possible. In most cases, we can provide telephone advice immediately while travelling to the station.
              </p>
              <p className="mb-4">
                <strong>Call us on <a href="tel:01732247427" className="text-blue-600 hover:text-blue-800 font-semibold">01732 247427</a></strong> for immediate advice and representation.
              </p>
            </section>

            <section className="mt-12 pt-8 border-t border-slate-300">
              <h2 className="text-2xl font-semibold mb-4">References</h2>
              <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600">
                <li>Police and Criminal Evidence Act 1984, Code C, paragraph 6.1</li>
                <li>Police and Criminal Evidence Act 1984, Code C, paragraph 6.6</li>
                <li>Police and Criminal Evidence Act 1984, Code C, paragraph 6.6(b)</li>
                <li>Police and Criminal Evidence Act 1984, Code C, paragraph 6.5</li>
              </ol>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
