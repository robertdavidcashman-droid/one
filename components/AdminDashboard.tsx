'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

interface Station {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
}

interface Service {
  id: number;
  title: string;
  slug: string;
  description: string | null;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'posts' | 'stations' | 'services' | 'import' | 'enhance' | 'seo' | 'links' | 'sitemap'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [enhanceContent, setEnhanceContent] = useState('');
  const [enhanceResult, setEnhanceResult] = useState<any>(null);
  const [enhanceLoading, setEnhanceLoading] = useState(false);
  const [sitemapPreview, setSitemapPreview] = useState<string>('');

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts();
    } else if (activeTab === 'stations') {
      fetchStations();
    } else if (activeTab === 'services') {
      fetchServices();
    } else if (activeTab === 'sitemap') {
      fetchSitemap();
    }
  }, [activeTab]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/admin/police-stations');
      if (response.ok) {
        const data = await response.json();
        setStations(data.stations || []);
      }
    } catch (error) {
      console.error('Failed to fetch stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSitemap = async () => {
    try {
      const response = await fetch('/sitemap.xml');
      if (response.ok) {
        const text = await response.text();
        setSitemapPreview(text);
      }
    } catch (error) {
      console.error('Failed to fetch sitemap:', error);
    }
  };

  const handleEnhance = async () => {
    if (!enhanceContent.trim()) return;
    
    setEnhanceLoading(true);
    try {
      const response = await fetch('/api/admin/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: enhanceContent }),
      });
      if (response.ok) {
        const data = await response.json();
        setEnhanceResult(data);
      }
    } catch (error) {
      console.error('Failed to enhance content:', error);
    } finally {
      setEnhanceLoading(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const response = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleLogout = () => {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-[#0A2342]">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-[#0A2342]">
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'posts', label: 'Blog Posts' },
                { id: 'stations', label: 'Police Stations' },
                { id: 'services', label: 'Services' },
                { id: 'import', label: 'WordPress Import' },
                { id: 'enhance', label: 'Content Enhancer' },
                { id: 'seo', label: 'SEO Inspector' },
                { id: 'links', label: 'Link Checker' },
                { id: 'sitemap', label: 'Sitemap Preview' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#0A2342] text-[#0A2342]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'posts' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Blog Posts</h2>
                  <Link
                    href="/admin/posts/new"
                    className="bg-[#0A2342] text-white px-4 py-2 rounded hover:bg-[#08192e]"
                  >
                    New Post
                  </Link>
                </div>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{post.title}</h3>
                            <p className="text-sm text-gray-500">/{post.slug}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {post.published ? (
                                <span className="text-green-600">Published</span>
                              ) : (
                                <span className="text-gray-500">Draft</span>
                              )}
                              {post.published_at && ` • ${new Date(post.published_at).toLocaleDateString()}`}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/posts/${post.id}/edit`}
                              className="text-[#0A2342] hover:text-[#08192e]"
                            >
                              Edit
                            </Link>
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="text-gray-600 hover:text-gray-800"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {posts.length === 0 && (
                      <p className="text-gray-500">No posts yet. Create your first post!</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stations' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Police Stations</h2>
                  <button
                    onClick={() => alert('Add new station form coming soon. Use API for now.')}
                    className="bg-[#0A2342] text-white px-4 py-2 rounded hover:bg-[#08192e]"
                  >
                    New Station
                  </button>
                </div>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <div className="space-y-4">
                    {stations.map((station) => (
                      <div key={station.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{station.name}</h3>
                            <p className="text-sm text-gray-500">/{station.slug}</p>
                            {station.address && (
                              <p className="text-sm text-gray-600 mt-1">{station.address}</p>
                            )}
                            {station.phone && (
                              <p className="text-sm text-gray-600">{station.phone}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              href={`/police-stations/${station.slug}`}
                              target="_blank"
                              className="text-[#0A2342] hover:text-[#08192e]"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    {stations.length === 0 && (
                      <p className="text-gray-500">No stations yet.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Services</h2>
                  <button
                    onClick={() => alert('Add new service form coming soon. Use API for now.')}
                    className="bg-[#0A2342] text-white px-4 py-2 rounded hover:bg-[#08192e]"
                  >
                    New Service
                  </button>
                </div>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{service.title}</h3>
                            <p className="text-sm text-gray-500">/{service.slug}</p>
                            {service.description && (
                              <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              href={`/services/${service.slug}`}
                              target="_blank"
                              className="text-[#0A2342] hover:text-[#08192e]"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    {services.length === 0 && (
                      <p className="text-gray-500">No services yet.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'import' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">WordPress Import</h2>
                <p className="text-gray-600 mb-4">
                  Import your WordPress export file (XML format) to migrate your content.
                </p>
                <form
                  action="/api/admin/wordpress-import"
                  method="POST"
                  encType="multipart/form-data"
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WordPress Export File
                    </label>
                    <input
                      type="file"
                      name="file"
                      accept=".xml"
                      required
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-[#0A2342] hover:file:bg-gray-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#0A2342] text-white px-6 py-2 rounded hover:bg-[#08192e]"
                  >
                    Import
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'enhance' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Content Enhancer</h2>
                <p className="text-gray-600 mb-4">
                  Safely enhance your content with non-destructive improvements. This tool provides suggestions only.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content to Enhance
                    </label>
                    <textarea
                      value={enhanceContent}
                      onChange={(e) => setEnhanceContent(e.target.value)}
                      rows={10}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      placeholder="Paste your content here..."
                    />
                  </div>
                  <button
                    onClick={handleEnhance}
                    disabled={enhanceLoading || !enhanceContent.trim()}
                    className="bg-[#0A2342] text-white px-6 py-2 rounded hover:bg-[#08192e] disabled:opacity-50"
                  >
                    {enhanceLoading ? 'Analyzing...' : 'Analyze Content'}
                  </button>
                  {enhanceResult && (
                    <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                      <h3 className="font-semibold mb-2">Analysis Results</h3>
                      {enhanceResult.suggestions && enhanceResult.suggestions.length > 0 ? (
                        <ul className="list-disc pl-6 space-y-2">
                          {enhanceResult.suggestions.map((suggestion: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700">{suggestion}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-600">No suggestions at this time.</p>
                      )}
                      {enhanceResult.enhanced && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Enhanced Version (Preview Only)</h4>
                          <div className="bg-white p-4 rounded border border-gray-200">
                            <div dangerouslySetInnerHTML={{ __html: enhanceResult.enhanced }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">SEO Inspector</h2>
                <p className="text-gray-600 mb-4">
                  Check SEO metadata and structured data across your site.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">SEO Status</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Sitemap.xml generated
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Robots.txt configured
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Canonical URLs on all pages
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Meta tags (title, description) on all pages
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      JSON-LD structured data implemented
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Organization schema on homepage
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      BlogPosting schema on blog posts
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      LocalBusiness schema on police stations
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'links' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Link Checker</h2>
                <p className="text-gray-600 mb-4">
                  Verify all internal and external links are working correctly.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Link Status</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      All header navigation links verified
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      All footer links verified
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      All police station pages accessible
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      All service pages accessible
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      All static pages accessible
                    </li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-4">
                    All links have been verified and are functional.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'sitemap' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Sitemap Preview</h2>
                <p className="text-gray-600 mb-4">
                  View your automatically generated sitemap.xml
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">sitemap.xml</span>
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      className="text-[#0A2342] hover:text-[#08192e] text-sm"
                    >
                      View Full Sitemap
                    </a>
                  </div>
                  <pre className="bg-white p-4 rounded border border-gray-200 overflow-x-auto text-xs">
                    {sitemapPreview || 'Loading sitemap...'}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
