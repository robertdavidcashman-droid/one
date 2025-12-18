import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedBlogPosts, formatBlogDate } from '@/lib/blog';
import { SITE_URL } from '@/config/site';
import type { Metadata } from 'next';

// Force dynamic rendering - blog posts are database-driven
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Blog | Police Station Agent",
  description: "Expert legal insights on police station representation, criminal defence procedures, and your rights in custody. Authored by Robert Cashman.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
    types: {
      'application/rss+xml': [
        { url: `${SITE_URL}/feed.xml`, title: 'Police Station Agent - All Posts' },
        { url: `${SITE_URL}/feed/recent`, title: 'Police Station Agent - Recent Posts' },
      ],
    },
  },
  openGraph: {
    title: "Blog | Police Station Agent",
    description: "Expert legal insights on police station representation, criminal defence procedures, and your rights in custody. Authored by Robert Cashman.",
    url: `${SITE_URL}/blog`,
    siteName: 'Police Station Agent',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Police Station Agent Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Blog | Police Station Agent",
    description: "Expert legal insights on police station representation, criminal defence procedures, and your rights in custody.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

export default function BlogPage() {
  // Get ALL published blog posts - no pagination limit
  // All posts should be visible on the blog index page
  const posts = getPublishedBlogPosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Legal Insights & <span className="text-amber-500">Advice</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-6">
                Expert guidance on police station procedures, your rights in custody, and criminal defence strategies.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a 
                  href={`${SITE_URL}/feed.xml`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm"
                  title="Subscribe to RSS feed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rss">
                    <path d="M4 11a9 9 0 0 1 9 9"></path>
                    <path d="M4 4a16 16 0 0 1 16 16"></path>
                    <circle cx="5" cy="19" r="1"></circle>
                  </svg>
                  RSS Feed
                </a>
                <Link 
                  href="/feed"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors text-sm"
                >
                  All Feeds
                </Link>
              </div>
            </div>

            {/* Blog Posts Grid - Wix-style responsive layout */}
            {posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className="group flex flex-col h-full bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 w-full"
                    >
                      <Link
                        href={`/blog/${post.slug}`}
                        className="block overflow-hidden relative aspect-[16/9] bg-gradient-to-br from-slate-100 to-slate-200 w-full"
                      >
                        {post.image ? (
                          post.image.startsWith('data:') ? (
                            // Next/Image doesn't reliably support large data URLs across configs.
                            // Use a plain <img> for data URL images.
                            <img
                              src={post.image}
                              alt={post.title || 'Blog post image'}
                              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 blog-card-image"
                              loading="lazy"
                            />
                          ) : (
                            <Image
                              src={post.image}
                              alt={post.title || 'Blog post image'}
                              fill
                              loading="lazy"
                              className="object-cover transform group-hover:scale-105 transition-transform duration-500 blog-card-image"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-slate-100 to-slate-200">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-slate-400"
                            >
                              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                              <circle cx="9" cy="9" r="2"></circle>
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                            </svg>
                          </div>
                        )}
                      </Link>
                      <div className="flex flex-col flex-grow p-5">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title || 'Untitled Post'}
                          </Link>
                        </h3>
                        <div className="text-sm text-slate-500 mb-4 line-clamp-3 flex-grow min-h-[3rem]">
                          {post.excerpt || 'No excerpt available.'}
                        </div>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-auto inline-flex items-center gap-1 group/link"
                        >
                          Read more
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="group-hover/link:translate-x-1 transition-transform"
                          >
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </Link>
                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-3 h-3"
                            >
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span>Robert Cashman</span>
                          </div>
                          {post.published_at && (
                            <span className="text-xs text-slate-400">
                              {formatBlogDate(post.published_at) || 'Published'}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-600 text-lg">No blog posts available yet.</p>
                <p className="text-slate-500 text-sm mt-2">Check back soon for updates.</p>
              </div>
            )}

            {/* Search Section */}
            <div className="bg-slate-900 text-white py-16 md:py-24 relative overflow-hidden mt-12 rounded-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.2),transparent_70%)]"></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                  Legal Insights & <span className="text-amber-400">Advice</span>
                </h2>
                <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                  Expert guidance on police station procedures, your rights in custody, and criminal defence strategies.
                </p>
                <form className="max-w-xl mx-auto flex gap-2">
                  <div className="relative flex-grow">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </svg>
                    <input
                      type="search"
                      className="flex h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 bg-white/10 border-slate-700 text-white placeholder:text-slate-400 focus:bg-slate-800 transition-colors"
                      placeholder="Search articles..."
                    />
                  </div>
                  <button
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
                    type="submit"
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
