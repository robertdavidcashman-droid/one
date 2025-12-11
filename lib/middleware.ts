import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function verifyAuth(request: NextRequest): Promise<{ userId: number; username: string } | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;

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

