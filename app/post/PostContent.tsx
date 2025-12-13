'use client';

import { useSearchParams } from 'next/navigation';
import PostDetail from '@/components/PostDetail';

export default function PostContent() {
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

