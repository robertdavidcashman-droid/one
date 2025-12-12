import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "Criminal Defence Kent",
  description: "",
  alternates: {
    canonical: "https://criminaldefencekent.co.uk/sandwich-solicitor",
  },
  openGraph: {
    title: "Criminal Defence Kent",
    description: "",
    url: "https://criminaldefencekent.co.uk/sandwich-solicitor",
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
            <div dangerouslySetInnerHTML={{ __html: "\n  <div id=\"root\"><div class=\"min-h-screen flex items-center justify-center p-6 bg-slate-50\"><div class=\"max-w-md w-full\"><div class=\"text-center space-y-6\"><div class=\"space-y-2\"><h1 class=\"text-7xl font-light text-slate-300\">404</h1><div class=\"h-0.5 w-16 bg-slate-200 mx-auto\"></div></div><div class=\"space-y-3\"><h2 class=\"text-2xl font-medium text-slate-800\">Page Not Found</h2><p class=\"text-slate-600 leading-relaxed\">The page <span class=\"font-medium text-slate-700\">\"sandwich-solicitor\"</span> could not be found in this application.</p></div><div class=\"pt-6\"><button class=\"inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500\"><svg class=\"w-4 h-4 mr-2\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6\"></path></svg>Go Home</button></div></div></div></div><div class=\"fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]\"><div class=\"fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]\"></div></div></div>\n \n\n" }} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
