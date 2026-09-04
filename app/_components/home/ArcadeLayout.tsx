import React, { ReactNode, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

const flicker = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.95; }
`;

const scanlineAnim = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const slideIn = keyframes`
  from { 
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const blink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

const neonFlicker = keyframes`
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    text-shadow: 
      0 0 4px #fff,
      0 0 11px #fff,
      0 0 19px #fff,
      0 0 40px #ffff00,
      0 0 80px #ffff00,
      0 0 90px #ffff00,
      0 0 100px #ffff00,
      0 0 150px #ffff00;
  }
  20%, 24%, 55% {
    text-shadow: none;
  }
`;

const PageContainer = styled.div<{ $fullscreen?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Fullscreen games pin to the viewport and center; the cabinet/menu screen
     top-aligns with breathing room so it can scroll instead of clipping
     content off the top/bottom when the cabinet is taller than the viewport
     (see ArcadeCabinet below — 9-game grid + neon hood + console). */
  justify-content: ${({ $fullscreen }) => ($fullscreen ? 'center' : 'flex-start')};
  min-height: 100vh;
  height: ${({ $fullscreen }) => ($fullscreen ? '100vh' : 'auto')};
  width: 100vw;
  max-width: 100vw;
  background: linear-gradient(135deg, #0a0015 0%, #1a0030 50%, #0a0015 100%);
  color: white;
  font-family: 'Courier New', monospace;
  margin: 0;
  padding: ${({ $fullscreen }) => ($fullscreen ? '0' : '24px 0')};
  position: ${({ $fullscreen }) => ($fullscreen ? 'fixed' : 'relative')};
  top: 0;
  left: 0;
  overflow-y: ${({ $fullscreen }) => ($fullscreen ? 'hidden' : 'auto')};
  overflow-x: hidden;
  box-sizing: border-box;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.15) 0px,
      rgba(0, 0, 0, 0.15) 1px,
      transparent 1px,
      transparent 2px
    );
    pointer-events: none;
    z-index: 1;
  }
`;

const ArcadeFrame = styled.div`
  background: linear-gradient(135deg, rgba(20, 0, 40, 0.95), rgba(10, 0, 30, 0.95));
  border-radius: 20px;
  border: 4px solid #00ffff;
  box-shadow:
    0 0 40px rgba(0, 255, 255, 0.6),
    inset 0 0 60px rgba(0, 255, 255, 0.1);
  position: relative;
  z-index: 5;
  animation: ${slideIn} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
  width: 90vw;
  max-width: 720px;
  box-sizing: border-box;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 40px 20px 80px;

  @media (max-width: 768px) {
    /* Was width: 100vw — wider than the ArcadeCabinet parent (min(95vw, 780px)),
       which pushed the frame (and everything inside it) past the right edge
       of the viewport. 100% keeps it sized to its parent instead. */
    width: 100%;
    padding: 10px 0 20px;
    min-height: 80vh;
  }

  @media (orientation: landscape) and (max-height: 500px) {
    padding: 15px 5px 30px;
    min-height: 95vh;
  }

  /* Cosmetic wear: faint scuffs and a corner smudge, like a cabinet that's
     seen a few thousand quarters. Subtle and static — never distracts from
     content, never intercepts clicks. Negative z-index keeps it behind the
     game grid / text (which are unpositioned, so they always paint above
     positioned siblings) while still sitting above the frame's own
     background gradient. */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    z-index: -1;
    opacity: 0.5;
    mix-blend-mode: overlay;
    background:
      radial-gradient(ellipse 140px 60px at 12% 96%, rgba(0, 0, 0, 0.35), transparent 70%),
      radial-gradient(ellipse 90px 160px at 96% 20%, rgba(255, 255, 255, 0.05), transparent 65%),
      radial-gradient(ellipse 220px 90px at 85% 100%, rgba(0, 0, 0, 0.25), transparent 70%),
      linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.03) 48%, transparent 56%);
  }
`;

const Scanline = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 255, 255, 0.1) 50%,
    transparent 100%
  );
  animation: ${scanlineAnim} 4s linear infinite;
  pointer-events: none;
  opacity: 0.5;
  will-change: transform;
`;

const Header = styled.div`
  position: relative;
  margin-bottom: 35px;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 42px;
  font-weight: 900;
  color: #00ffff;
  text-shadow: 
    0 0 20px #00ffff,
    0 0 40px #00ffff,
    0 4px 0 rgba(0, 0, 0, 0.8);
  margin: 0 0 8px 0;
  letter-spacing: 8px;
  font-family: 'Courier New', monospace;
  animation: ${flicker} 3s infinite alternate;
  text-transform: uppercase;
  will-change: opacity;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    font-size: 28px; /* Reduced title size on mobile */
    gap: 6px;
    letter-spacing: 4px;
  }
`;

const Subtitle = styled.h3`
  font-size: 16px;
  color: #888;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-top: 8px;
  font-weight: normal;
`;

