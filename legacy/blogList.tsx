import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import db from '@/lib/db';

export default function BlogPage() {
  const posts = db.prepare(`
    SELECT id, title, slug, excerpt, published_at, created_at 
    FROM blog_posts 
    WHERE published = 1 
    ORDER BY published_at DESC, created_at DESC
    LIMIT 20
  `).all() as Array<{
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string | null;
    created_at: string;
  }>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#0A2342] text-white py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-gray-200">
              Latest news, insights, and legal updates
            </p>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-12 bg-gray-50">
          <div className="container-custom">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition group"
                  >
                    {post.published_at && (
                      <div className="text-sm text-gray-500 mb-4">
                        {new Date(post.published_at).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    )}
                    <h2 className="text-2xl font-semibold mb-4 group-hover:text-[#0A2342] transition-colors">{post.title}</h2>
                    {post.excerpt && (
                      <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">{post.excerpt}</p>
                    )}
                    <span className="text-[#0A2342] font-semibold inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                      Read More
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl shadow-lg text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">No Blog Posts Published Yet</h3>
                <p className="text-gray-600">Check back soon for updates and legal insights.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}





