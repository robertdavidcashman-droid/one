import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4 text-white">Police Station Agent</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Expert legal representation at police stations across the UK. Our experienced solicitors are available 24/7 to provide immediate assistance when you need it most.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-400">24/7 Emergency Service</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6 text-lg">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/police-stations" className="text-gray-400 hover:text-white transition-colors">
                  Police Stations
                </Link>
              </li>
              <li>
                <Link href="/coverage" className="text-gray-400 hover:text-white transition-colors">
                  Coverage
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/what-we-do" className="text-gray-400 hover:text-white transition-colors">
                  What We Do
                </Link>
              </li>
              <li>
                <Link href="/why-use-us" className="text-gray-400 hover:text-white transition-colors">
                  Why Use Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-6 text-lg">Our Services</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/services/police-station-representation" className="hover:text-white transition-colors">
                  Police Station Representation
                </Link>
              </li>
              <li>
                <Link href="/services/criminal-defense" className="hover:text-white transition-colors">
                  Criminal Defense
                </Link>
              </li>
              <li>
                <Link href="/services/legal-advice" className="hover:text-white transition-colors">
                  Legal Advice
                </Link>
              </li>
              <li className="pt-2">
                <span className="text-gray-500">24/7 Emergency Service</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-6 text-lg">Contact Information</h4>
            <div className="space-y-4 text-sm text-gray-400">
              <div>
                <p className="font-medium text-white mb-1">Emergency Legal Assistance</p>
                <p>Available 24 hours a day, 7 days a week</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">Coverage Area</p>
                <p>Police stations across the UK</p>
              </div>
              <div className="pt-4">
                <Link 
                  href="/contact" 
                  className="inline-block bg-[#0A2342] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#08192e] transition-all"
                >
                  Get Help Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} Police Station Agent. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
                Terms and Conditions
              </Link>
              <Link href="/complaints" className="hover:text-white transition-colors">
                Complaints
              </Link>
              <Link href="/accessibility" className="hover:text-white transition-colors">
                Accessibility
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookies
              </Link>
              <Link href="/gdpr" className="hover:text-white transition-colors">
                GDPR
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}





