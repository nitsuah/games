import React, { useEffect, useRef, useState } from 'react';

interface HowToPlayProps {
  title: string;
  instructions: string[];
  /** Shown instead of `instructions` on touch devices. */
  touchInstructions?: string[];
  onStart: () => void;
}

export const HowToPlay = ({ title, instructions, touchInstructions, onStart }: HowToPlayProps) => {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const query = window.matchMedia?.('(pointer: coarse)');
    if (!query) return;
    const update = () => setIsTouch(query.matches);
    update();
    // A 2-in-1 can change its primary pointer while the panel is open.
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  const shown = isTouch && touchInstructions ? touchInstructions : instructions;
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
        padding: 'clamp(16px, 6vw, 32px) clamp(16px, 7vw, 40px)',
        maxWidth: 480,
        width: 'calc(100vw - 32px)',
        boxSizing: 'border-box',
        color: '#fff',
        fontFamily: "'Courier New', monospace",
        boxShadow: '0 0 48px rgba(0,255,255,0.12)',
      }}>
        <h2 id="howtoplay-title" style={{ color: '#00ffff', marginTop: 0, marginBottom: 16, letterSpacing: 2, fontSize: 18 }}>
          HOW TO PLAY: {title}
        </h2>
        <ul style={{ margin: '0 0 24px 20px', lineHeight: 2.0, fontSize: 15 }}>
          {shown.map((item, i) => <li key={i}>{item}</li>)}
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
