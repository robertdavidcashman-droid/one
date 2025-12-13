import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface AuthResult {
  userId: number;
  username: string;
}

/**
 * Verify admin authentication from cookie
 * Returns auth data if valid, null if not authenticated
 */
export async function verifyAdminAuth(): Promise<AuthResult | null> {
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

/**
 * Require admin authentication - redirects to login if not authenticated
 * Use this in server components that need auth
 */
export async function requireAdminAuth(): Promise<AuthResult> {
  const auth = await verifyAdminAuth();
  
  if (!auth) {
    redirect('/admin/login');
  }
  
  return auth;
}

/**
 * Check if JWT_SECRET is properly configured
 */
export function isJWTSecretConfigured(): boolean {
  return !!process.env.JWT_SECRET && 
         process.env.JWT_SECRET !== 'your-secret-key-change-in-production';
}

