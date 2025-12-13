import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preparing for Police Interview | Expert Guide | Criminal Defence Kent',
  description: 'How to prepare for a police interview. Expert advice on your rights, what to expect, and why legal representation is essential. Free 24/7 advice available.',
  alternates: {
    canonical: 'https://criminaldefencekent.co.uk/preparing-for-police-interview',
  },
  openGraph: {
    title: 'Preparing for Police Interview | Expert Guide | Criminal Defence Kent',
    description: 'How to prepare for a police interview. Expert advice on your rights, what to expect, and why legal representation is essential.',
    url: 'https://criminaldefencekent.co.uk/preparing-for-police-interview',
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
            <h1 className="text-4xl font-bold mb-6">Preparing for a Police Interview</h1>
            
            <p className="lead text-xl text-slate-700 mb-8">
              Being interviewed by the police can be a stressful experience. Proper preparation and understanding your rights are essential for protecting your interests.
            </p>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Before the Interview</h2>
              
              <h3 className="text-2xl font-semibold mb-3 mt-6">1. Exercise Your Right to Legal Advice</h3>
              <p className="mb-4">
                You have the right to free legal advice under the Legal Aid scheme.<sup>1</sup> Always request a solicitor before answering any questions. This is your fundamental right and cannot be denied.
              </p>

              <h3 className="text-2xl font-semibold mb-3 mt-6">2. Understand the Caution</h3>
              <p className="mb-4">
                The police must give you the caution: "You do not have to say anything, but it may harm your defence if you do not mention when questioned something which you later rely on in court."<sup>2</sup> This means:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>You have the right to remain silent</li>
                <li>However, if you later rely on a fact in court that you didn't mention when questioned, this may be used against you</li>
                <li>You should wait for legal advice before deciding how to respond</li>
              </ul>

              <h3 className="text-2xl font-semibold mb-3 mt-6">3. Know What to Bring</h3>
              <p className="mb-4">If attending a voluntary interview, bring:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Photo identification</li>
                <li>Any relevant documents</li>
                <li>A list of questions you want to ask your solicitor</li>
                <li>Contact details for family or friends</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">During the Interview</h2>
              
              <h3 className="text-2xl font-semibold mb-3 mt-6">What to Expect</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>The interview will be audio or video recorded<sup>3</sup></li>
                <li>Your solicitor will be present throughout</li>
                <li>You can take breaks when needed</li>
                <li>You can consult privately with your solicitor at any time</li>
                <li>The interview should be conducted fairly and without pressure</li>
              </ul>

              <h3 className="text-2xl font-semibold mb-3 mt-6">Your Rights</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Right to remain silent</li>
                <li>Right to legal advice</li>
                <li>Right to have your solicitor present</li>
                <li>Right to consult privately with your solicitor</li>
                <li>Right to have the interview conducted fairly</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Why Legal Representation is Essential</h2>
              <p className="mb-4">
                Having a solicitor present during a police interview is crucial because:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>They understand the law and can advise you on your rights</li>
                <li>They can ensure the interview is conducted properly</li>
                <li>They can challenge inappropriate questions</li>
                <li>They can help you prepare your responses</li>
                <li>They can ensure any evidence obtained is admissible</li>
                <li>They can protect your interests throughout the process</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Common Mistakes to Avoid</h2>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Answering questions without legal advice:</strong> Always wait for your solicitor</li>
                <li><strong>Assuming you have to answer:</strong> You have the right to remain silent</li>
                <li><strong>Not understanding the caution:</strong> Make sure you understand what it means</li>
                <li><strong>Rushing to answer:</strong> Take your time and consult with your solicitor</li>
                <li><strong>Not taking breaks:</strong> You can request breaks when needed</li>
              </ul>
            </section>

            <section className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h2 className="text-2xl font-semibold mb-4">Get Expert Legal Representation</h2>
              <p className="mb-4">
                If you have been asked to attend a police interview, whether voluntary or under arrest, it is essential to have expert legal representation. We provide free 24/7 legal advice and representation.
              </p>
              <p className="mb-4">
                <strong>Call us immediately on <a href="tel:01732247427" className="text-blue-600 hover:text-blue-800 font-semibold">01732 247427</a></strong> to arrange representation before your interview.
              </p>
            </section>

            <section className="mt-12 pt-8 border-t border-slate-300">
              <h2 className="text-2xl font-semibold mb-4">References</h2>
              <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600">
                <li>Legal Aid, Sentencing and Punishment of Offenders Act 2012, Section 13</li>
                <li>Police and Criminal Evidence Act 1984, Code C, paragraph 10.5</li>
                <li>Police and Criminal Evidence Act 1984, Code E (Audio Recording) and Code F (Visual Recording)</li>
              </ol>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
