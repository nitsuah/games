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
      // Enforced CSP header. Lighthouse expects an effective CSP (not report-only).
      // Keep style-src 'unsafe-inline' to allow styled-components server-rendered styles.
      // script-src intentionally allows only 'self' and https: (no 'unsafe-inline') to be
      // effective against XSS. If you use inline scripts that require CSP nonces, implement
      // nonce injection in Document and update this policy accordingly.
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' https:; worker-src 'self' blob:; manifest-src 'self' data:; frame-ancestors 'self'; base-uri 'self';",
          },
        ],
      },
    ];
  },
  // Add asset prefix for development
  assetPrefix: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
};

module.exports = nextConfig;
