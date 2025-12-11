'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="container-custom">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-[#0A2342] hover:text-[#0A2342] transition-colors">
              Police Station Agent
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-[#0A2342] font-medium transition-colors relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0A2342] transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="/about" 
              className="text-gray-700 hover:text-[#0A2342] font-medium transition-colors relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0A2342] transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="/police-stations" 
              className="text-gray-700 hover:text-[#0A2342] font-medium transition-colors relative group"
            >
              Police Stations
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0A2342] transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="/services" 
              className="text-gray-700 hover:text-[#0A2342] font-medium transition-colors relative group"
            >
              Services
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0A2342] transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="/blog" 
              className="text-gray-700 hover:text-[#0A2342] font-medium transition-colors relative group"
            >
              Blog
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0A2342] transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="/faq" 
              className="text-gray-700 hover:text-[#0A2342] font-medium transition-colors relative group"
            >
              FAQ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0A2342] transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="/contact" 
              className="bg-[#0A2342] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#08192e] transition-all shadow-md hover:shadow-lg"
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
            <button
            className="lg:hidden p-2 text-gray-700 hover:text-[#0A2342]"
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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-[#0A2342] font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/about" 
                className="text-gray-700 hover:text-[#0A2342] font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/police-stations" 
                className="text-gray-700 hover:text-[#0A2342] font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Police Stations
              </Link>
              <Link 
                href="/services" 
                className="text-gray-700 hover:text-[#0A2342] font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/blog" 
                className="text-gray-700 hover:text-[#0A2342] font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/faq" 
                className="text-gray-700 hover:text-[#0A2342] font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link 
                href="/contact" 
                className="bg-[#0A2342] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#08192e] transition-all text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}



