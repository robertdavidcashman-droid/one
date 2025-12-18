'use client';

import { useState, ChangeEvent } from 'react';
import { signOut } from 'next-auth/react';

interface BlogPreview {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  faqs: Array<{ question: string; answer: string }>;
  schema: any;
  image: string | null;
  imageUrls: string[];
  generatedWithAI?: boolean;
  aiImageGenerated?: boolean;
  aiImageError?: string | null;
  aiStatus?: string;
  correlationId?: string;
}

interface FormData {
  topic: string;
  primaryKeyword: string;
  secondaryKeywords: string;
  location: string;
  category: string;
  seoLength: 'short' | 'optimal' | 'long';
  includeFAQ: boolean;
  includeInternalLinks: boolean;
  imageSource: 'ai' | 'upload' | 'url';
  imageUrls: string[];
  uploadedImages: File[];
  featuredImageIndex: number;
  includeInContentImages: boolean;
}

const CATEGORIES = [
  { value: 'police-station-advice', label: 'Police Station Advice' },
  { value: 'duty-solicitor', label: 'Duty Solicitor Explanation' },
  { value: 'arrest-custody', label: 'Arrest & Custody Guidance' },
  { value: 'bail-advice', label: 'Bail / Pre-charge Advice' },
  { value: 'rights', label: 'Rights at the Police Station' },
];

