import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getJWTSecretBytes, isJWTSecretConfigured as isJWTSecretConfiguredFromEnv } from '@/lib/jwt-secret';

const secret = getJWTSecretBytes();

export interface AdminSession {
  role: string;
  email: string;
}

/**
 * Check if JWT_SECRET is properly configured
 */
export function isJWTSecretConfigured(): boolean {
  return isJWTSecretConfiguredFromEnv();
}

/**
 * Check if user is authenticated as admin
 * Returns session data if valid, null if not
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, secret);
    
    if (payload.role !== 'admin') {
      return null;
    }

    return {
      role: payload.role as string,
      email: payload.email as string,
    };
  } catch (error) {
    // Token invalid or expired
    return null;
  }
}

/**
 * Check if admin is authenticated (boolean helper)
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession();
  return session !== null;
}

/**
 * Require admin authentication - redirects to login if not authenticated
 * Use this in server components
 */
export async function requireAdminAuth(): Promise<AdminSession> {
  const session = await getAdminSession();
  
  if (!session) {
    redirect('/admin/login');
  }
  
  return session;
}
