/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure static file serving
  async headers() {
    return [
      {
        source: '/sounds/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Add asset prefix for development
  assetPrefix: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
  // Configure public directory
  publicRuntimeConfig: {
    staticFolder: '/public',
  },
};

module.exports = nextConfig; 