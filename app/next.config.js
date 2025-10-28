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
      // Provide a baseline CSP header to ensure a CSP is present for crawlers / Lighthouse.
      // _document.js will still set a per-request CSP with nonces for inline scripts/styles.
      {
        // Apply a baseline CSP to all pages. This disallows unsafe-eval and unsafe-inline
        // while allowing common needs (self, https). The per-request nonce in _document.js
        // can be used to allow specific inline scripts via a stronger header at runtime.
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' https:; style-src 'self' https:; img-src 'self' data: https:; connect-src 'self' https:; worker-src 'self' blob:; manifest-src 'self' data:; frame-ancestors 'self'; base-uri 'self';",
          },
        ],
      },
    ];
  },
  // Add asset prefix for development
  assetPrefix: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
};

module.exports = nextConfig;
