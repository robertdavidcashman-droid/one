import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogAdvertBlock from '@/components/BlogAdvertBlock';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPostBySlug, formatBlogDate, generateExcerpt } from '@/lib/blog-reader';
import { SITE_URL } from '@/config/site';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';

// Use ISR for blog posts - revalidate every hour
export const revalidate = 3600; // 1 hour
export const dynamicParams = true;

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;
  
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || generateExcerpt(post.contentHtml, 160),
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || generateExcerpt(post.contentHtml, 160),
      url: `${siteUrl}/blog/${post.slug}`,
      siteName: 'Police Station Agent',
      type: 'article',
      locale: 'en_GB',
      images: post.featuredImage ? [{ 
        url: post.featuredImage.startsWith('/') ? `${siteUrl}${post.featuredImage}` : post.featuredImage,
        width: 1200,
        height: 630,
        alt: post.title,
      }] : [{
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: post.title,
      }],
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || generateExcerpt(post.contentHtml, 160),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;
  
  // Build structured data
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': ['BlogPosting', 'Article'],
    headline: post.title,
    description: post.metaDescription || generateExcerpt(post.contentHtml, 160),
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'CriminalDefenceKent.co.uk',
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
    image: post.featuredImage ? [{
      '@type': 'ImageObject',
      url: post.featuredImage.startsWith('/') ? `${siteUrl}${post.featuredImage}` : post.featuredImage,
    }] : undefined,
    articleSection: post.category,
    keywords: [post.primaryKeyword, ...post.secondaryKeywords].filter(Boolean),
    inLanguage: 'en-GB',
  };

  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${siteUrl}/blog/${post.slug}`,
      },
    ],
  };

  // Add FAQ schema if post has FAQs
  const faqSchema = post.faq && post.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <JsonLd data={blogPostingSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}
      <Header />
      <main className="flex-grow relative" id="main-content" role="main">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 text-white py-16 md:py-20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Link 
                href="/blog" 
                className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
                Back to Blog
              </Link>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight">
                {post.title}
              </h1>
              
              {/* Featured Image */}
              {post.featuredImage && (
                <div className="mt-6 mb-4 relative w-full max-w-3xl mx-auto aspect-video rounded-lg shadow-2xl overflow-hidden">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                    unoptimized={false}
                    quality={95}
                  />
                </div>
              )}
              
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-blue-200">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="text-sm">{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                    <line x1="16" x2="16" y1="2" y2="6"></line>
                    <line x1="8" x2="8" y1="2" y2="6"></line>
                    <line x1="3" x2="21" y1="10" y2="10"></line>
                  </svg>
                  <span className="text-sm">{formatBlogDate(post.date)}</span>
                </div>
                {post.category && (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-600 rounded text-xs">{post.category}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <article className="prose prose-lg max-w-none">
              <div 
                dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
                className="prose prose-lg max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:rounded-lg [&_img]:shadow-md [&_img]:filter-none [&_img]:backdrop-filter-none"
              />
            </article>
            
            {/* FAQ Section */}
            {post.faq && post.faq.length > 0 && (
              <div className="mt-12 border-t pt-8">
                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {post.faq.map((faq, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow">
                      <h3 className="font-semibold text-lg text-blue-900 mb-2">{faq.q}</h3>
                      <p className="text-gray-700">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Mandatory Advert Block */}
            <BlogAdvertBlock />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
