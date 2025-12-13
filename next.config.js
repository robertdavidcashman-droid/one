/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable clean URLs
  trailingSlash: false,
  // SEO optimization
  poweredByHeader: false,
  compress: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'base44.app',
      },
      {
        protocol: 'https',
        hostname: 'static.wixstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirects for old routes to new kebab-case routes
  async redirects() {
    return [
      {
        source: '/afterapoliceinterview',
        destination: '/after-a-police-interview',
        permanent: true,
      },
      {
        source: '/termsandconditions',
        destination: '/terms-and-conditions',
        permanent: true,
      },
      {
        source: '/forsolicitors',
        destination: '/for-solicitors',
        permanent: true,
      },
      {
        source: '/psastations',
        destination: '/police-stations',
        permanent: true,
      },
      {
        source: '/whatisapolicestationrep',
        destination: '/what-is-a-police-station-rep',
        permanent: true,
      },
      {
        source: '/Privacy',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/FAQ',
        destination: '/faq',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

