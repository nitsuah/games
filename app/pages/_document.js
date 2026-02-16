import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import crypto from 'crypto';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    // Generate a per-request nonce
    const nonce = crypto.randomBytes(16).toString('base64');

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);

      // Attach nonce to styled-components style tags
      const styleElements = sheet.getStyleElement().map((el) => React.cloneElement(el, { nonce }));

      // Set a per-request CSP header that includes the nonce so approved inline scripts/styles are allowed.
      // Keep this CSP aligned with the stricter baseline in next.config.js but allow the per-request nonce.
      if (ctx.res && typeof ctx.res.setHeader === 'function') {
        const csp = `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https:; worker-src 'self' blob:; manifest-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content;`;
        try {
          ctx.res.setHeader('Content-Security-Policy', csp);
        } catch {
          // Fail silently if header cannot be set (avoid console warnings in production)
        }
      }

      return { ...initialProps, styles: [...initialProps.styles, ...styleElements], nonce };
    } finally {
      sheet.seal();
    }
  }

  render() {
    const { nonce } = this.props;
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
          <meta
            http-equiv="Content-Security-Policy"
            content={`default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https:; worker-src 'self' blob:; manifest-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content;`}
          />
          <script src="/register-sw.js" nonce={nonce} defer />
        </Head>
        <body>
          <Main />
          <NextScript nonce={nonce} />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
