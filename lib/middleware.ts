import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getJWTSecretBytes, isJWTSecretConfigured as isJWTSecretConfiguredFromEnv } from '@/lib/jwt-secret';

// Validate JWT secret at module load time
if (!isJWTSecretConfiguredFromEnv()) {
  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: JWT_SECRET is not set or is using default value. Authentication will fail.');
  }
}

const secret = getJWTSecretBytes();

export async function verifyAuth(request: NextRequest): Promise<{ userId: number; username: string } | null> {
  try {
    // Prefer the admin session cookie used by /admin login.
    // Fall back to legacy cookie name if present.
    const token =
      request.cookies.get('admin-token')?.value ??
      request.cookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, secret);
    
    return {
      userId: payload.userId as number,
      username: payload.username as string,
    };
  } catch (error) {
    return null;
  }
}

