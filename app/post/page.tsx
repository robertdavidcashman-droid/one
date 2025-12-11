'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostDetail from '@/components/PostDetail';

export default function PostPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !slug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
        <Header />
        <main className="flex-grow relative">
          <div className="bg-slate-50 min-h-screen flex items-center justify-center">
            <p className="text-slate-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative">
        <PostDetail slug={slug} />
      </main>
      <Footer />
    </div>
  );
}
