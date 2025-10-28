/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enables React strict mode
  compiler: {
    styledComponents: true, // Enables styled-components support
  },
  // Optimize bundle to reduce unused JavaScript
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Enable tree shaking and minimize unused code
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        minimize: true,
        // Split chunks more aggressively to reduce unused code per chunk
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Split framework code (react, react-dom, next)
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Split other node_modules into smaller chunks
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                return `npm.${packageName.replace('@', '')}`;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
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
        // Apply a stricter baseline CSP for all pages. This avoids allowing remote
        // scripts by default and disables plugin/object sources. If you need to allow
        // a trusted third-party script, prefer adding it explicitly or using a per-request nonce.
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              process.env.NODE_ENV === 'development'
                ? "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https: ws:; worker-src 'self' blob:; manifest-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self';"
                : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https:; worker-src 'self' blob:; manifest-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content;",
          },
        ],
      },
    ];
  },
  // Add asset prefix for development
  assetPrefix: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
};

module.exports = nextConfig;
