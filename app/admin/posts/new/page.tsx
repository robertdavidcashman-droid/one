'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    published: false,
    meta_title: '',
    meta_description: '',
    faq_content: '',
    location: 'Kent',
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create post');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">New Blog Post</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                required
                rows={15}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                rows={3}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
                <span className="text-xs text-gray-500 ml-2">(Auto-generated if empty)</span>
              </label>
              <textarea
                rows={2}
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Will auto-generate with Kent context if left empty"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Kent"
              />
              <p className="text-xs text-gray-500 mt-1">Used for SEO context (default: Kent)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                FAQ Content (Optional)
              </label>
              <textarea
                rows={8}
                value={formData.faq_content}
                onChange={(e) => setFormData({ ...formData, faq_content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter FAQ questions and answers in plain text or HTML format. This will generate FAQPage schema automatically."
              />
              <p className="text-xs text-gray-500 mt-1">Questions and answers for FAQ schema. Use HTML or plain text.</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="published" className="text-sm font-medium text-gray-700">
                Publish immediately (leave unchecked to save as draft)
              </label>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#0A2342] text-white px-6 py-2 rounded hover:bg-[#08192e] disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Post'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

