import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostContent from './PostContent';
import type { Metadata } from 'next';
import { SITE_DOMAIN } from '@/config/site';

// This directive now works because the page is a server component
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Blog Post | Police Station Agent",
  description: "Read our latest articles on police station representation, legal rights, and criminal defence in Kent.",
  alternates: {
    canonical: `https://${SITE_DOMAIN}/post`,
  },
  openGraph: {
    title: "Blog Post | Police Station Agent",
    description: "Read our latest articles on police station representation, legal rights, and criminal defence in Kent.",
    url: `https://${SITE_DOMAIN}/post`,
    siteName: 'Police Station Agent',
    type: 'website',
  },
};

export default function PostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <Suspense fallback={
          <div className="max-w-4xl mx-auto p-8">
            <p className="text-slate-600">Loading...</p>
          </div>
        }>
          <PostContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}