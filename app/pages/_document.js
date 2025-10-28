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

      // Set a per-request CSP header that includes the nonce so inline scripts/styles with the nonce are allowed
      if (ctx.res && typeof ctx.res.setHeader === 'function') {
        const csp = `default-src 'self'; script-src 'self' 'nonce-${nonce}' https:; style-src 'self' 'nonce-${nonce}' https:; img-src 'self' data: https:; connect-src 'self' https:; worker-src 'self' blob:; manifest-src 'self' data:; frame-ancestors 'self'; base-uri 'self';`;
        try {
          ctx.res.setHeader('Content-Security-Policy', csp);
        } catch (err) {
          // Fail silently if header cannot be set
          console.warn('Could not set CSP header on response:', err && err.message);
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
          <meta name="theme-color" content="#000000" />
          <meta name="description" content="A small collection of tiny 3D games" />
          <title>Games</title>
          <link rel="manifest" href="/manifest.json" />
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
