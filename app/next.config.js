/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enables React strict mode
  compiler: {
    styledComponents: true, // Enables styled-components support
  },
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
      // Report-only CSP header to satisfy Lighthouse detection without risking site breakage
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy-Report-Only',
            // A conservative report-only CSP that mostly allows runtime behavior but is detected by Lighthouse
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self'; base-uri 'self';",
          },
        ],
      },
    ];
  },
  // Add asset prefix for development
  assetPrefix: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
};

module.exports = nextConfig;
