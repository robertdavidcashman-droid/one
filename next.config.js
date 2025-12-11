/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable clean URLs
  trailingSlash: false,
  // SEO optimization
  poweredByHeader: false,
  compress: true,
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

