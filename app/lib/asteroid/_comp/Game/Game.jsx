import { useState, useCallback, useRef, useEffect } from 'react';
import { useSound } from '@/utils/audio/useSound';
import { useAudio } from '@/contexts/AudioContext';
import styles from './Game.module.css';
import { handleHealthDepletion as handleHealthDepletionFn } from '@/lib/asteroid/_comp/Game/handleHealthDepletion';
import GameCanvas from '@/lib/asteroid/_comp/Game/GameCanvas';
import dynamic from 'next/dynamic';

// Dynamically import overlays and UI components on the client to keep server bundles small
const FlashOverlays = dynamic(() => import('@/lib/asteroid/_comp/UI/FlashOverlays'), { ssr: false });
const GameOverOverlay = dynamic(() => import('@/lib/asteroid/_comp/UI/GameOverOverlay'), { ssr: false });
const ScoreDisplay = dynamic(() => import('@/lib/asteroid/_comp/UI/ScoreDisplay'), { ssr: false });
const WeaponDisplay = dynamic(() => import('@/lib/asteroid/_comp/UI/WeaponDisplay'), { ssr: false });
import { now } from '@/utils/time';
import { handleTargetHit as handleTargetHitFn } from '@/lib/asteroid/_comp/Game/handleTargetHit';
import { handleMiss as handleMissFn } from '@/lib/asteroid/_comp/Game/handleMiss';
import { restartGame as restartGameFn } from '@/lib/asteroid/_comp/Game/restartGame';
import { handlePlayerHit as handlePlayerHitFn } from '@/lib/asteroid/_comp/Game/handlePlayerHit';
import { handleKeyDown as handleKeyDownFn } from '@/lib/asteroid/_comp/Game/handleKeyDown';
import { loadSavedScores as loadSavedScoresFn } from '@/lib/asteroid/_comp/Game/loadSavedScores';
import { saveGameStats } from '@/utils/saveGameStats';
const ShotReticle = dynamic(() => import('@/lib/asteroid/_comp/UI/ShotReticle'), { ssr: false });
const PowerUpIndicator = dynamic(() => import('@/lib/asteroid/_comp/UI/PowerUpIndicator'), { ssr: false });
const HealthBar = dynamic(() => import('@/lib/asteroid/_comp/UI/HealthBar'), { ssr: false });
const FPSCounter = dynamic(() => import('@/lib/asteroid/_comp/UI/FPSCounter'), { ssr: false });
const AmmoIndicator = dynamic(() => import('@/lib/asteroid/_comp/UI/AmmoIndicator'), { ssr: false });
const ComboDisplay = dynamic(() => import('@/lib/asteroid/_comp/UI/ComboDisplay'), { ssr: false });
const WaveIndicator = dynamic(() => import('@/lib/asteroid/_comp/UI/WaveIndicator'), { ssr: false });
const DebugMenu = dynamic(() => import('@/lib/asteroid/_comp/UI/DebugMenu'), { ssr: false });
const WaveTransition = dynamic(() => import('@/lib/asteroid/_comp/UI/WaveTransition'), { ssr: false });
const PauseMenu = dynamic(() => import('@/lib/asteroid/_comp/UI/PauseMenu'), { ssr: false });
const SlowMotionOverlay = dynamic(() => import('@/lib/asteroid/_comp/UI/SlowMotionOverlay'), { ssr: false });
import usePowerUps from '../../../../_components/effects/usePowerUps';
import { INITIAL_AMMO, INITIAL_HEALTH } from '@/lib/asteroid/_comp/config';
import { generateInitialTargets, getTargetCountForWave } from '@/lib/asteroid/_comp/Game/generateTargets';

const StatsPanel = ({ health, score, highScore, bestAccuracy }) => (
  <div className={styles.statsDisplay}>
    Health: {health} <br />
    Score: {score} <br />
    High Score: {highScore} <br />
    Best Accuracy: {bestAccuracy.toFixed(1)}%
  </div>
);

