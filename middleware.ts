import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CANONICAL_DOMAIN = 'policestationagent.com';
const LEGACY_DOMAINS = [
  'criminaldefencekent.co.uk',
  'www.criminaldefencekent.co.uk',
  'www.policestationagent.com',
];

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Force HTTPS
  if (url.protocol === 'http:') {
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // Redirect legacy domains and www variants to canonical non-www
  const isLegacyDomain = LEGACY_DOMAINS.some(domain => 
    hostname === domain || hostname.startsWith(domain + ':')
  );
  
  const isWww = hostname.startsWith('www.');
  const isNonCanonical = hostname !== CANONICAL_DOMAIN && !hostname.includes('localhost') && !hostname.includes('127.0.0.1');

  if (isLegacyDomain || (isWww && !hostname.startsWith('www.' + CANONICAL_DOMAIN)) || isNonCanonical) {
    url.host = CANONICAL_DOMAIN;
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

