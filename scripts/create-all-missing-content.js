#!/usr/bin/env node

/**
 * Create proper content for all missing pages
 */

const fs = require('fs').promises;
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'app');

const WHY_USE_US_CONTENT = `<div class="bg-gradient-to-br from-slate-50 to-blue-50">
<section class="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <div class="inline-flex items-center rounded-md border px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-primary/80 bg-amber-400 text-slate-900 mb-6 text-sm font-bold">
      Why Choose Us
    </div>
    <h1 class="text-4xl md:text-5xl font-black mb-6">Why Use Us As Your Police Station Agent In Kent?</h1>
    <p class="text-xl text-blue-100 mb-8">Expert representation when you need it most - available 24/7 across all Kent police stations</p>
  </div>
</section>

<section class="py-16">
  <div class="max-w-6xl mx-auto px-4">
    <div class="grid md:grid-cols-2 gap-8 mb-16">
      <div class="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-award w-6 h-6 text-blue-600">
            <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path>
            <circle cx="12" cy="8" r="6"></circle>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-4">35+ Years of Experience</h2>
        <p class="text-slate-600 leading-relaxed">
          Led by Robert Cashman, a qualified solicitor with over 35 years of criminal law experience and 6000+ cases. Former practice director with director-level expertise in every case.
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center bg-green-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-6 h-6 text-green-600">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-4">Fully Qualified Professionals</h2>
        <p class="text-slate-600 leading-relaxed">
          We employ only fully qualified criminal solicitors or fully qualified police station representatives. Every team member has extensive criminal casework experience.
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center bg-purple-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-6 h-6 text-purple-600">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-4">Available 24/7</h2>
        <p class="text-slate-600 leading-relaxed">
          We understand that arrests and police interviews don't happen on a schedule. That's why we provide round-the-clock coverage including evenings, weekends, and bank holidays across all Kent police stations.
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scale w-6 h-6 text-amber-600">
            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
            <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
            <path d="M7 21h10"></path>
            <path d="M12 3v18"></path>
            <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-4">Free Legal Aid Available</h2>
        <p class="text-slate-600 leading-relaxed">
          Everyone is entitled to free legal advice at the police station. This is a right, not a privilege, and is not means-tested. We provide this service free of charge through Legal Aid.
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin w-6 h-6 text-red-600">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-4">Complete Kent Coverage</h2>
        <p class="text-slate-600 leading-relaxed">
          We cover all police stations across Kent - East Kent, West Kent, and North Kent. From Canterbury to Medway, Folkestone to Tonbridge, we're there when you need us.
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap w-6 h-6 text-indigo-600">
            <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
            <path d="M22 10v6"></path>
            <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-4">Higher Court Advocate</h2>
        <p class="text-slate-600 leading-relaxed">
          Robert Cashman is a Higher Court Advocate (Criminal) qualified to appear in the Crown Court. This means seamless representation from police station through to court if needed.
        </p>
      </div>
    </div>

    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 md:p-12 text-white mb-16">
      <h2 class="text-3xl font-bold mb-6">Professional Association with Tuckers Solicitors LLP</h2>
      <p class="text-lg text-blue-100 mb-6 leading-relaxed">
        Through our professional association with Tuckers Solicitors LLP, we represent members of the public <strong class="text-white">free of charge</strong> at police interviews under caution, whether at a police station or elsewhere, where they are suspected of a criminal offence.
      </p>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 class="font-bold text-lg mb-3">For Members of the Public</h3>
          <ul class="space-y-2 text-blue-100">
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>FREE Legal Aid representation</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Seamless court coverage if needed</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Available 24/7 across all Kent stations</span>
            </li>
          </ul>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 class="font-bold text-lg mb-3">For Criminal Law Firms</h3>
          <ul class="space-y-2 text-blue-100">
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Reliable agent cover across Kent</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Detailed written reports</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Competitive rates and professional service</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="text-center">
      <h2 class="text-3xl font-bold text-slate-900 mb-4">Need Expert Representation?</h2>
      <p class="text-xl text-slate-600 mb-8">Call us now for free, independent, and confidential advice</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="tel:03330497036" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-white shadow h-12 rounded-md px-8 bg-red-600 hover:bg-red-700 font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone w-5 h-5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          Call: 03330497036
        </a>
        <a href="/contact" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border bg-white shadow-sm h-12 rounded-md px-8 border-slate-300 text-slate-900 hover:bg-slate-50">
          Contact Us
        </a>
      </div>
    </div>
  </div>
</section>
</div>`;

async function createPage(route, content, title, description) {
  const routePath = route === '/' ? 'app/page.tsx' : `app${route}/page.tsx`;
  const filePath = path.join(__dirname, '..', routePath);
  const dirPath = path.dirname(filePath);
  
  await fs.mkdir(dirPath, { recursive: true });
  
  const pageContent = `import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(description)},
  alternates: {
    canonical: ${JSON.stringify(`https://criminaldefencekent.co.uk${route}`)},
  },
  openGraph: {
    title: ${JSON.stringify(title)},
    description: ${JSON.stringify(description)},
    url: ${JSON.stringify(`https://criminaldefencekent.co.uk${route}`)},
    siteName: 'Criminal Defence Kent',
    type: 'website',
  },
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(content)} }} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
`;
  
  await fs.writeFile(filePath, pageContent, 'utf-8');
  console.log(`✅ Created: ${routePath}`);
}

async function main() {
  console.log('Creating missing pages...\n');
  
  await createPage(
    '/why-use-us',
    WHY_USE_US_CONTENT,
    'Why Use Us As Your Police Station Agent In Kent? | Criminal Defence Kent',
    'Expert police station representation in Kent. 35+ years experience, available 24/7, free Legal Aid, and complete Kent coverage. Professional association with Tuckers Solicitors LLP.'
  );
  
  console.log('\n✅ Done!');
}

main().catch(console.error);



