import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const GAMES: [string, string][] = [
  ['Asteroid', '/asteroid'],
  ['Tank Battle', '/fps'],
  ['Breakout', '/breakout'],
  ['Invaders', '/space-invaders'],
  ['Flappy', '/flappy'],
  ['Snake', '/snake'],
  ['Pong', '/pong'],
  ['Memory Match', '/memory-match'],
  ['Dodge Blocks', '/dodge-blocks'],
];

const link: React.CSSProperties = { color: '#00ffff', textDecoration: 'underline', padding: '8px 4px' };

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh', padding: 16, boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#fff',
        background: 'linear-gradient(135deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
        fontFamily: "'Courier New', monospace",
      }}
    >
      <Head><title>Page not found · Arcade</title></Head>
      <h1 style={{ color: '#ffff00', letterSpacing: 4 }}>404 · GAME NOT FOUND</h1>
      <p>That page isn&apos;t in this arcade.</p>
      <p><Link href="/" style={{ ...link, fontSize: 20, fontWeight: 'bold' }}>Back to the arcade</Link></p>
      <nav aria-label="Games" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, maxWidth: 480 }}>
        {GAMES.map(([name, href]) => <Link key={href} href={href} style={link}>{name}</Link>)}
      </nav>
    </main>
  );
}
