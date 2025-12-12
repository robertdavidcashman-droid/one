import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vulnerable Adults in Custody | Special Protections | Criminal Defence Kent',
  description: 'Special protections for vulnerable adults in police custody. Learn about appropriate adults, mental health assessments, and your rights under PACE Code C.',
  alternates: {
    canonical: 'https://criminaldefencekent.co.uk/vulnerable-adults-in-custody',
  },
  openGraph: {
    title: 'Vulnerable Adults in Custody | Special Protections | Criminal Defence Kent',
    description: 'Special protections for vulnerable adults in police custody. Learn about appropriate adults, mental health assessments, and your rights under PACE Code C.',
    url: 'https://criminaldefencekent.co.uk/vulnerable-adults-in-custody',
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
            <h1 className="text-4xl font-bold mb-6">Vulnerable Adults in Custody: Special Protections</h1>
            
            <p className="lead text-xl text-slate-700 mb-8">
              Vulnerable adults in police custody are entitled to special protections under PACE Code C. Understanding these rights is crucial for ensuring fair treatment and proper legal representation.
            </p>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Who is Considered a Vulnerable Adult?</h2>
              <p className="mb-4">
                Under PACE Code C, a vulnerable adult is someone who, because of their mental state or capacity, may not understand the significance of what is said to them or their replies.<sup>1</sup> This includes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Adults with mental health conditions</li>
                <li>Adults with learning disabilities</li>
                <li>Adults with communication difficulties</li>
                <li>Adults who may be particularly suggestible</li>
                <li>Adults under the influence of drugs or alcohol</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">The Role of an Appropriate Adult</h2>
              <p className="mb-4">
                When a vulnerable adult is detained, the police must arrange for an appropriate adult to be present.<sup>2</sup> The appropriate adult should:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Be present during all interviews</li>
                <li>Ensure the vulnerable adult understands their rights</li>
                <li>Facilitate communication between the vulnerable adult and police</li>
                <li>Observe whether the interview is being conducted properly</li>
                <li>Advise the vulnerable adult</li>
              </ul>
              <p className="mb-4">
                An appropriate adult cannot be a police officer, police staff, or someone involved in the investigation.<sup>3</sup> They should be someone who has the vulnerable adult's welfare at heart.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Mental Health Assessments</h2>
              <p className="mb-4">
                If there are concerns about a detainee's mental health, the custody officer must call a healthcare professional.<sup>4</sup> This is particularly important for vulnerable adults who may:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Be at risk of self-harm</li>
                <li>Require medication</li>
                <li>Need a mental health assessment</li>
                <li>Require transfer to a place of safety under the Mental Health Act 1983</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Interview Safeguards</h2>
              <p className="mb-4">
                Vulnerable adults have additional protections during police interviews:<sup>5</sup>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>An appropriate adult must be present</li>
                <li>Interviews should be conducted in a way that is appropriate to the vulnerable adult's needs</li>
                <li>Regular breaks should be taken</li>
                <li>Questions should be clear and simple</li>
                <li>The vulnerable adult should be given time to understand and respond</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">Why Legal Representation is Essential</h2>
              <p className="mb-4">
                Vulnerable adults are particularly at risk during police interviews. A solicitor can:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Ensure the appropriate adult is present and acting properly</li>
                <li>Challenge any breaches of PACE Code C</li>
                <li>Ensure the vulnerable adult's rights are protected</li>
                <li>Advise on whether the interview should proceed</li>
                <li>Ensure any evidence obtained is admissible</li>
              </ul>
            </section>

            <section className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h2 className="text-2xl font-semibold mb-4">Get Expert Help Now</h2>
              <p className="mb-4">
                If you or someone you know is a vulnerable adult in police custody, it is essential to have expert legal representation. We specialise in representing vulnerable adults and ensuring their rights are fully protected.
              </p>
              <p className="mb-4">
                <strong>Call us 24/7 on <a href="tel:03330497036" className="text-blue-600 hover:text-blue-800 font-semibold">0333 049 7036</a></strong> for free legal advice and representation.
              </p>
            </section>

            <section className="mt-12 pt-8 border-t border-slate-300">
              <h2 className="text-2xl font-semibold mb-4">References</h2>
              <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600">
                <li>Police and Criminal Evidence Act 1984, Code C, paragraph 1.13(d)</li>
                <li>Police and Criminal Evidence Act 1984, Code C, paragraph 3.15</li>
                <li>Police and Criminal Evidence Act 1984, Code C, paragraph 1.7</li>
                <li>Police and Criminal Evidence Act 1984, Code C, paragraph 9.5</li>
                <li>Police and Criminal Evidence Act 1984, Code C, paragraph 11.15</li>
              </ol>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
