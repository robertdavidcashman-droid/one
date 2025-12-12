import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Police Station Agent",
  description: "",
  alternates: {
    canonical: "https://criminaldefencekent.co.uk/hours",
  },
  openGraph: {
    title: "Police Station Agent",
    description: "",
    type: 'website',
    url: "https://criminaldefencekent.co.uk/hours",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main">
        <div className="bg-slate-50 min-h-screen">
          <div 
            className="prose prose-lg max-w-6xl mx-auto px-4 py-16"
            dangerouslySetInnerHTML={{ __html: `<div class="fixed right-3 top-4 z-40 text-[10px] text-slate-400 select-none pointer-events-none bg-white/80 backdrop-blur-sm px-2 py-1 rounded border border-slate-200/50" aria-hidden="true">v4.4.0 — 11/12/2025</div><div class="bg-slate-50 py-16"><div class="max-w-4xl mx-auto px-4"><div class="text-center mb-12"><div class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-primary/80 bg-amber-100 text-amber-800 mb-4">Availability</div><h1 class="text-4xl font-bold text-slate-800 mb-4">Our Operating Hours</h1><p class="text-xl text-slate-600 max-w-3xl mx-auto">We provide legal representation during extended hours to ensure you're never without support.</p></div><div class="rounded-xl border bg-white text-slate-900 mb-12 shadow-lg"><div class="flex flex-col space-y-1.5 p-6"><div class="font-semibold tracking-tight text-center text-2xl">Representation Hours</div></div><div class="p-6 pt-0"><div class="divide-y divide-slate-200"><div class="grid grid-cols-3 gap-4 items-center py-4"><div class="font-semibold text-slate-800 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar w-5 h-5 text-blue-500"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>Monday - Friday</div><div class="text-slate-600 text-center">9:00 AM - Late</div><div class="text-slate-500 text-sm text-right">Full representation service</div></div><div class="grid grid-cols-3 gap-4 items-center py-4"><div class="font-semibold text-slate-800 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar w-5 h-5 text-blue-500"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>Saturday - Sunday</div><div class="text-slate-600 text-center">Available on call</div><div class="text-slate-500 text-sm text-right">Full representation service</div></div><div class="grid grid-cols-3 gap-4 items-center py-4"><div class="font-semibold text-slate-800 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar w-5 h-5 text-blue-500"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>Bank Holidays</div><div class="text-slate-600 text-center">Available on call</div><div class="text-slate-500 text-sm text-right">Full representation service</div></div></div></div></div><div class="rounded-xl border bg-blue-800 text-white shadow-xl"><div class="p-8 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-12 h-12 mx-auto text-amber-400 mb-4"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><h3 class="text-3xl font-bold text-amber-400 mb-4">Available When You Need Us</h3><p class="text-lg mb-6 max-w-2xl mx-auto text-blue-100">Criminal justice doesn't keep office hours, and neither do we. Our service is designed to provide expert legal advice whenever an arrest or interview occurs during extended hours.</p><a href="tel:03330497036" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 text-primary-foreground shadow h-10 rounded-md px-8 bg-red-600 hover:bg-red-700 font-bold flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone w-5 h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> Call Our Extended Hours Line</a></div></div></div></div>` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
