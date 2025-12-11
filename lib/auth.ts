import bcrypt from 'bcryptjs';
import db from './db';

export interface User {
  id: number;
  username: string;
  password_hash: string;
}

export async function createUser(username: string, password: string): Promise<User> {
  const passwordHash = await bcrypt.hash(password, 10);
  const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
  const result = stmt.run(username, passwordHash);
  
  return {
    id: Number(result.lastInsertRowid),
    username,
    password_hash: passwordHash,
  };
}

export async function verifyUser(username: string, password: string): Promise<User | null> {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
  
  if (!user) {
    return null;
  }
  
  const isValid = await bcrypt.compare(password, user.password_hash);
  
  if (!isValid) {
    return null;
  }
  
  return user;
}

export function getUserById(id: number): User | null {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  return user || null;
}

