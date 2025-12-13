import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/lib/db';

const ALLOWED_EMAIL = 'robertdavidcashman@gmail.com';

/**
 * Verify admin session - checks NextAuth session and email allowlist
 * Returns session if authorized, null otherwise
 */
export async function verifyAdminSession() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return null;
  }
  
  if (session.user.email !== ALLOWED_EMAIL) {
    return null;
  }
  
  return session;
}

/**
 * Get or create a user record based on email from NextAuth session
 * Returns the user ID from the database
 */
export async function getOrCreateUserFromSession(): Promise<number | null> {
  const session = await verifyAdminSession();
  
  if (!session || !session.user?.email) {
    return null;
  }
  
  const email = session.user.email;
  
  try {
    // Try to get existing user by email
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: number } | undefined;
    
    if (existingUser) {
      return existingUser.id;
    }
    
    // Create new user record for NextAuth user
    // Use email as username and a placeholder password_hash (not used with Google OAuth)
    const username = email.split('@')[0]; // Use email prefix as username
    const placeholderHash = 'nextauth_google_oauth'; // Placeholder since password auth is not used
    
    const result = db.prepare(`
      INSERT INTO users (username, password_hash, email)
      VALUES (?, ?, ?)
    `).run(username, placeholderHash, email);
    
    return Number(result.lastInsertRowid);
  } catch (error: any) {
    // If email column doesn't exist yet or other error, try to get user by username
    // Fallback: try to find user with username matching email prefix
    const username = email.split('@')[0];
    const userByUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username) as { id: number } | undefined;
    
    if (userByUsername) {
      // Update user to include email
      try {
        db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, userByUsername.id);
      } catch (e) {
        // Email column might not exist, ignore
      }
      return userByUsername.id;
    }
    
    console.error('Error getting or creating user:', error);
    return null;
  }
}

