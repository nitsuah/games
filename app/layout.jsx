import './globals.css';

export const metadata = {
  title: 'Games',
  description: 'A collection of 3D games',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 