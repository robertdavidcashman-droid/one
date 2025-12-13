import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/auth';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// Hardcoded admin user as fallback (for initial setup or if database unavailable)
const HARDCODED_ADMIN = {
  username: 'admin',
  password: 'Secure123!',
  id: 999,
};

async function verifyCredentials(username: string, password: string): Promise<{ id: number; username: string } | null> {
  // First, try database lookup
  try {
    const user = await verifyUser(username, password);
    if (user) {
      return { id: user.id, username: user.username };
    }
  } catch (error) {
    // Database might not be available (e.g., during build or serverless cold start)
    console.warn('Database auth failed, trying hardcoded admin:', error);
  }

  // Fallback to hardcoded admin
  if (username === HARDCODED_ADMIN.username && password === HARDCODED_ADMIN.password) {
    return { id: HARDCODED_ADMIN.id, username: HARDCODED_ADMIN.username };
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = await verifyCredentials(username, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({ userId: user.id, username: user.username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    const response = NextResponse.json({ success: true, user: { id: user.id, username: user.username } });
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

