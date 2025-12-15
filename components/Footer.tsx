import Link from 'next/link';
import { getFormattedVersion, getLastUpdateDateTime } from '@/lib/version';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appVersion = getFormattedVersion();
  const lastUpdate = getLastUpdateDateTime();
  
  return (
    <footer className="bg-slate-900 text-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12 text-sm">
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="mb-4 text-lg font-bold text-white">Police Station Agent</h3>
            <p className="mb-6 leading-relaxed text-slate-200">
              Kent&apos;s leading police station rep service. Accredited duty solicitor providing FREE 24/7 representation at all Kent custody suites.
            </p>
            <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <p className="text-xs text-amber-200 font-semibold mb-1">Serving All Kent Towns:</p>
              <p className="text-xs text-slate-300">
                Medway, Maidstone, Canterbury, Gravesend, Tonbridge, Folkestone, Ashford, Dartford, Sittingbourne, Sevenoaks, Tunbridge Wells, Margate, Dover, Swanley, Bluewater
              </p>
            </div>
            <div className="flex gap-4" role="list" aria-label="Social media links">
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
                className="text-slate-300 hover:text-white" 
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
            <h3 className="font-bold mb-4 text-lg text-white">Services</h3>
            <nav aria-label="Footer services links">
              <ul className="space-y-3">
                <li>
                  <Link href="/services" className="text-slate-200 hover:text-white transition-colors font-medium">
                    Police Station Rep Services Kent
                  </Link>
                </li>
                <li>
                  <Link href="/fees" className="text-slate-200 hover:text-white transition-colors font-medium">
                    Legal Aid & Fees
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-slate-200 hover:text-white transition-colors font-medium">
                    About Kent's Leading Police Station Rep
                  </Link>
                </li>
                <li>
                  <Link href="/coverage" className="text-slate-200 hover:text-white transition-colors font-medium">
                    Kent Towns - Police Station Rep Service Areas
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-slate-200 hover:text-white transition-colors font-medium">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-slate-200 hover:text-white transition-colors font-medium">
                    Contact Kent Police Station Representative
                  </Link>
                </li>
                <li>
                  <Link href="/join" className="text-slate-200 hover:text-white transition-colors font-medium">
                    Join Network
                  </Link>
                </li>
                <li>
                  <Link href="/police-stations" className="text-slate-200 hover:text-white transition-colors font-medium">
                    Kent Police Stations - Police Station Rep Coverage
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-lg text-white">Contact</h3>
            <address className="not-italic">
              <ul className="space-y-3">
                <li>
                  <a href="tel:01732247427" className="text-slate-200 hover:text-white transition-colors font-medium">
                    01732 247427
                  </a>
                </li>
                <li>
                  <a href="mailto:robertcashman@defencelegalservices.co.uk" className="text-slate-200 hover:text-white transition-colors font-medium break-all">
                    robertcashman@defencelegalservices.co.uk
                  </a>
                </li>
                <li>
                  <a href="sms:07535494446?body=I%20need%20police%20station%20representation" className="text-blue-300 hover:text-blue-200 flex items-center gap-2 font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle w-4 h-4">
                      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                    </svg>
                    Text: 07535 494446
                  </a>
                </li>
              </ul>
            </address>
            <div className="mt-6">
              <h3 className="font-bold mb-2 text-sm text-white">Legal & Compliance</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms-and-conditions" className="text-slate-200 hover:text-white transition-colors">
                    Website Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-slate-200 hover:text-white transition-colors">
                    Website Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-slate-200 hover:text-white transition-colors">
                    Cookies Policy
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility" className="text-slate-200 hover:text-white transition-colors">
                    Accessibility
                  </Link>
                </li>
                <li>
                  <Link href="/gdpr" className="text-slate-200 hover:text-white transition-colors">
                    GDPR
                  </Link>
                </li>
                <li>
                  <Link href="/attendanceterms" className="text-slate-200 hover:text-white transition-colors font-medium">
                    Agency Terms & Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/servicerates" className="text-slate-200 hover:text-white transition-colors font-medium">
                    Agency Service Rates
                  </Link>
                </li>
                <li>
                  <Link href="/complaints" className="text-slate-200 hover:text-white transition-colors">
                    Complaints
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-12 pt-8 text-center text-sm text-slate-300">
          <div className="mb-6 max-w-4xl mx-auto p-5 bg-slate-50 rounded-lg border border-slate-200 shadow-sm">
            <p className="leading-relaxed text-slate-900 mb-3">
              <strong>Robert Cashman is a criminal defence solicitor. All legal services are provided through Tuckers Solicitors, which is authorised and regulated by the Solicitors Regulation Authority (SRA ID: 127795).</strong>
            </p>
            <p className="leading-relaxed text-slate-800 text-sm">
              <span className="font-semibold text-slate-900">Accredited Court & Police Station Duty Solicitor:</span> Accredited Court & Police Station Duty Solicitor: Police Station Agent specialises in duty solicitor-led police station representation across Kent.
            </p>
          </div>
          <p className="mb-4 font-medium text-white">
            Copyright {currentYear} by Defence Legal Services Limited T/A Police Station Agent. Company No. 09900871
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
            <Link href="/privacy" className="hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 text-white">
              Web Privacy
            </Link>
            <span className="hidden md:inline text-slate-400" aria-hidden="true">|</span>
            <Link href="/terms-and-conditions" className="hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 text-white">
              Web Terms
            </Link>
            <span className="hidden md:inline text-slate-400" aria-hidden="true">|</span>
            <Link href="/attendanceterms" className="hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 text-white">
              Agency Terms
            </Link>
            <span className="hidden md:inline text-slate-400" aria-hidden="true">|</span>
            <Link href="/servicerates" className="hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 text-white">
              Agency Rates
            </Link>
            <span className="hidden md:inline text-slate-400" aria-hidden="true">|</span>
            <Link href="/cookies" className="hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 text-white">
              Cookies
            </Link>
            <span className="hidden md:inline text-slate-400" aria-hidden="true">|</span>
            <Link href="/complaints" className="hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 text-white">
              Complaints
            </Link>
            <span className="hidden md:inline text-slate-400" aria-hidden="true">|</span>
            <Link href="/admin" className="text-slate-300 hover:text-[#CBA135] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 flex items-center gap-1 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield w-3 h-3">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
              </svg>
              Admin
            </Link>
          </div>
          <p className="text-xs text-slate-300">
            Registered Office: Greenacre, London Road, West Kingsdown, Sevenoaks, Kent, TN15 6ER
          </p>
          {/* Production Version and Last Update - Discreet Display */}
          <div className="mt-4 text-center space-y-1">
            <div>
              <span className="text-xs text-slate-500" title={`Build version: ${appVersion}`}>
                Version: {appVersion}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500" title={`Last updated: ${lastUpdate}`}>
                Last updated: {lastUpdate}
              </span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-700 flex flex-wrap justify-center gap-4 text-xs text-slate-300">
            <span>Partners:</span>
            <a href="https://policestationrepukdirectory.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
              Find a Police Station Rep
            </a>
            <span>•</span>
            <a href="https://policestationrepuk.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
              Police Station Rep UK
            </a>
            <span>•</span>
            <a href="https://policestationrepuk.com/StationsDirectory" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
              UK Custody Suites
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
