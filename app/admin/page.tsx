'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  slug: string;
  published: number;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export default function AdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else if (response.status === 401) {
        router.push('/admin/login');
      } else {
        setError('Failed to load posts');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const publishedPosts = posts.filter(p => p.published === 1);
  const draftPosts = posts.filter(p => p.published === 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Content Management</h1>
            <Link
              href="/admin/posts/new"
              className="bg-[#0A2342] text-white px-6 py-2 rounded hover:bg-[#08192e]"
            >
              Create New Post
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Draft Posts ({draftPosts.length})</h2>
            {draftPosts.length === 0 ? (
              <p className="text-gray-500">No draft posts</p>
            ) : (
              <div className="space-y-2">
                {draftPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{post.title}</h3>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(post.created_at).toLocaleDateString()}
                        {post.updated_at && ` • Updated: ${new Date(post.updated_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Published Posts ({publishedPosts.length})</h2>
            {publishedPosts.length === 0 ? (
              <p className="text-gray-500">No published posts</p>
            ) : (
              <div className="space-y-2">
                {publishedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{post.title}</h3>
                      <p className="text-sm text-gray-500">
                        Published: {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not set'}
                        {post.updated_at && ` • Updated: ${new Date(post.updated_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Quick Guide</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>To create a new post:</strong> Click "Create New Post" above</p>
              <p><strong>To publish a draft:</strong> Edit the post and check the "Published" checkbox</p>
              <p><strong>To save as draft:</strong> Leave the "Published" checkbox unchecked</p>
              <p><strong>SEO fields:</strong> Meta title and description auto-generate with Kent context if left empty</p>
              <p><strong>FAQ content:</strong> Add FAQ questions/answers to automatically generate FAQPage schema</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
