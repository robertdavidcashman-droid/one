import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import db from '@/lib/db';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = db.prepare('SELECT * FROM blog_posts WHERE slug = ? AND published = 1').get(params.slug) as {
    title: string;
    meta_title: string | null;
    meta_description: string | null;
    excerpt: string | null;
  } | undefined;

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://policestationagent.com';
  
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
    alternates: {
      canonical: `${siteUrl}/blog/${params.slug}`,
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = db.prepare('SELECT * FROM blog_posts WHERE slug = ? AND published = 1').get(params.slug) as {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    published_at: string | null;
    created_at: string;
  } | undefined;

  if (!post) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://policestationagent.com';
  
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    datePublished: post.published_at || post.created_at,
    dateModified: post.published_at || post.created_at,
    author: {
      '@type': 'Organization',
      name: 'Police Station Agent',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Police Station Agent',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={blogPostingSchema} />
      <Header />
      <main className="flex-grow py-12">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/blog" className="text-[#0A2342] hover:text-[#08192e] mb-4 inline-block">
            ← Back to Blog
          </Link>
          
          <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
          
          {post.published_at && (
            <p className="text-gray-600 mb-8">
              Published on {new Date(post.published_at).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
          
          <div className="prose prose-lg max-w-none mb-8 text-gray-700">
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }} 
              className="space-y-4"
            />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}



