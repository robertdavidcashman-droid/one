import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogAdvertBlock from '@/components/BlogAdvertBlock';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPostBySlug, formatBlogDate, generateExcerpt, sanitizeBlogContent } from '@/lib/blog';
import { SITE_URL } from '@/config/site';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

// Force dynamic rendering - blog posts are database-driven
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Use authoritative function for slug normalization and matching
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;
  
  const displayTitle = post.meta_title || post.title || 'Untitled Post';
  const displayDescription = post.meta_description || post.excerpt || generateExcerpt(post.content, 160) || undefined;
  
  return {
    title: displayTitle,
    description: displayDescription,
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
    openGraph: {
      title: displayTitle,
      description: displayDescription,
      url: `${siteUrl}/blog/${post.slug}`,
      siteName: 'Police Station Agent',
      type: 'article',
      images: post.image && !post.image.startsWith('data:') ? [{ 
        url: post.image,
        width: 1200,
        height: 630,
        alt: displayTitle,
      }] : [{
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: displayTitle,
      }],
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || post.published_at || undefined,
      authors: ['Robert Cashman'],
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      description: displayDescription,
      images: post.image && !post.image.startsWith('data:') ? [post.image] : [`${siteUrl}/og-image.jpg`],
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  // Use authoritative function for slug normalization and matching
  // This handles case-insensitive matching, slug derivation, and normalization
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;
  
  const displayTitle = post.title || 'Untitled Post';
  const displayExcerpt = post.excerpt || generateExcerpt(post.content, 160) || post.content.substring(0, 160);
  
  // Use stored schema if available, otherwise generate default schema
  let blogPostingSchema: any;
  if (post.schema_json) {
    try {
      blogPostingSchema = JSON.parse(post.schema_json);
    } catch (e) {
      // Fallback to default if parsing fails
      blogPostingSchema = null;
    }
  }
  
  // Default schema if not stored or parsing failed
  if (!blogPostingSchema) {
    blogPostingSchema = {
      '@context': 'https://schema.org',
      '@type': ['BlogPosting', 'Article'],
      headline: displayTitle,
      description: displayExcerpt,
      datePublished: post.published_at || post.created_at,
      dateModified: post.updated_at || post.published_at || post.created_at,
      author: {
        '@type': 'Person',
        name: 'Robert Cashman',
        url: siteUrl,
      },
      publisher: {
        '@type': 'Organization',
        name: 'PoliceStationAgent.com',
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${siteUrl}/blog/${post.slug}`,
      },
      url: `${siteUrl}/blog/${post.slug}`,
      image: post.image ? [{
        '@type': 'ImageObject',
        url: post.image,
      }] : undefined,
      articleSection: 'Criminal Defence',
      keywords: ['police station representation', 'criminal defence', 'legal advice', 'Kent'],
      inLanguage: 'en-GB',
    };
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <JsonLd data={blogPostingSchema} />
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        {/* Hero Section - Always use gradient background for consistency */}
        <section className="relative bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 text-white py-16 md:py-20" aria-labelledby="article-title">
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Link 
                href="/blog" 
                className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-5 h-5">
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
                Back to Blog
              </Link>
              <h1 id="article-title" className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight">{post.title || 'Untitled Post'}</h1>
              {post.published_at && (
                <div className="flex flex-wrap items-center gap-4 text-blue-200">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span className="text-sm">Robert Cashman</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                      <line x1="16" x2="16" y1="2" y2="6"></line>
                      <line x1="8" x2="8" y1="2" y2="6"></line>
                      <line x1="3" x2="21" y1="10" y2="10"></line>
                    </svg>
                    <span className="text-sm">
                      {formatBlogDate(post.published_at) || 'Published'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <article className="prose prose-lg max-w-none">
              <div 
                dangerouslySetInnerHTML={{ __html: sanitizeBlogContent(post.content) }} 
                className="prose prose-lg max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:relative [&_img]:z-0 [&_img]:rounded-lg [&_img]:shadow-md"
              />
            </article>
            
            {/* Mandatory Advert Block - Cannot be removed */}
            <BlogAdvertBlock />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