const InsertCoinText = styled.div`
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  color: #00ffff;
  font-size: 18px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  text-shadow: 
    0 0 15px #00ffff,
    0 0 30px #00ffff,
    0 0 45px #00ffff;
  animation: ${blink} 1s step-start infinite;
  will-change: opacity;
  z-index: 20;
  white-space: nowrap;
  pointer-events: none;
  
  @media (max-width: 768px) {
    font-size: 14px;
    letter-spacing: 1px;
    bottom: 20px;
  }
`;

const ArcadeCabinet = styled.div`
  position: relative;
  width: min(95vw, 780px);
  padding-bottom: 90px;
  padding-top: 80px;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: min(90vw, 700px);
    height: 120px;
    background: linear-gradient(135deg, #ff1493 0%, #ff69b4 50%, #ff1493 100%);
    border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    border: 6px solid #ff69b4;
    border-bottom: none;
    box-shadow: 
      0 -5px 40px rgba(255, 20, 147, 0.9),
      inset 0 15px 40px rgba(255, 105, 180, 0.4);
    z-index: 10;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: min(90vw, 700px);
    height: 140px;
    background: linear-gradient(180deg, #ff8c00 0%, #ffa500 50%, #ff8c00 100%);
    border: 6px solid #ffaa00;
    border-radius: 0 0 30px 30px;
    box-shadow: 
      0 15px 50px rgba(255, 140, 0, 0.8),
      inset 0 -25px 50px rgba(255, 165, 0, 0.4);
    z-index: 10;
  }
`;

