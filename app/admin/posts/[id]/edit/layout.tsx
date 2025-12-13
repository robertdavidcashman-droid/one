import { requireAdminAuth, isJWTSecretConfigured } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Edit Post | Admin | Police Station Agent",
  description: "Edit blog post",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate JWT_SECRET
  if (!isJWTSecretConfigured()) {
    redirect('/admin/login');
  }

  // Require authentication - redirects to login if not authenticated
  await requireAdminAuth();

  return <>{children}</>;
}



