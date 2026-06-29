/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enables React strict mode
  compiler: {
    styledComponents: true, // Enables styled-components support
  },
  // Empty turbopack config acknowledges Next.js 16's default Turbopack usage
  // Webpack config below won't apply in production builds with Turbopack
  turbopack: {},
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
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Baseline CSP header for the entire site
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
      // Allow iframe embedding for standalone HTML games served from /games/*
      {
        source: '/games/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'self';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