const ButtonDecoration = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;

  @media (max-width: 768px) {
    gap: 15px;

    button:first-child {
      display: none;
    }
  }

  button {
    width: 45px;
    height: 45px;
    padding: 0;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #ff0000, #aa0000);
    border: 4px solid #660000;
    box-shadow:
      0 6px 18px rgba(0, 0, 0, 0.6),
      inset 0 -4px 10px rgba(0, 0, 0, 0.5),
      inset 0 4px 10px rgba(255, 255, 255, 0.4);
    animation: ${pulse} 3s ease-in-out infinite;
    will-change: opacity, transform;
    cursor: pointer;
    transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
    -webkit-tap-highlight-color: transparent;
  }

  /* Physical press feedback: the button sinks and its highlight dims,
     mimicking a real arcade button's travel. */
  button:active {
    transform: translateY(3px) scale(0.94);
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.6),
      inset 0 -2px 6px rgba(0, 0, 0, 0.6),
      inset 0 2px 4px rgba(255, 255, 255, 0.2);
    animation-play-state: paused;
  }

  button:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 3px;
  }

  button:nth-child(1) {
    animation-delay: 0s;
  }

  button:nth-child(2) {
    background: radial-gradient(circle at 30% 30%, #00ff00, #00aa00);
    border-color: #006600;
    animation-delay: 0.5s;
  }

  button:nth-child(3) {
    background: radial-gradient(circle at 30% 30%, #0000ff, #0000aa);
    border-color: #000066;
    animation-delay: 1s;
  }

  button:nth-child(4) {
    background: radial-gradient(circle at 30% 30%, #ffff00, #aaaa00);
    border-color: #666600;
    animation-delay: 1.5s;
  }
`;

const Joystick = styled.button`
  position: absolute;
  bottom: 30px;
  left: 30px; /* Adjusted for smaller screens */
  width: 25px; /* Reduced size */
  height: 25px; /* Reduced size */
  padding: 0;
  background: radial-gradient(circle at 30% 30%, #333, #000);
  border: none;
  border-radius: 50%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.8);
  z-index: 15;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  @media (max-width: 768px) {
    left: 30px;
  }

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 4px;
  }

  &::before {
    content: '';
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    width: 15px;
    height: 45px;
    background: linear-gradient(180deg, #ff0000 0%, #aa0000 100%);
    border-radius: 20px 20px 5px 5px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
    transition: transform 0.12s ease-out;
    transform-origin: 50% 100%;
  }

  &::after {
    content: '';
    position: absolute;
    top: -55px;
    left: 50%;
    transform: translateX(-50%);
    width: 25px;
    height: 25px;
    background: radial-gradient(circle at 30% 30%, #ff0000, #cc0000);
    border-radius: 50%;
    box-shadow:
      0 3px 10px rgba(0, 0, 0, 0.8),
      inset 0 -2px 5px rgba(0, 0, 0, 0.5);
    transition: transform 0.12s ease-out;
    transform-origin: 50% 100%;
  }

  /* Physical press feedback: the stick tilts on its base like a real
     joystick being nudged, instead of just sitting static. */
  &:active::before {
    transform: translateX(-50%) rotate(12deg);
  }

  &:active::after {
    transform: translateX(-50%) rotate(12deg) translateY(2px);
  }
`;

const ControlsContainer = styled.div`
  position: absolute;
  bottom: 30px; /* Adjusted for smaller screens */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px; /* Reduced gap */
  z-index: 15;
  width: 90vw;
  max-width: 600px; /* Set a max-width to prevent buttons from spreading too much */
  padding: 0 10px; /* Adjusted padding */
  box-sizing: border-box;

  @media (orientation: landscape) and (max-height: 500px) {
    bottom: 15px; /* Further adjust for very short landscape */
    gap: 10px;
  }

  @media (max-width: 768px) {
    gap: 10px; /* Reduced gap for mobile */
    padding: 0 10px; /* Adjusted padding for mobile */
    width: 95vw;
  }
`;

const CoinSlot = styled.div`
  width: 70px;
  height: 12px;
  background: #000;
  border: 3px solid #444;
  border-radius: 6px;
  box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.9);
  position: absolute;
  bottom: 30px; /* Adjusted for smaller screens */
  right: 30px; /* Adjusted for smaller screens */
  z-index: 15;
  
  @media (max-width: 768px) {
    right: 30px;
    bottom: 60px;
  }

  &::after {
    content: '25¢';
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: bold;
    font-family: 'Courier New', monospace;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
    white-space: nowrap;
  }
`;

const MarqueeText = styled.h1`
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  color: #ffff00;
  font-size: 38px;
  font-weight: 900;
  font-family: 'Courier New', monospace;
  text-shadow:
    0 0 4px #fff,
    0 0 11px #fff,
    0 0 19px #fff,
    0 0 40px #ffff00,
    0 0 80px #ffff00,
    0 0 90px #ffff00,
    0 0 100px #ffff00,
    0 0 150px #ffff00;
  letter-spacing: 10px;
  z-index: 15;
  animation: ${neonFlicker} 5s linear infinite;
  will-change: text-shadow;
  margin: 0;
  white-space: nowrap;
  
  &::before,
  &::after {
    content: '★';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 32px;
    color: #ff1493;
    text-shadow: 
      0 0 10px #ff1493,
      0 0 20px #ff1493,
      0 0 30px #ff1493;
    animation: ${pulse} 2s ease-in-out infinite;
  }
  
  &::before {
    left: -50px;
  }
  
  &::after {
    right: -50px;
  }
  
  /* Was font-size: 48px / letter-spacing: 12px — larger than the 38px/10px
     desktop base, which pushed "ARCADE" past the frame width and clipped it
     off both edges on tablet/mobile. It needs to shrink, not grow. */
  @media (max-width: 768px) {
    font-size: 24px;
    letter-spacing: 5px;

    &::before,
    &::after {
      font-size: 18px;
    }

    &::before {
      left: -22px;
    }

    &::after {
      right: -22px;
    }
  }

  @media (max-width: 480px) {
    font-size: 19px;
    letter-spacing: 3px;

    &::before,
    &::after {
      font-size: 14px;
    }

    &::before {
      left: -16px;
    }

    &::after {
      right: -16px;
    }
  }
`;

interface ArcadeLayoutProps {
  children: ReactNode;
  headerContent?: ReactNode;
  title?: string;
  fullscreenGame?: boolean; // New prop
}

// Short, quiet UI blip for the decorative buttons/joystick. Lazily created
// (no network fetch until the first press) and intentionally independent of
// AudioContext/useAudio — that provider isn't mounted on every page that
// renders this cabinet (e.g. the home page), so this stays self-contained
// and fails silently like AudioController's own playback does.
const useArcadeClickSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  return useCallback(() => {
    try {
      if (!audioRef.current) {
        const audio = new Audio('/sounds/shoot.mp3');
        audio.volume = 0.25;
        audioRef.current = audio;
      }
      const audio = audioRef.current;
      audio.currentTime = 0;
      void audio.play().catch(() => {
        // Autoplay/interaction restrictions — ignore, it's purely cosmetic.
      });
    } catch {
      // Audio unsupported in this environment — ignore.
    }
  }, []);
};

export const ArcadeLayout = ({ children, headerContent, title, fullscreenGame = false }: ArcadeLayoutProps) => {
  const playClick = useArcadeClickSound();

  if (fullscreenGame) {
    return <PageContainer as="main" $fullscreen>{children}</PageContainer>;
  }
  return (
    <PageContainer>
      <ArcadeCabinet data-testid="arcade-cabinet">
        <main style={{ display: 'contents' }}>
          <MarqueeText>ARCADE</MarqueeText>
          <Joystick aria-label="Joystick" onClick={playClick} />
          <CoinSlot />
          <ControlsContainer>
            <ButtonDecoration>
              <button aria-label="Arcade button 1" onClick={playClick} />
              <button aria-label="Arcade button 2" onClick={playClick} />
              <button aria-label="Arcade button 3" onClick={playClick} />
              <button aria-label="Arcade button 4" onClick={playClick} />
            </ButtonDecoration>
          </ControlsContainer>

          <ArcadeFrame>
            <Scanline />
            {headerContent}

            {children}

            {!title && (
              <Header style={{ marginTop: '28px', marginBottom: 0 }}>
                <Title>
                  <>
                    <span>🕹️</span>
                    <span>PLAY</span>
                    <span>🕹️</span>
                  </>
                </Title>
                <Subtitle>Select Your Game</Subtitle>
              </Header>
            )}

            {title && (
              <Header>
                <Title><span>{title}</span></Title>
              </Header>
            )}

            {!title && <InsertCoinText>INSERT COIN TO PLAY</InsertCoinText>}
          </ArcadeFrame>
        </main>
      </ArcadeCabinet>
    </PageContainer>
  );
};
