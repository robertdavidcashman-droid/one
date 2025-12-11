'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostDetail from '@/components/PostDetail';

export const dynamic = 'force-dynamic';

function PostContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');

  if (!slug) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Blog Post</h1>
        <p>Please provide a post slug in the URL.</p>
      </div>
    );
  }

  return <PostDetail slug={slug} />;
}

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
