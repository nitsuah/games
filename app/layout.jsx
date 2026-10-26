import './globals.css';

export const metadata = {
  metadataBase: new URL('https://arcade.nitsuah.io'),
  title: 'Games',
  description:
    'Browser arcade collection built with Next.js, Three.js, and React Three Fiber.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    url: 'https://arcade.nitsuah.io',
    siteName: 'Games',
    title: 'Games',
    description:
      'Browser arcade collection built with Next.js, Three.js, and React Three Fiber.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
