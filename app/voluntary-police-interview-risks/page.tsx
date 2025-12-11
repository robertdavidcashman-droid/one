import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "The Dangers of a Voluntary Police Interview | Police Station Agent",
  description: "Understanding why a voluntary interview is just as serious as an interview under arrest. Key risks and why you need a solicitor.",
  alternates: {
    canonical: "https://criminaldefencekent.co.uk/voluntary-police-interview-risks",
  },
  openGraph: {
    title: "The Dangers of a Voluntary Police Interview | Police Station Agent",
    description: "Understanding why a voluntary interview is just as serious as an interview under arrest. Key risks and why you need a solicitor.",
    type: 'website',
    url: "https://criminaldefencekent.co.uk/voluntary-police-interview-risks",
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
            dangerouslySetInnerHTML={{ __html: `<div class="bg-slate-50 py-16"><div class="max-w-4xl mx-auto px-4"><div class="text-center mb-12"><div class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-primary/80 bg-red-100 text-red-800 mb-4">Important Warning</div><h1 class="text-4xl font-bold text-slate-900 mb-4">The Dangers of a "Voluntary" Police Interview</h1><p class="text-xl text-slate-700 max-w-3xl mx-auto">Understanding why a voluntary interview is just as serious as an interview under arrest.</p></div><div class="rounded-xl border bg-white text-slate-900 shadow-lg mb-8"><div class="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-red-600 to-red-700 text-white"><div class="font-semibold tracking-tight text-2xl">What is a Voluntary Interview?</div></div><div class="p-8"><p class="text-lg text-slate-700 leading-relaxed mb-4">The police may ask you to attend the station for a 'voluntary interview' or a 'voluntary chat'. This is an alternative to arresting you. While it may seem less intimidating, it carries the same legal weight as an interview conducted after an arrest.</p><p class="text-slate-700 leading-relaxed">The purpose is the same: to gather evidence with the aim of a potential prosecution. Do not underestimate its importance.</p></div></div><div class="rounded-xl border bg-white text-slate-900 shadow-lg mb-8"><div class="flex flex-col space-y-1.5 p-6"><div class="font-semibold leading-none tracking-tight text-2xl">Key Risks to Be Aware Of</div></div><div class="p-6 pt-0 space-y-6"><div class="border-l-4 border-red-500 pl-4"><h3 class="text-lg font-bold text-slate-900 mb-2">It's a Formal Interview</h3><p class="text-slate-700">Despite being 'voluntary', it is still an interview under caution. Everything you say is recorded and can be used as evidence against you.</p></div><div class="border-l-4 border-amber-500 pl-4"><h3 class="text-lg font-bold text-slate-900 mb-2">Lack of Disclosure</h3><p class="text-slate-700">You may not be given full details of the allegation against you before the interview, putting you at a disadvantage.</p></div><div class="border-l-4 border-red-500 pl-4"><h3 class="text-lg font-bold text-slate-900 mb-2">Risk of Self-Incrimination</h3><p class="text-slate-700">Without legal advice, you might accidentally say something that harms your defence or admits to an offence.</p></div><div class="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded"><h3 class="text-lg font-bold text-slate-900 mb-2">Free Legal Advice is Your Right</h3><p class="text-slate-700">You have the same right to free, independent legal advice as you would if you were arrested. Always use it.</p></div></div></div><div class="rounded-xl border bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl mb-8"><div class="p-8 text-center"><h2 class="text-2xl font-bold mb-4">Invited for a Voluntary Interview?</h2><p class="text-blue-100 mb-6 text-lg">Never attend a voluntary interview without a solicitor. Contact us first. We will liaise with the police and arrange to attend with you.</p><a href="tel:01732247427" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-10 rounded-md px-8 bg-red-600 hover:bg-red-700 font-bold flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone w-5 h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> Call for Advice Before You Go</a></div></div><div class="rounded-xl text-slate-900 shadow mb-8 bg-slate-50 border border-slate-200"><div class="p-6"><h3 class="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Legal References</h3><div class="text-xs text-slate-600 space-y-2"><p><strong>PACE Code C, Paragraph 3.21:</strong> "Voluntary Attendance" - Sets out that a volunteer must be treated with the same rights and entitlements as a detained person, including free legal advice.</p><p><strong>PACE Code C, Paragraph 10.1:</strong> "Cautions" - Requirement to caution a person whom there are grounds to suspect of an offence before questioning.</p><p><strong>PACE Code E:</strong> Audio recording of interviews with suspects.</p></div></div></div></div></div>` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