export default function BlogGeneratorClient() {
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    primaryKeyword: '',
    secondaryKeywords: '',
    location: 'Kent',
    category: 'police-station-advice',
    seoLength: 'optimal',
    includeFAQ: true,
    includeInternalLinks: true,
    imageSource: 'url',
    imageUrls: [''],
    uploadedImages: [],
    featuredImageIndex: 0,
    includeInContentImages: false,
  });

  const [preview, setPreview] = useState<BlogPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    setFormData(prev => {
      const newUrls = [...prev.imageUrls];
      newUrls[index] = value;
      return { ...prev, imageUrls: newUrls };
    });
  };

  const addImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ''],
    }));
  };

  const removeImageUrl = (index: number) => {
    setFormData(prev => {
      const newUrls = prev.imageUrls.filter((_, i) => i !== index);
      return {
        ...prev,
        imageUrls: newUrls.length > 0 ? newUrls : [''],
        featuredImageIndex: Math.min(prev.featuredImageIndex, newUrls.length - 1),
      };
    });
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData(prev => ({
        ...prev,
        uploadedImages: [...prev.uploadedImages, ...Array.from(files)],
      }));
    }
  };

  const removeUploadedImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((_, i) => i !== index),
      featuredImageIndex: Math.min(prev.featuredImageIndex, prev.uploadedImages.length - 2),
    }));
  };

  const handleGenerate = async () => {
    if (!formData.topic || !formData.primaryKeyword) {
      setError('Topic and primary keyword are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response: Response;
      
      // Use FormData for requests with file uploads
      // File objects cannot be JSON-serialized, so we use multipart/form-data
      if (formData.imageSource === 'upload' && formData.uploadedImages.length > 0) {
        // Create FormData for multipart upload
        const multipartFormData = new FormData();
        
        // Add all form fields as JSON in a 'data' field (excluding File objects)
        const jsonData = {
          topic: formData.topic,
          primaryKeyword: formData.primaryKeyword,
          secondaryKeywords: formData.secondaryKeywords,
          location: formData.location,
          category: formData.category,
          seoLength: formData.seoLength,
          includeFAQ: formData.includeFAQ,
          includeInternalLinks: formData.includeInternalLinks,
          imageSource: formData.imageSource,
          imageUrls: formData.imageUrls.filter(url => url.trim()),
          featuredImageIndex: formData.featuredImageIndex,
          includeInContentImages: formData.includeInContentImages,
        };
        multipartFormData.append('data', JSON.stringify(jsonData));
        
        // Add each file separately
        formData.uploadedImages.forEach((file) => {
          multipartFormData.append('uploadedImages', file);
        });

        response = await fetch('/api/admin/generate-blog', {
          method: 'POST',
          // Don't set Content-Type header - browser will set it with boundary for multipart
          body: multipartFormData,
        });
      } else {
        // Standard JSON request (no file uploads)
        response = await fetch('/api/admin/generate-blog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: formData.topic,
            primaryKeyword: formData.primaryKeyword,
            secondaryKeywords: formData.secondaryKeywords,
            location: formData.location,
            category: formData.category,
            seoLength: formData.seoLength,
            includeFAQ: formData.includeFAQ,
            includeInternalLinks: formData.includeInternalLinks,
            imageSource: formData.imageSource,
            imageUrls: formData.imageUrls.filter(url => url.trim()),
            featuredImageIndex: formData.featuredImageIndex,
            includeInContentImages: formData.includeInContentImages,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate blog post');
      }

      const data = await response.json();
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate blog post');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!preview) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: preview.title,
          slug: preview.slug,
          content: preview.content,
          excerpt: preview.excerpt,
          published: true,
          meta_title: preview.metaTitle,
          meta_description: preview.metaDescription,
          image: preview.image,
          schema: preview.schema,
          correlationId: preview.correlationId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish post');
      }

      const data = await response.json();
      setPublishedUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Generator</h1>
            <p className="mt-1 text-sm text-gray-600">
              Create SEO-optimized blog posts for PoliceStationAgent.com
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Sign Out
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {publishedUrl && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700">
              Published successfully!{' '}
              <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="underline">
                View post
              </a>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Blog Settings</h2>

            {/* Core Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blog Topic / Headline <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., Your Rights When Arrested in Kent"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary SEO Keyword <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="primaryKeyword"
                  value={formData.primaryKeyword}
                  onChange={handleInputChange}
                  placeholder="e.g., duty solicitor Kent"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  name="secondaryKeywords"
                  value={formData.secondaryKeywords}
                  onChange={handleInputChange}
                  placeholder="e.g., police station solicitor, PACE rights, free legal advice"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Kent"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* SEO Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Length
                </label>
                <select
                  name="seoLength"
                  value={formData.seoLength}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="short">Short (~800 words)</option>
                  <option value="optimal">Optimal (~1,100 words)</option>
                  <option value="long">Long (~1,500 words)</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="includeFAQ"
                    checked={formData.includeFAQ}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include FAQ Section</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="includeInternalLinks"
                    checked={formData.includeInternalLinks}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include Internal Links</span>
                </label>
              </div>

              {/* Image Options */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-3">Image Options</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image Source
                    </label>
                    <select
                      name="imageSource"
                      value={formData.imageSource}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="url">External URL</option>
                      <option value="upload">Upload from Device</option>
                      <option value="ai">AI Generated (DALL-E 3)</option>
                    </select>
                    {formData.imageSource === 'ai' && (
                      <p className="mt-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                        <strong>🎨 AI Image Generation:</strong> A professional, legal-themed image will be automatically 
                        generated based on your blog topic using DALL-E 3. The image will be saved to your blog-images folder.
                      </p>
                    )}
                  </div>

                  {formData.imageSource === 'url' && (
                    <div className="space-y-2">
                      {formData.imageUrls.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={url}
                            onChange={e => handleImageUrlChange(index, e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeImageUrl(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            ✕
                          </button>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="featuredImageIndex"
                              checked={formData.featuredImageIndex === index}
                              onChange={() =>
                                setFormData(prev => ({ ...prev, featuredImageIndex: index }))
                              }
                              className="text-blue-600"
                            />
                            <span className="ml-1 text-xs text-gray-500">Featured</span>
                          </label>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addImageUrl}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        + Add another image URL
                      </button>
                    </div>
                  )}

                  {formData.imageSource === 'upload' && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {formData.uploadedImages.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {formData.uploadedImages.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <div className="flex items-center gap-2">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="featuredUploadIndex"
                                    checked={formData.featuredImageIndex === index}
                                    onChange={() =>
                                      setFormData(prev => ({ ...prev, featuredImageIndex: index }))
                                    }
                                    className="text-blue-600"
                                  />
                                  <span className="ml-1 text-xs text-gray-500">Featured</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeUploadedImage(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !formData.topic || !formData.primaryKeyword}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Generating...' : 'Generate Blog Post'}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Preview</h2>

            {preview ? (
              <div className="space-y-4">
                {/* AI Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    preview.generatedWithAI 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {preview.generatedWithAI ? (
                      <>
                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Content: AI (GPT-4)
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Content: Template
                      </>
                    )}
                  </div>
                  {preview.aiImageGenerated && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      Image: AI (DALL-E 3)
                    </div>
                  )}
                </div>

                {/* AI Status - shows what happened with AI generation */}
                {preview.aiStatus && (
                  <div className={`p-3 rounded-md text-sm ${
                    preview.generatedWithAI 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  }`}>
                    <strong>🔍 Status:</strong> {preview.aiStatus}
                    {preview.aiImageError && (
                      <div className="mt-2">
                        <strong>Image error:</strong> {preview.aiImageError}
                      </div>
                    )}
                    {preview.correlationId && (
                      <div className="mt-2 text-xs opacity-80">
                        <strong>Correlation ID:</strong> {preview.correlationId}
                      </div>
                    )}
                  </div>
                )}

                {/* Meta Info */}
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  <p>
                    <strong>URL:</strong> /blog/{preview.slug}
                  </p>
                  <p>
                    <strong>Meta Title:</strong> {preview.metaTitle}
                    <span className={`ml-2 text-xs ${preview.metaTitle.length <= 60 ? 'text-green-600' : 'text-red-600'}`}>
                      ({preview.metaTitle.length}/60 chars)
                    </span>
                  </p>
                  <p>
                    <strong>Meta Description:</strong> {preview.metaDescription}
                    <span className={`ml-2 text-xs ${preview.metaDescription.length <= 155 ? 'text-green-600' : 'text-red-600'}`}>
                      ({preview.metaDescription.length}/155 chars)
                    </span>
                  </p>
                  {preview.image && (
                    <p>
                      <strong>Featured Image:</strong> {preview.image}
                    </p>
                  )}
                </div>

                {/* Featured Image Preview */}
                {preview.image && (
                  <div className="border rounded-md overflow-hidden">
                    <img
                      src={preview.image}
                      alt={preview.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Content Preview */}
                <div
                  className="prose prose-sm max-w-none max-h-96 overflow-y-auto border rounded-md p-4"
                  dangerouslySetInnerHTML={{ __html: preview.content }}
                />

                {/* FAQs Preview */}
                {preview.faqs && preview.faqs.length > 0 && (
                  <div className="border rounded-md p-4">
                    <h3 className="font-semibold mb-2">FAQs ({preview.faqs.length})</h3>
                    {preview.faqs.map((faq, index) => (
                      <div key={index} className="mb-3 pb-3 border-b last:border-b-0">
                        <p className="font-medium text-sm text-blue-800">{faq.question}</p>
                        <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Schema Preview */}
                {preview.schema && (
                  <details className="border rounded-md">
                    <summary className="p-4 cursor-pointer font-semibold text-sm bg-gray-50 hover:bg-gray-100">
                      SEO Schema (JSON-LD) - Click to view
                    </summary>
                    <pre className="p-4 text-xs overflow-x-auto bg-slate-900 text-green-400 max-h-64">
                      {JSON.stringify(preview.schema, null, 2)}
                    </pre>
                  </details>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex gap-4">
                    <button
                      onClick={handlePublish}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Publishing...' : 'Publish'}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/blog/${preview.slug}`
                        );
                        alert('Link copied to clipboard!');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Copy Link
                    </button>
                  </div>

                  {/* Email/SMS Sending Buttons */}
                  <div className="flex gap-2 pt-2 border-t">
                    <a
                      href={`mailto:?subject=${encodeURIComponent(preview.metaTitle || preview.title)}&body=${encodeURIComponent(`Read this article: ${window.location.origin}/blog/${preview.slug}`)}`}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-center text-sm"
                    >
                      Send by Email
                    </a>
                    <a
                      href={`sms:?body=${encodeURIComponent(`Read: ${window.location.origin}/blog/${preview.slug}`)}`}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 text-center text-sm"
                    >
                      Send by SMS
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">
                Generate a blog post to see preview here
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
