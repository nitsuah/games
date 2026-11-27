import './globals.css';

export const metadata = {
  metadataBase: new URL('https://arcade.nitsuah.io'),
  title: 'Arcade',
  description:
    'Nine free browser games, no sign-up: Asteroid, Tank Battle, Breakout, Snake, Pong and more.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    url: 'https://arcade.nitsuah.io',
    siteName: 'Arcade',
    title: 'Arcade',
    description:
      'Nine free browser games, no sign-up: Asteroid, Tank Battle, Breakout, Snake, Pong and more.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
