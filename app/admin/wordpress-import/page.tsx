import { requireAdminAuth, isJWTSecretConfigured } from '@/lib/admin-auth';
import AdminDashboard from '@/components/AdminDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WordPress Import | Admin',
  robots: { index: false, follow: false },
};

export default async function WordPressImportPage() {
  if (!isJWTSecretConfigured()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-700 mb-2">JWT_SECRET environment variable is not properly configured.</p>
          <p className="text-sm text-gray-500">Please set JWT_SECRET in your Vercel environment variables.</p>
        </div>
      </div>
    );
  }

  await requireAdminAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard initialTab="import" />
    </div>
  );
}

