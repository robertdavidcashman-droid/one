import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import blogPostsData from '@/../../data/blog-posts.json';

interface PageProps {
  params: {
    slug: string;
  };
}

const BLOG_POSTS: Record<string, {
  title: string;
  slug: string;
  content: string;
  description: string;
  publishedAt: string | null;
  author: string;
  metaTitle?: string;
  metaDescription?: string;
}> = blogPostsData;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = BLOG_POSTS[params.slug];
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://criminaldefencekent.co.uk';
  
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.description,
    alternates: {
      canonical: `${siteUrl}/criminaldefencekent/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.description,
      url: `${siteUrl}/criminaldefencekent/blog/${post.slug}`,
      siteName: 'Criminal Defence Kent',
      type: 'article',
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = BLOG_POSTS[params.slug];
  
  if (!post) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen">
          <div 
            className="prose prose-lg max-w-6xl mx-auto px-4 py-16"
            dangerouslySetInnerHTML={{ __html: `<div class="fixed right-3 top-4 z-40 text-[10px] text-slate-400 select-none pointer-events-none bg-white/80 backdrop-blur-sm px-2 py-1 rounded border border-slate-200/50" aria-hidden="true">v4.4.0 — 11/12/2025</div>${post.content}` }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
