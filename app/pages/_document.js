import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Basic PWA metadata to satisfy Lighthouse audits */}
        <title>Games — JS demos</title>
        <link rel="icon" href="/favicon-home.svg" />
        <meta name="description" content="Arcade Games" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        {/* Register a tiny client script (deferred) that will register a service worker if supported */}
        <script src="/register-sw.js" defer></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
