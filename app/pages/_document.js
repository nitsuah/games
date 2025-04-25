import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Dynamic favicon based on the page */}
        <link rel="icon" href="/favicon-home.svg" />
        <meta name="description" content="Arcade Games" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
