import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Blog | Police Station Solicitor Kent | Legal Insights",
  description: "Expert legal insights on police station representation, criminal defence procedures, and your rights in custody in Kent. Authored by Robert Cashman.",
  alternates: {
    canonical: "https://policestationagent.com/blog",
  },
  openGraph: {
    title: "Blog | Police Station Solicitor Kent | Legal Insights",
    description: "Expert legal insights on police station representation, criminal defence procedures, and your rights in custody in Kent.",
    url: "https://policestationagent.com/blog",
    siteName: 'Criminal Defence Kent',
    type: 'website',
  },
};

function extractFirstImage(html: string): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
}

function generateExcerpt(content: string, maxLength: number = 150): string {
  if (!content) return '';
  
  // Remove HTML tags and normalize whitespace
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // If text is shorter than maxLength, return it as-is without ellipsis
  if (text.length <= maxLength) {
    return text;
  }
  
  // Truncate and add ellipsis only when text was actually truncated
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

export default function BlogPage() {
  const posts = getAllBlogPosts();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow relative" id="main-content" role="main" aria-live="polite">
        <div className="bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900">Legal Insights & <span className="text-amber-400">Advice</span></h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                Expert guidance on police station procedures, your rights in custody, and criminal defence strategies in Kent.
              </p>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-600">No blog posts available yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => {
                  const featuredImage = extractFirstImage(post.content);
                  const excerpt = post.excerpt || generateExcerpt(post.content, 150);
                  
                  return (
                    <article key={post.id} className="group flex flex-col h-full bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
                      <Link href={`/blog/${post.slug}`} className="block overflow-hidden h-48 relative">
                        {featuredImage ? (
                          <img 
                            src={featuredImage} 
                            alt={post.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <span className="text-slate-400 font-medium">No Image</span>
                          </div>
                        )}
                      </Link>
                      <div className="flex flex-col flex-grow p-5">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h3>
                        <div className="text-sm text-slate-500 mb-4 line-clamp-3 flex-grow">
                          {excerpt}
                        </div>
                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-3 h-3">
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span>Robert Cashman</span>
                          </div>
                          {post.published_at && (
                            <span className="text-xs text-slate-400">
                              {new Date(post.published_at).toLocaleDateString('en-GB', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
