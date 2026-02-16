import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

// Shared CSP policy to avoid duplication between headers and meta tags.
// Note: 'unsafe-eval' is avoided in production to satisfy security audits, 
// though some 3D engines may require it for specific shader/script evaluation.
const CSP_POLICY = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https:; worker-src 'self' blob:; manifest-src 'self' data:; object-src 'none'; base-uri 'self'; frame-src 'self' https://app.netlify.com/; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content;";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);

      // Extract styles from styled-components for SSR/Prerendering
      const styleElements = sheet.getStyleElement();

      // CSP headers configured here are for local development / next start.
      // For static exports, CSP must be defined via the meta tag in the render method.
      if (ctx.res && typeof ctx.res.setHeader === 'function') {
        try {
          ctx.res.setHeader('Content-Security-Policy', CSP_POLICY);
        } catch {
          // Fail silently during static export phase
        }
      }

      return { ...initialProps, styles: [...initialProps.styles, ...styleElements] };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="theme-color" content="#000000" />
          <meta name="description" content="A small collection of tiny 3D games" />
          <title>Games</title>
          <link rel="icon" type="image/svg+xml" href="/favicon-home.svg" />
          <link rel="manifest" href="/manifest.json" />

          {/* Use React-compatible httpEquiv prop name and shared constant */}
          <meta
            httpEquiv="Content-Security-Policy"
            content={CSP_POLICY}
          />

          <script src="/register-sw.js" defer />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