const Game = ({ onHit, onMiss }) => {
  const { musicEnabled } = useAudio();
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const comboTimerRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [bestAccuracy, setBestAccuracy] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [health, setHealth] = useState(INITIAL_HEALTH);
  const [trailQuality, setTrailQuality] = useState(() => {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem('trailQuality') || 'high'
    } catch {
      // ignore
    }
    return 'high'
  })
  
  // Wave system state
  const [currentWave, setCurrentWave] = useState(1);
  const [highestWave, setHighestWave] = useState(1);
  const [showWaveTransition, setShowWaveTransition] = useState(false);
  
  const [targets, setTargets] = useState([
    {
      id: 1,
      x: 15,
      y: 0,
      z: 0,
      isHit: false,
      size: 10,
      speed: 10,
      color: '#00ff00',
      spawnTime: now(),
    },
    {
      id: 2,
      x: -15,
      y: 0,
      z: 0,
      isHit: false,
      size: 10,
      speed: 10,
      color: '#00ff00',
      spawnTime: now(),
    },
    {
      id: 3,
      x: 0,
      y: 15,
      z: 0,
      isHit: false,
      size: 10,
      speed: 10,
      color: '#00ff00',
      spawnTime: now(),
    },
    {
      id: 4,
      x: 0,
      y: -15,
      z: 0,
      isHit: false,
      size: 10,
      speed: 10,
      color: '#00ff00',
      spawnTime: now(),
    },
    {
      id: 5,
      x: 12,
      y: 15,
      z: 0,
      isHit: false,
      size: 10,
      speed: 10,
      color: '#00ff00',
      spawnTime: now(),
    },
    {
      id: 6,
      x: 15,
      y: 17,
      z: 0,
      isHit: false,
      size: 10,
      speed: 10,
      color: '#00ff00',
      spawnTime: now(),
    },
    {
      id: 7,
      x: 18,
      y: 19,
      z: 0,
      isHit: false,
      size: 10,
      speed: 10,
      color: '#00ff00',
      spawnTime: now(),
    },
    {
      id: 8,
      x: -12,
      y: 15,
      z: 0,
      isHit: false,
      size: 10,
      speed: 10,
      color: '#00ff00',
      spawnTime: now(),
    },
    {
      id: 9,
      x: -15,
      y: 17,
      z: 0,
      isHit: false,
      size: 10,
      speed: 10,
      color: '#00ff00',
      spawnTime: now(),
    },
    {
      id: 10,
      x: -18,
      y: 19,
      z: 0,
      isHit: false,
      size: 10,
      speed: 10,
      color: '#00ff00',
      spawnTime: now(),
    },
  ]);
  const { playSound, pauseSound } = useSound();

  // Weapon state
  const [weapon, setWeapon] = useState('spread');
  const [ammo, setAmmo] = useState({ ...INITIAL_AMMO });
  const [cooldowns, setCooldowns] = useState({
    spread: 0,
    laser: 0,
    explosive: 0,
  });
  const [showLaser, setShowLaser] = useState([]);

  // Replace flashes state with a queue of active flashes
  const [flashQueue, setFlashQueue] = useState([]);

  // Helper to show a flash by type, supporting stacking/sequencing
  const showFlash = (type, duration = 100) => {
    const id = `${type}-${Date.now()}-${Math.random()}`;
    setFlashQueue((prev) => [...prev, { id, type }]);
    setTimeout(() => {
      setFlashQueue((prev) => prev.filter((f) => f.id !== id));
    }, duration);
  };

  // Power-up and flash overlay state/logic
  const {
    shieldActive,
    setShieldActive,
    rapidFireActive,
    setRapidFireActive,
    slowMotionActive,
    setSlowMotionActive,
    invincibilityActive,
    setInvincibilityActive,
    speedBoostActive,
    setSpeedBoostActive,
    handlePowerUpCollect,
  } = usePowerUps(setHealth, setTargets, showFlash, setAmmo);

  // Weapon switch, ammo, & reload handler
  useEffect(() => {
    const handleKeyDown = (e) => handleKeyDownFn(e, setWeapon, setAmmo, setPaused);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setWeapon, setAmmo]);

  // Keyboard shortcut: press 't' to cycle trail quality Off -> Low -> High
  useEffect(() => {
    const cycle = (q) => (q === 'off' ? 'low' : q === 'low' ? 'high' : 'off');
    const onKey = (e) => {
      // ignore when typing in inputs
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
      if (e.key && e.key.toLowerCase() === 't') {
        setTrailQuality((prev) => {
          const next = cycle(prev);
          try { localStorage.setItem('trailQuality', next) } catch { /* ignore */ }
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setTrailQuality]);

  // Load saved scores
  useEffect(() => {
    loadSavedScoresFn({ setHighScore, setBestAccuracy });
  }, [setHighScore, setBestAccuracy]);

  // Score is now updated incrementally in handleTargetHit, no need for recalculation effect

  // Play background music on mount and control based on musicEnabled
  useEffect(() => {
    if (!gameOver && musicEnabled) {
      playSound('bgm').catch((err) => console.error('Failed to play bgm:', err));
    } else if (!musicEnabled) {
      pauseSound('bgm');
    }

    return () => {
      if (gameOver) {
        pauseSound('bgm'); // Pause background music when the game ends
      }
    };
  }, [playSound, pauseSound, gameOver, musicEnabled]);

  // Handle player state
  useEffect(() => {
    const handleCollision = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Game] playerCollision event received');
      }
      if (gameOver) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Game is over. Skipping collision handling.');
        }
        return;
      }

      if (health > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Calling handleHealthDepletionFn...');
          console.log(`shieldActive: ${shieldActive}, invincibilityActive: ${invincibilityActive}`);
        }

        handleHealthDepletionFn({
          health,
          setHealth,
          setGameOver,
          pauseSound,
          playSound,
          showFlash,
          invincibilityActive,
          shieldActive,
          setShieldActive,
        });
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('Health is already zero or game is over. Skipping handleHealthDepletionFn.');
        }
      }
    };

    window.addEventListener('playerCollision', handleCollision);

    return () => {
      window.removeEventListener('playerCollision', handleCollision);
    };
  }, [
    gameOver,
    shieldActive,
    invincibilityActive,
    health,
    setHealth,
    setGameOver,
    pauseSound,
    playSound,
    showFlash,
    setShieldActive,
  ]);

  useEffect(() => {
    const handleShoot = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Shooting disabled because the game is over.');
      }
    };

    if (gameOver) {
      window.removeEventListener('keydown', handleKeyDownFn);
      window.removeEventListener('keyup', handleKeyDownFn);
      window.removeEventListener('mousedown', handleShoot); // Disable shooting
    }
  }, [gameOver]);

  // HANDLE HIT
  const handleTargetHit = useCallback(
    (targetId) =>
      handleTargetHitFn({
        targetId,
        cooldowns,
        weapon,
        ammo,
        setTargets,
        setHits,
        setScore,
        onHit,
        targetRefs,
        setCombo,
        setComboMultiplier,
        comboTimerRef,
      }),
    [cooldowns, weapon, ammo, setTargets, setHits, setScore, onHit]
  );
  // Add logging to confirm splitting logic
  useEffect(() => {
    // console.debug('Targets updated:', targets);
  }, [targets]);

  // HANDLE MISS
  const handleMissCallback = useCallback(
    () =>
      handleMissFn({
        setMisses,
        onMiss,
        setCombo,
        setComboMultiplier,
        comboTimerRef,
      }),
    [setMisses, onMiss, setCombo, setComboMultiplier, comboTimerRef]
  );

  // Wave completion - spawn next wave when all targets destroyed
  useEffect(() => {
    if (gameOver || paused || showWaveTransition) return;

    const activeTargets = targets.filter((t) => !t.isHit);
    
    // When all targets destroyed, start next wave (but not on initial render when targets is empty)
    if (activeTargets.length === 0 && currentWave >= 1) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Wave ${currentWave} complete! Starting wave ${currentWave + 1}`);
      }
      
      // Show wave transition
      setShowWaveTransition(true);
      
      // Update highest wave if needed
      const nextWave = currentWave + 1;
      if (nextWave > highestWave) {
        setHighestWave(nextWave);
        // Save to localStorage
        localStorage.setItem('highestWave', nextWave.toString());
      }
      
      // Wait 5 seconds then spawn next wave (increased for stats visibility)
      setTimeout(() => {
        setCurrentWave(nextWave);
        const targetCount = getTargetCountForWave(nextWave);
        setTargets(generateInitialTargets(targetCount, nextWave));
        setShowWaveTransition(false);
      }, 5000);
    }
  }, [targets, gameOver, paused, showWaveTransition, currentWave, highestWave, setHighestWave, setCurrentWave, setShowWaveTransition, setTargets]);

  // Load highest wave from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('highestWave');
    if (saved) {
      setHighestWave(parseInt(saved, 10));
    }
  }, [setHighestWave]);

  // HANDLE RESTART
  const restartGame = () =>
    restartGameFn({
      setScore,
      setHits,
      setMisses,
      setGameOver,
      setHealth,
      setWeapon,
      setAmmo,
      setCooldowns,
      setTargets,
      setShieldActive,
      setRapidFireActive,
      setSlowMotionActive,
      setInvincibilityActive,
      setSpeedBoostActive,
      setCombo,
      setComboMultiplier,
      comboTimerRef,
      setCurrentWave,
      setShowWaveTransition,
    });

  // HANDLE REFS
  const targetRefs = useRef({});

  // Red flash effect when player is hit
  const handlePlayerHit = useCallback(
    (targetSize) =>
      handlePlayerHitFn({
        targetSize,
        setHealth,
        showFlash,
        playSound,
        defense: {
          shieldActive,
          setShieldActive,
          invincibilityActive,
        },
      }),
    [setHealth, showFlash, playSound, shieldActive, setShieldActive, invincibilityActive]
  );

  // Check for game over when health reaches 0
  useEffect(() => {
    if (health <= 0 && !gameOver) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Health depleted - triggering game over');
        console.log('Current score:', score, 'Hits:', hits, 'Misses:', misses);
      }
      setGameOver(true);
      pauseSound('bgm');
      playSound('gameOver');
      document.exitPointerLock();
      
      // Save high score and accuracy using utility function
      saveGameStats({
        score,
        hits,
        misses,
        highScore,
        bestAccuracy,
        setHighScore,
        setBestAccuracy,
        setIsNewHighScore,
      });
    }
  }, [health, gameOver, setGameOver, pauseSound, playSound, score, highScore, setHighScore, setIsNewHighScore, hits, misses, bestAccuracy, setBestAccuracy]);

  // Removed handleGameOver effect - wave transitions handle target completion now
  // Game only ends when health reaches 0

  return (
    <div className={styles.gameContainer}>
      <FlashOverlays flashQueue={flashQueue} />
      <GameCanvas
        gameOver={gameOver}
        paused={paused}
        showWaveTransition={showWaveTransition}
        health={health}
        targets={targets}
        setTargets={setTargets}
        setHealth={setHealth}
        setGameOver={setGameOver}
        playSound={playSound}
        pauseSound={pauseSound}
        onHit={onHit}
        onMiss={handleMissCallback}
        weapon={weapon}
        ammo={ammo}
        setAmmo={setAmmo}
        cooldowns={cooldowns}
        setCooldowns={setCooldowns}
        showLaser={showLaser}
        setShowLaser={setShowLaser}
        handlePowerUpCollect={handlePowerUpCollect}
        handleTargetHit={handleTargetHit}
        handlePlayerHit={handlePlayerHit}
        shieldActive={shieldActive}
        setShieldActive={setShieldActive}
        rapidFireActive={rapidFireActive}
        invincibilityActive={invincibilityActive}
        speedBoostActive={speedBoostActive}
        trailQuality={trailQuality}
      />
      {/* HUD Layout - Organized in 4 corners */}
      
      {/* TOP LEFT - FPS */}
      <div style={{ position: 'fixed', top: 16, left: 16, zIndex: 500 }}>
        <FPSCounter />
      </div>
      
      {/* TOP RIGHT - Wave, Score & Combo */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 500, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
        <WaveIndicator wave={currentWave} showTransition={showWaveTransition} highestWave={highestWave} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <ScoreDisplay score={score} />
          <ComboDisplay combo={combo} multiplier={comboMultiplier} />
        </div>
      </div>
      
      {/* RIGHT SIDE - Power-ups */}
      <div style={{ position: 'fixed', top: '200px', right: 16, zIndex: 500 }}>
        <PowerUpIndicator
          shieldActive={shieldActive}
          rapidFireActive={rapidFireActive}
          slowMotionActive={slowMotionActive}
          invincibilityActive={invincibilityActive}
          speedBoostActive={speedBoostActive}
        />
      </div>
      
      {/* BOTTOM RIGHT - Health, Weapon & Ammo */}
      <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 500, display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
        <HealthBar health={health} maxHealth={INITIAL_HEALTH} />
        <AmmoIndicator weapon={weapon} ammo={ammo} />
        <WeaponDisplay weapon={weapon} ammo={ammo} cooldowns={cooldowns} />
      </div>

      {/* BOTTOM LEFT - Debug menu */}
      <DebugMenu trailQuality={trailQuality} setTrailQuality={setTrailQuality} />
      {weapon === 'spread' && <ShotReticle />}
      {/* StatsPanel is kept but moved off-canvas by default; toggle in debug only */}
      <div style={{ position: 'fixed', left: 12, bottom: 12, zIndex: 400, opacity: 0.9, pointerEvents: 'none' }}>
        <StatsPanel health={health} score={score} highScore={highScore} bestAccuracy={bestAccuracy} />
      </div>
      {gameOver && (
        <GameOverOverlay
          score={score}
          isNewHighScore={isNewHighScore}
          hits={hits}
          misses={misses}
          bestAccuracy={bestAccuracy}
          highScore={highScore}
          restartGame={restartGame}
          wave={currentWave}
        />
      )}
      {showWaveTransition && !gameOver && (
        <WaveTransition 
          wave={currentWave}
          score={score}
          highScore={highScore}
          isNewHighScore={score > highScore}
          accuracy={hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0}
        />
      )}
      {paused && !gameOver && (
        <PauseMenu 
          onResume={() => setPaused(false)}
          onRestart={() => {
            // Reset all game state using shared restart logic
            restartGameFn({
              setScore,
              setHits,
              setMisses,
              setGameOver,
              setHealth,
              setWeapon,
              setAmmo,
              setCooldowns,
              setTargets,
              setShieldActive,
              setRapidFireActive,
              setSlowMotionActive,
              setInvincibilityActive,
              setSpeedBoostActive,
              setCombo,
              setComboMultiplier,
              comboTimerRef,
              setCurrentWave,
              setShowWaveTransition,
            });
            setShowLaser([]);
            setFlashQueue([]);
            setPaused(false);
            setIsNewHighScore(false);
            // Restart background music
            pauseSound('bgm');
            playSound('bgm');
          }}
          onQuit={() => {
            // Quit to main menu
            pauseSound('bgm');
            document.exitPointerLock();
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
          }}
          score={score}
        />
      )}
      <SlowMotionOverlay active={slowMotionActive} />
    </div>
  );
};

export default Game;
