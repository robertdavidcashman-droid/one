import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminMetadata } from './metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = adminMetadata;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== 'robertdavidcashman@gmail.com') {
    redirect('/admin/login');
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </>
  );
}

