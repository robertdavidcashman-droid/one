import { requireAdminAuth, isJWTSecretConfigured } from '@/lib/admin-auth';
import AdminDashboard from '@/components/AdminDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Admin | Police Station Agent",
  description: "Police Station Agent services and information",
  alternates: {
    canonical: "https://policestationagent.com/admin",
  },
  openGraph: {
    title: "Admin | Police Station Agent",
    description: "Police Station Agent services and information",
    type: 'website',
    url: "https://policestationagent.com/admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page() {
  // Validate JWT_SECRET is set
  if (!isJWTSecretConfigured()) {
    console.error('JWT_SECRET is not set or is using default value. Admin access is disabled.');
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

  // Require authentication - redirects to login if not authenticated
  await requireAdminAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard />
    </div>
  );
}
