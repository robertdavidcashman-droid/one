import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - Police Station Agent',
  description: 'Common questions about police station representation and our services.',
  alternates: {
    canonical: 'https://policestationagent.com/FAQ',
  },
};

export default function FAQPage() {
  const faqs = [
    {
      question: 'What is police station representation?',
      answer: 'Police station representation involves having a qualified solicitor attend the police station with you to provide legal advice and representation during questioning or other police procedures.',
    },
    {
      question: 'When do I need a solicitor at a police station?',
      answer: 'You should have a solicitor present if you are being questioned, have been arrested, are attending a voluntary interview, or need legal advice about any police matter.',
    },
    {
      question: 'Are your services available 24/7?',
      answer: 'Yes, we provide 24/7 emergency legal representation services. Our solicitors are available around the clock to assist with urgent police station matters.',
    },
    {
      question: 'How quickly can a solicitor attend?',
      answer: 'We aim to have a solicitor attend the police station as quickly as possible. Response times vary depending on location and circumstances, but we prioritize urgent matters.',
    },
    {
      question: 'What areas do you cover?',
      answer: 'We provide representation at police stations across the UK, including Kent, London, and other regions. Contact us to confirm coverage in your specific area.',
    },
    {
      question: 'How much does police station representation cost?',
      answer: 'Costs vary depending on the nature and complexity of your case. We can provide information about fees and funding options when you contact us.',
    },
    {
      question: 'What happens during a police interview?',
      answer: 'During a police interview, you will be questioned about the matter under investigation. Having a solicitor present ensures your rights are protected and you receive expert legal advice.',
    },
    {
      question: 'Can I refuse to answer questions?',
      answer: 'You have the right to remain silent, but it is important to understand the implications. A solicitor can advise you on the best approach for your specific situation.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-[#0A2342] text-white py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-200 max-w-3xl">
              Common questions about police station representation
            </p>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-3 text-[#0A2342]">{faq.question}</h2>
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#0A2342] text-white p-6 rounded-lg mt-12">
                <h3 className="text-xl font-semibold mb-4">Still Have Questions?</h3>
                <p className="text-gray-200 mb-4">
                  If you have additional questions or need immediate legal assistance, please contact us. We're available 24/7.
                </p>
                <a
                  href="/contact"
                  className="bg-white text-[#0A2342] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}





