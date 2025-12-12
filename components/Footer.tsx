import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12 text-sm">
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-slate-900 mb-4 text-lg text-white">Police Station Agent</h3>
            <p className="text-slate-600 mb-6 leading-relaxed text-white">
              Expert duty solicitor providing police station representation across Kent. We specialise in protecting your rights during police interviews.
            </p>
            <div className="flex gap-4" aria-label="Social media links">
              <a 
                href="sms:07535494446?body=I%20need%20police%20station%20representation" 
                className="text-blue-600 hover:text-blue-700 transition-colors" 
                title="Text us" 
                aria-label="Send us a text message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle w-6 h-6" aria-hidden="true">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                </svg>
              </a>
              <a 
                href="https://wa.me/447490126251?text=I%20need%20police%20station%20representation" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-green-600 hover:text-green-700 transition-colors" 
                title="WhatsApp" 
                aria-label="Contact us on WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle w-6 h-6" aria-hidden="true">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                </svg>
              </a>
              <a 
                href="https://www.facebook.com/policestationagent" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-700 transition-colors" 
                title="Facebook" 
                aria-label="Visit our Facebook page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook w-6 h-6" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/police-station-agent" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 hover:text-blue-600 transition-colors" 
                title="LinkedIn" 
                aria-label="Visit our LinkedIn page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin w-6 h-6" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a 
                href="https://twitter.com/policestation" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-500 hover:text-slate-600" 
                title="Twitter/X" 
                aria-label="Visit our Twitter page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x w-6 h-6" aria-hidden="true">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-900 mb-4 text-lg text-white">Services</h3>
            <nav aria-label="Footer services links">
              <ul className="space-y-3">
                <li>
                  <Link href="/services" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    Police Station Advice
                  </Link>
                </li>
                <li>
                  <Link href="/fees" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    Legal Aid & Fees
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/coverage" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    Areas Covered
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/join" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    Join Network
                  </Link>
                </li>
                <li>
                  <Link href="/police-stations" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    Police Stations
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-900 mb-4 text-lg text-white">Help & Advice</h3>
            <nav aria-label="Footer help links">
              <ul className="space-y-3">
                <li>
                  <Link href="/refusingpoliceinterview" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    Refusing Interview
                  </Link>
                </li>
                <li>
                  <Link href="/policeinterviewhelp" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    Interview Help
                  </Link>
                </li>
                <li>
                  <Link href="/what-happens-if-ignore-police-interview" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    Ignoring Interview
                  </Link>
                </li>
                <li>
                  <Link href="/arrestednow" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    Emergency Help (Family)
                  </Link>
                </li>
                <li>
                  <Link href="/freelegaladvice" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    Is it Free?
                  </Link>
                </li>
                <li>
                  <Link href="/servicesvoluntaryinterviews" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    Voluntary Interview
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-900 mb-4 text-lg text-white">Contact</h3>
            <address className="not-italic">
              <ul className="space-y-3">
                <li>
                  <a href="tel:03330497036" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    0333 0497 036
                  </a>
                </li>
                <li>
                  <a href="mailto:robertcashman@defencelegalservices.co.uk" className="text-slate-600 hover:text-blue-600 transition-colors font-medium break-all text-white">
                    robertcashman@defencelegalservices.co.uk
                  </a>
                </li>
                <li>
                  <a href="sms:07535494446?body=I%20need%20police%20station%20representation" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle w-4 h-4">
                      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                    </svg>
                    Text: 07535 494446
                  </a>
                </li>
              </ul>
            </address>
            <div className="mt-6">
              <h3 className="font-bold text-slate-900 mb-2 text-sm text-white">Useful Links</h3>
              <ul className="space-y-2 text-sm mb-6">
                <li>
                  <Link href="/blog" className="text-slate-600 hover:text-blue-600 transition-colors text-white">
                    Blog & Articles
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-slate-600 hover:text-blue-600 transition-colors text-white">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link href="/police-stations" className="text-slate-600 hover:text-blue-600 transition-colors text-white">
                    Police Stations
                  </Link>
                </li>
                <li>
                  <Link href="/coverage" className="text-slate-600 hover:text-blue-600 transition-colors text-white">
                    Areas Covered
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-slate-600 hover:text-blue-600 transition-colors text-white">
                    About Us
                  </Link>
                </li>
              </ul>
              <h3 className="font-bold text-slate-900 mb-2 text-sm text-white">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms-and-conditions" className="text-slate-600 hover:text-blue-600 transition-colors text-white">
                    Website Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-slate-600 hover:text-blue-600 transition-colors text-white">
                    Website Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-slate-600 hover:text-blue-600 transition-colors text-white">
                    Cookies Policy
                  </Link>
                </li>
                <li>
                  <Link href="/gdpr" className="text-slate-600 hover:text-blue-600 transition-colors text-white">
                    GDPR Compliance
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility" className="text-slate-600 hover:text-blue-600 transition-colors text-white">
                    Accessibility Statement
                  </Link>
                </li>
                <li>
                  <Link href="/attendanceterms" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    Agency Terms & Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/servicerates" className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-white">
                    Agency Service Rates
                  </Link>
                </li>
                <li>
                  <Link href="/complaints" className="text-slate-600 hover:text-blue-600 transition-colors text-white">
                    Complaints
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-200 mt-12 pt-8 text-center text-sm text-slate-500">
          <div className="mb-6 max-w-4xl mx-auto p-5 bg-slate-50 rounded-lg border border-slate-200 shadow-sm">
            <p className="leading-relaxed text-slate-800 mb-3">
              <strong>Robert Cashman is a criminal defence solicitor. All legal services are provided through Tuckers Solicitors, which is authorised and regulated by the Solicitors Regulation Authority (SRA ID: 127795).</strong>
            </p>
            <p className="leading-relaxed text-slate-600 text-sm">
              <span className="font-semibold text-slate-700">Accredited Court & Police Station Duty Solicitor:</span> Accredited Court & Police Station Duty Solicitor: Police Station Agent specialises in duty solicitor-led police station representation across Kent.
            </p>
          </div>
          <p className="mb-4 font-medium text-white">
            Copyright {currentYear} by Defence Legal Services Limited T/A Police Station Agent. Company No. 09900871
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
            <Link href="/privacy" className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 text-white">
              Web Privacy
            </Link>
            <span className="hidden md:inline text-slate-500" aria-hidden="true">|</span>
            <Link href="/terms-and-conditions" className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 text-white">
              Web Terms
            </Link>
            <span className="hidden md:inline text-slate-500" aria-hidden="true">|</span>
            <Link href="/attendanceterms" className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 text-white">
              Agency Terms
            </Link>
            <span className="hidden md:inline text-slate-500" aria-hidden="true">|</span>
            <Link href="/servicerates" className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 text-white">
              Agency Rates
            </Link>
            <span className="hidden md:inline text-slate-500" aria-hidden="true">|</span>
            <Link href="/cookies" className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 text-white">
              Cookies
            </Link>
            <span className="hidden md:inline text-slate-500" aria-hidden="true">|</span>
            <Link href="/complaints" className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 text-white">
              Complaints
            </Link>
            <span className="hidden md:inline text-slate-500" aria-hidden="true">|</span>
            <Link href="/admin" className="text-slate-400 hover:text-[#CBA135] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 flex items-center gap-1 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield w-3 h-3">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
              </svg>
              Admin
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            Registered Office: Greenacre, London Road, West Kingsdown, Sevenoaks, Kent, TN15 6ER
          </p>
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap justify-center gap-4 text-xs text-slate-400">
            <span>Partners:</span>
            <a href="https://policestationrepukdirectory.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
              Find a Police Station Rep
            </a>
            <span>•</span>
            <a href="https://policestationrepuk.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
              Police Station Rep UK
            </a>
            <span>•</span>
            <a href="https://policestationrepuk.com/StationsDirectory" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
              UK Custody Suites
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
