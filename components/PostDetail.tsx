'use client';

interface PostDetailProps {
  slug: string;
}

export default function PostDetail({ slug }: PostDetailProps) {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Blog Post: {slug}</h1>
      <p>Post content will be loaded here.</p>
    </div>
  );
}
