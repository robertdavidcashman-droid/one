import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#0A2342] text-white py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-gray-200">
              Available 24/7 for urgent legal assistance
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-12 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-10 rounded-2xl shadow-xl">
                <div className="mb-12">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full mb-6">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Emergency Service Available</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-gray-50 rounded-xl border-l-4 border-[#0A2342]">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#0A2342] rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Emergency Legal Assistance</h3>
                        <p className="text-gray-700 leading-relaxed">
                          If you or someone you know has been arrested or needs urgent legal representation at a police station, contact us immediately. Our experienced solicitors are available around the clock to provide expert legal representation when you need it most.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">24/7 Availability</h3>
                        <p className="text-gray-700 leading-relaxed">
                          We understand that legal emergencies don't happen on a schedule. Our team is available around the clock to provide expert legal representation. Whether it's the middle of the night, a weekend, or a holiday, we're here to help.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-[#0A2342] text-white rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">How to Reach Us</h3>
                        <p className="text-gray-200 leading-relaxed mb-4">
                          For immediate assistance, please use your preferred method of contact. Our experienced solicitors are ready to help protect your rights and provide expert legal guidance.
                        </p>
                        <p className="text-gray-300 text-sm">
                          Contact information and emergency hotline details will be available through our main channels. We respond to all inquiries promptly, especially urgent matters.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-200">
                  <div className="text-center">
                    <Link
                      href="/services"
                      className="inline-block bg-[#0A2342] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#08192e] transition-all shadow-lg hover:shadow-xl"
                    >
                      Learn More About Our Services
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}



