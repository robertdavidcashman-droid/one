import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
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
};

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as number,
      username: payload.username as string,
    };
  } catch (error) {
    return null;
  }
}

export default async function Page() {
  // Validate JWT_SECRET is set
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
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

  const auth = await verifyAuth();

  if (!auth) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard />
    </div>
  );
}
