/**
 * Centralized JWT secret lookup.
 *
 * Supports both `JWT_SECRET` (preferred) and `JWT-SECRET` (common typo / legacy).
 * Never export the raw secret value in API responses.
 */

const FALLBACK_SECRET = 'fallback-secret-change-in-production';

export function getJWTSecretRaw(): string {
  // Vercel env var names are case-sensitive. Hyphens are allowed, but require bracket access.
  const fromUnderscore = process.env.JWT_SECRET;
  const fromHyphen = process.env['JWT-SECRET'];
  return fromUnderscore || fromHyphen || FALLBACK_SECRET;
}

export function isJWTSecretConfigured(): boolean {
  const configured = process.env.JWT_SECRET || process.env['JWT-SECRET'];
  return !!(configured && configured !== FALLBACK_SECRET && configured.length > 10);
}

export function getJWTSecretBytes(): Uint8Array {
  return new TextEncoder().encode(getJWTSecretRaw());
}

