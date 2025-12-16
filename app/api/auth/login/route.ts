import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/auth';
import { SignJWT } from 'jose';

const jwtSecret = process.env.JWT_SECRET;
const secret = new TextEncoder().encode(jwtSecret || 'dev-only-secret');

export async function POST(request: NextRequest) {
  try {
    if (!jwtSecret && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Server misconfigured (JWT_SECRET missing)' },
        { status: 500 }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    let user: { id: number; username: string } | null = null;
    try {
      const dbUser = await verifyUser(username, password);
      user = dbUser ? { id: dbUser.id, username: dbUser.username } : null;
    } catch (error) {
      console.error('Database auth failed:', error);
      return NextResponse.json(
        { error: 'Authentication temporarily unavailable' },
        { status: 503 }
      );
    }

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

