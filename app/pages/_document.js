import Document, { Html, Head, Main, NextScript } from 'next/document';

function nonce() {
  // simple nonce generator for server-side HTML; Next will call render
  return Math.random().toString(36).slice(2, 12);
}

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const originalRenderPage = ctx.renderPage;
    const n = nonce();
    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => (props) => <App {...props} nonce={n} />,
      });
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps, nonce: n };
  }

  render() {
    const { nonce } = this.props;
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="theme-color" content="#000000" />
          <link rel="manifest" href="/manifest.json" />
          {/* Inline critical style with nonce to ensure high-contrast initial render */}
          <style nonce={nonce}>{`html,body{background:#1a1a1a;color:#ffffff;} `}</style>
        </Head>
        <body>
          <Main />
          {/* Pass nonce into NextScript to avoid CSP blocking of inline scripts */}
          <NextScript nonce={nonce} />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
