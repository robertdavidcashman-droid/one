'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [coverageOpen, setCoverageOpen] = useState(false);
  const [articlesOpen, setArticlesOpen] = useState(false);
  const [informationOpen, setInformationOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);

  // Timeout refs for delayed closing
  const servicesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const aboutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const coverageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const articlesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const informationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blogTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to handle delayed close
  const handleDelayedClose = (
    setter: (value: boolean) => void,
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>,
    delay: number = 300
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setter(false);
      timeoutRef.current = null;
    }, delay);
  };

  // Helper function to cancel delayed close
  const cancelDelayedClose = (timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="text-2xl font-bold text-slate-800 hover:text-blue-600 transition-colors"
              aria-label="Police Station Agent home page"
            >
              Police Station Agent
            </Link>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
            <Link 
              href="/" 
              className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors rounded-md hover:bg-slate-50"
            >
              Home
            </Link>
            
            <div className="relative">
              <button 
                className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                aria-label="Services menu"
                onMouseEnter={() => {
                  cancelDelayedClose(servicesTimeoutRef);
                  setServicesOpen(true);
                }}
                onMouseLeave={() => handleDelayedClose(setServicesOpen, servicesTimeoutRef, 300)}
              >
                Services
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-4 h-4 transition-transform duration-200" aria-hidden="true">
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
              {servicesOpen && (
                <div 
                  className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50"
                  onMouseEnter={() => {
                    cancelDelayedClose(servicesTimeoutRef);
                    setServicesOpen(true);
                  }}
                  onMouseLeave={() => handleDelayedClose(setServicesOpen, servicesTimeoutRef, 300)}
                >
                  <Link href="/services" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-semibold">All Services</Link>
                  <div className="border-t border-slate-200 my-1"></div>
                  <Link href="/what-we-do" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">What We Do</Link>
                  <Link href="/for-solicitors" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">For Solicitors</Link>
                  <Link href="/for-clients" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">For Clients</Link>
                  <Link href="/voluntary-interviews" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Voluntary Interviews</Link>
                  <Link href="/servicesvoluntaryinterviews" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Voluntary Interview Services</Link>
                  <div className="border-t border-slate-200 my-1"></div>
                  <Link href="/fees" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Legal Aid & Fees</Link>
                  <Link href="/privatecrime" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Private Client Services</Link>
                  <Link href="/privateclientfaq" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Private Client FAQ</Link>
                  <Link href="/courtrepresentation" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Court Representation</Link>
                  <div className="border-t border-slate-200 my-1"></div>
                  <Link href="/faq" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">FAQ</Link>
                  <Link href="/canwehelp" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Can We Help?</Link>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                aria-expanded={aboutOpen}
                aria-haspopup="true"
                aria-label="About menu"
                onMouseEnter={() => {
                  cancelDelayedClose(aboutTimeoutRef);
                  setAboutOpen(true);
                }}
                onMouseLeave={() => handleDelayedClose(setAboutOpen, aboutTimeoutRef, 300)}
              >
                About
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-4 h-4 transition-transform duration-200" aria-hidden="true">
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
              {aboutOpen && (
                <div 
                  className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50"
                  onMouseEnter={() => {
                    cancelDelayedClose(aboutTimeoutRef);
                    setAboutOpen(true);
                  }}
                  onMouseLeave={() => handleDelayedClose(setAboutOpen, aboutTimeoutRef, 300)}
                >
                  <Link href="/about" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">About Us</Link>
                  <Link href="/why-use-us" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Why Use Us</Link>
                  <Link href="/testimonials" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Client Testimonials</Link>
                  <Link href="/what-is-a-criminal-solicitor" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">What is a Criminal Solicitor</Link>
                  <Link href="/what-is-a-police-station-rep" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">What is a Police Station Rep</Link>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                aria-expanded={coverageOpen}
                aria-haspopup="true"
                aria-label="Coverage menu"
                onMouseEnter={() => {
                  cancelDelayedClose(coverageTimeoutRef);
                  setCoverageOpen(true);
                }}
                onMouseLeave={() => handleDelayedClose(setCoverageOpen, coverageTimeoutRef, 300)}
              >
                Coverage
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-4 h-4 transition-transform duration-200" aria-hidden="true">
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
              {coverageOpen && (
                <div 
                  className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50"
                  onMouseEnter={() => {
                    cancelDelayedClose(coverageTimeoutRef);
                    setCoverageOpen(true);
                  }}
                  onMouseLeave={() => handleDelayedClose(setCoverageOpen, coverageTimeoutRef, 300)}
                >
                  <Link href="/coverage" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Areas Covered</Link>
                  <Link href="/areas" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Areas We Cover</Link>
                  <Link href="/police-stations" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Police Stations</Link>
                  <Link href="/outofarea" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Out of Area</Link>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                aria-expanded={articlesOpen}
                aria-haspopup="true"
                aria-label="Articles menu"
                onMouseEnter={() => {
                  cancelDelayedClose(articlesTimeoutRef);
                  setArticlesOpen(true);
                }}
                onMouseLeave={() => handleDelayedClose(setArticlesOpen, articlesTimeoutRef, 300)}
              >
                Articles
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-4 h-4 transition-transform duration-200" aria-hidden="true">
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
              {articlesOpen && (
                <div 
                  className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50"
                  onMouseEnter={() => {
                    cancelDelayedClose(articlesTimeoutRef);
                    setArticlesOpen(true);
                  }}
                  onMouseLeave={() => handleDelayedClose(setArticlesOpen, articlesTimeoutRef, 300)}
                >
                  <Link href="/blog" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-semibold">All Articles</Link>
                  <div className="border-t border-slate-200 my-1"></div>
                  <Link href="/voluntary-interviews" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Voluntary Interviews</Link>
                  <Link href="/voluntary-police-interview-risks" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Voluntary Interview Risks</Link>
                  <Link href="/after-a-police-interview" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">After a Police Interview</Link>
                  <Link href="/what-happens-if-ignore-police-interview" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Ignoring Police Interview</Link>
                  <Link href="/refusingpoliceinterview" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Refusing Interview</Link>
                  <Link href="/policeinterviewhelp" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Interview Help</Link>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                aria-expanded={informationOpen}
                aria-haspopup="true"
                aria-label="Information menu"
                onMouseEnter={() => {
                  cancelDelayedClose(informationTimeoutRef);
                  setInformationOpen(true);
                }}
                onMouseLeave={() => handleDelayedClose(setInformationOpen, informationTimeoutRef, 300)}
              >
                Information
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-4 h-4 transition-transform duration-200" aria-hidden="true">
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
              {informationOpen && (
                <div 
                  className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50"
                  onMouseEnter={() => {
                    cancelDelayedClose(informationTimeoutRef);
                    setInformationOpen(true);
                  }}
                  onMouseLeave={() => handleDelayedClose(setInformationOpen, informationTimeoutRef, 300)}
                >
                  <Link href="/faq" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-semibold">FAQ</Link>
                  <Link href="/your-rights-in-custody" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Your Rights in Custody</Link>
                  <Link href="/freelegaladvice" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Is Legal Advice Free?</Link>
                  <Link href="/arrestednow" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Emergency Help (Family)</Link>
                  <div className="border-t border-slate-200 my-1"></div>
                  <Link href="/privacy" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Privacy Policy</Link>
                  <Link href="/cookies" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Cookies Policy</Link>
                  <Link href="/accessibility" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Accessibility</Link>
                  <Link href="/complaints" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Complaints</Link>
                  <Link href="/gdpr" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">GDPR</Link>
                  <Link href="/terms-and-conditions" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">Terms & Conditions</Link>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                aria-expanded={blogOpen}
                aria-haspopup="true"
                aria-label="Blog menu"
                onMouseEnter={() => {
                  cancelDelayedClose(blogTimeoutRef);
                  setBlogOpen(true);
                }}
                onMouseLeave={() => handleDelayedClose(setBlogOpen, blogTimeoutRef, 300)}
              >
                Blog
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-4 h-4 transition-transform duration-200" aria-hidden="true">
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
              {blogOpen && (
                <div 
                  className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50"
                  onMouseEnter={() => {
                    cancelDelayedClose(blogTimeoutRef);
                    setBlogOpen(true);
                  }}
                  onMouseLeave={() => handleDelayedClose(setBlogOpen, blogTimeoutRef, 300)}
                >
                  <Link href="/blog" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600">All Blog Posts</Link>
                </div>
              )}
            </div>
            
            <Link 
              href="/contact" 
              className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors rounded-md hover:bg-slate-50"
            >
              Contact
            </Link>
          </nav>
          
          <div className="hidden lg:flex items-center gap-3">
            <a 
              href="tel:01732247427" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 rounded-md px-8 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg flex"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone w-5 h-5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Emergency
            </a>
          </div>
          
          <div className="lg:hidden flex items-center gap-2">
            <button
              className="p-2 text-slate-700 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-2">
            <Link href="/" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            
            <div className="px-4 py-2 text-slate-500 text-sm font-semibold">Services</div>
            <Link href="/services" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>All Services</Link>
            <Link href="/what-we-do" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>What We Do</Link>
            <Link href="/for-solicitors" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>For Solicitors</Link>
            <Link href="/for-clients" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>For Clients</Link>
            <Link href="/voluntary-interviews" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>Voluntary Interviews</Link>
            <Link href="/fees" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>Legal Aid & Fees</Link>
            <Link href="/privatecrime" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>Private Client</Link>
            
            <div className="px-4 py-2 text-slate-500 text-sm font-semibold mt-2">About</div>
            <Link href="/about" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
            <Link href="/why-use-us" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>Why Use Us</Link>
            <Link href="/testimonials" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>Client Testimonials</Link>
            <Link href="/what-is-a-criminal-solicitor" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>What is a Criminal Solicitor</Link>
            <Link href="/what-is-a-police-station-rep" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>What is a Police Station Rep</Link>
            
            <div className="px-4 py-2 text-slate-500 text-sm font-semibold mt-2">Coverage</div>
            <Link href="/coverage" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>Areas Covered</Link>
            <Link href="/police-stations" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>Police Stations</Link>
            <Link href="/areas" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>Areas We Cover</Link>
            <Link href="/outofarea" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>Out of Area</Link>
            
            <div className="px-4 py-2 text-slate-500 text-sm font-semibold mt-2">Articles & Help</div>
            <Link href="/blog" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>All Articles</Link>
            <Link href="/after-a-police-interview" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>After a Police Interview</Link>
            <Link href="/voluntary-police-interview-risks" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>Voluntary Interview Risks</Link>
            <Link href="/your-rights-in-custody" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>Your Rights in Custody</Link>
            <Link href="/policeinterviewhelp" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>Interview Help</Link>
            <Link href="/refusingpoliceinterview" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>Refusing Interview</Link>
            <Link href="/arrestednow" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>Emergency Help</Link>
            
            <div className="px-4 py-2 text-slate-500 text-sm font-semibold mt-2">Information</div>
            <Link href="/faq" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
            <Link href="/freelegaladvice" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>Is Legal Advice Free?</Link>
            <Link href="/canwehelp" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium pl-8" onClick={() => setMobileMenuOpen(false)}>Can We Help?</Link>
            
            <Link href="/contact" className="block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium mt-2" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <a 
              href="tel:01732247427" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm h-10 rounded-md px-8 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg mt-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone w-5 h-5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Emergency
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
