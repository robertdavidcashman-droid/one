import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free Legal Advice at Police Station | Legal Aid Explained",
  description: "Did you know police station advice is 100% free? Legal Aid covers representation for all suspects interviewed by police. No means testing.",
  keywords: undefined,
  alternates: {
    canonical: "https://criminaldefencekent.co.uk/freelegaladvice",
  },
  openGraph: {
    title: "Free Legal Advice at Police Station | Legal Aid Explained",
    description: "Did you know police station advice is 100% free? Legal Aid covers representation for all suspects interviewed by police. No means testing.",
    type: 'website',
    url: "https://criminaldefencekent.co.uk/freelegaladvice",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen">
          <div 
            className="prose prose-lg max-w-6xl mx-auto px-4 py-16"
            dangerouslySetInnerHTML={{ __html: `<div class="fixed right-3 top-4 z-40 text-[10px] text-slate-400 select-none pointer-events-none bg-white/80 backdrop-blur-sm px-2 py-1 rounded border border-slate-200/50" aria-hidden="true">v4.4.0 — 11/12/2025</div><div class="bg-slate-50 min-h-screen py-16"><div class="max-w-4xl mx-auto px-4"><div class="text-center mb-16"><h1 class="text-4xl md:text-5xl font-black text-slate-900 mb-6">Yes, It Is <span class="text-green-600 underline decoration-4 underline-offset-4">Free</span>.</h1><p class="text-2xl text-slate-600 max-w-3xl mx-auto">Everyone suspects, regardless of income or wealth, is entitled to free independent legal advice at the police station.</p></div><div class="grid md:grid-cols-2 gap-8 mb-12"><div class="rounded-xl border text-slate-900 bg-white border-t-4 border-green-500 shadow-lg"><div class="p-8"><h2 class="text-2xl font-bold mb-4 flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pound-sterling w-8 h-8 text-green-500"><path d="M18 7c0-5.333-8-5.333-8 0"></path><path d="M10 7v14"></path><path d="M6 21h12"></path><path d="M6 13h10"></path></svg> No Bill To You</h2><p class="text-slate-600 text-lg leading-relaxed">Our fees for police station attendance are paid directly by the Legal Aid Agency. You will never receive a bill from us for police station work.</p></div></div><div class="rounded-xl border text-slate-900 bg-white border-t-4 border-blue-500 shadow-lg"><div class="p-8"><h2 class="text-2xl font-bold mb-4 flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big w-8 h-8 text-blue-500"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg> No Means Test</h2><p class="text-slate-600 text-lg leading-relaxed">Unlike court legal aid, police station advice is <strong>non-means tested</strong>. It doesn't matter if you are employed, unemployed, or a millionaire.</p></div></div></div><div class="bg-blue-900 text-white rounded-2xl p-8 md:p-12 text-center shadow-xl"><h2 class="text-3xl font-bold mb-6">Why Risk Going Without?</h2><p class="text-lg text-blue-100 mb-8">Since it costs you nothing, ensure you have professional protection.</p><a href="tel:01732247427" class="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 shadow rounded-md bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xl h-14 px-10 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone w-6 h-6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> Call Free Advice Line</a></div><div class="mt-12 text-center"><p class="text-xs text-slate-400">Legal Basis: Advice and Assistance at the Police Station is funded by the Legal Aid Agency under the Standard Crime Contract.<br>Authority: Legal Aid, Sentencing and Punishment of Offenders Act 2012.</p></div></div></div>` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}


