import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "Police Station Agent | Criminal Defence Kent",
  description: "v4.4.0 — 12/12/2025",
  alternates: {
    canonical: "https://policestationagent.com/guided-assistant",
  },
  openGraph: {
    title: "Police Station Agent | Criminal Defence Kent",
    description: "v4.4.0 — 12/12/2025",
    url: "https://policestationagent.com/guided-assistant",
    siteName: 'Police Station Agent',
    type: 'website',
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="max-w-4xl mx-auto px-4 py-12">
          
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: `<div class="fixed right-3 top-4 z-40 text-[10px] text-slate-400 select-none pointer-events-none bg-white/80 backdrop-blur-sm px-2 py-1 rounded border border-slate-200/50" aria-hidden="true">v4.4.0 — 12/12/2025</div>` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
