import React, { useEffect, useRef } from 'react';

interface HowToPlayProps {
  title: string;
  instructions: string[];
  onStart: () => void;
}

export const HowToPlay = ({ title, instructions, onStart }: HowToPlayProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const btnRef    = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Trap focus within the overlay
    const el = dialogRef.current;
    if (!el) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = el.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };
    el.addEventListener('keydown', handleKey);
    btnRef.current?.focus();
    return () => el.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="howtoplay-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 10001,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.82)',
      }}
    >
      <div style={{
        background: '#0a0a1a',
        border: '2px solid #00ffff',
        borderRadius: 16,
        padding: '32px 40px',
        maxWidth: 480,
        width: '90vw',
        color: '#fff',
        fontFamily: "'Courier New', monospace",
        boxShadow: '0 0 48px rgba(0,255,255,0.12)',
      }}>
        <h2 id="howtoplay-title" style={{ color: '#00ffff', marginTop: 0, marginBottom: 16, letterSpacing: 2, fontSize: 18 }}>
          HOW TO PLAY: {title}
        </h2>
        <ul style={{ margin: '0 0 24px 20px', lineHeight: 2.0, fontSize: 15 }}>
          {instructions.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
        <button
          ref={btnRef}
          onClick={onStart}
          style={{
            width: '100%', padding: '12px', fontSize: 16,
            background: 'rgba(0,255,255,0.12)', border: '2px solid #00ffff',
            color: '#00ffff', borderRadius: 10, cursor: 'pointer',
            fontFamily: "'Courier New', monospace", letterSpacing: 2,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,255,255,0.25)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,255,255,0.12)')}
        >
          ▶ GOT IT — LET&apos;S PLAY
        </button>
      </div>
    </div>
  );
};
