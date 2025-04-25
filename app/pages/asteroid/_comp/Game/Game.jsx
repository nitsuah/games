import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSound } from '@/utils/audio/useSound';
import styles from './Game.module.css';
import { handleHealthDepletion as handleHealthDepletionFn } from './handleHealthDepletion';
import { handleGameOver as handleGameOverFn } from './handleGameOver';
import FlashOverlays from '../UI/FlashOverlays';
import GameCanvas from './GameCanvas';
import GameOverOverlay from '../UI/GameOverOverlay';
import ScoreDisplay from '../UI/ScoreDisplay';
import WeaponDisplay from '../UI/WeaponDisplay';
import { now } from '@/utils/time';
import { handleTargetHit as handleTargetHitFn } from './handleTargetHit';
import { handleMiss as handleMissFn } from './handleMiss';
import { restartGame as restartGameFn } from './restartGame';
import { handlePlayerHit as handlePlayerHitFn } from './handlePlayerHit';
import { handleKeyDown as handleKeyDownFn } from './handleKeyDown';
import { updateScore as updateScoreFn } from './updateScore';
import { loadSavedScores as loadSavedScoresFn } from './loadSavedScores';
import ShotReticle from '../UI/ShotReticle';
import usePowerUps from '../../../../_components/effects/usePowerUps';

const Game = ({ onHit, onMiss }) => {
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [bestAccuracy, setBestAccuracy] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [health, setHealth] = useState(100);
  const [targets, setTargets] = useState([
    { id: 1, x: 15, y: 0, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 2, x: -15, y: 0, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 3, x: 0, y: 15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 4, x: 0, y: -15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 5, x: 12, y: 15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 6, x: 15, y: 17, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 7, x: 18, y: 19, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 8, x: -12, y: 15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 9, x: -15, y: 17, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 10, x: -18, y: 19, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
  ]);
  const { playSound, pauseSound } = useSound();

  // Weapon state
  const [weapon, setWeapon] = useState('spread');
  const [ammo, setAmmo] = useState({
    spread: 30,
    laser: 10,
    explosive: 5,
  });
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
  } = usePowerUps(setHealth, setTargets, showFlash);

  // Apply slow motion effect
  useEffect(() => {
    if (slowMotionActive) {
      console.log('Slow Motion is active. Target speeds are reduced.');
      setTargets((prevTargets) =>
        prevTargets.map((target) => ({
          ...target,
          speed: target.speed * 0.1, // Reduce target speed by 90%
        }))
      );
    }
  }, [slowMotionActive]);

  // Weapon switch, ammo, & reload handler
  useEffect(() => {
    const handleKeyDown = (e) => handleKeyDownFn(e, setWeapon, setAmmo);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setWeapon, setAmmo]);

  // Load saved scores
  useEffect(() => {
    loadSavedScoresFn({ setHighScore, setBestAccuracy });
  }, [setHighScore, setBestAccuracy]);

  // Update score and accuracy
  useEffect(() => {
    updateScoreFn({ hits, misses, setScore });
  }, [hits, misses, setScore]);
  
  // Play background music on mount
  useEffect(() => {
    if (!gameOver) {
      playSound('bgm')
        .catch((err) => console.error('Failed to play bgm:', err)); // Catch errors to avoid unhandled rejections
    }

    return () => {
      if (gameOver) {
        pauseSound('bgm'); // Pause background music when the game ends
      }
    };
  }, [playSound, pauseSound, gameOver]);

  // Handle player state
  useEffect(() => {
    const handleCollision = () => {
      if (gameOver) {
        console.log('Game is over. Skipping collision handling.');
        return;
      }

      if (health > 0) {
        console.log('Calling handleHealthDepletionFn...');
        console.log(`shieldActive: ${shieldActive}, invincibilityActive: ${invincibilityActive}`);

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
        console.log('Health is already zero or game is over. Skipping handleHealthDepletionFn.');
      }
    };

    window.addEventListener('playerCollision', handleCollision);

    return () => {
      window.removeEventListener('playerCollision', handleCollision);
    };
  }, [gameOver, shieldActive, invincibilityActive, health, setHealth, setGameOver, pauseSound, playSound, showFlash, setShieldActive]);

  useEffect(() => {
    const handleShoot = () => {
      console.log('Shooting disabled because the game is over.');
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
        onHit,
        targetRefs,
      }),
    [cooldowns, weapon, ammo, setTargets, setHits, onHit]
  );
  // Add logging to confirm splitting logic
  useEffect(() => {
    // console.debug('Targets updated:', targets);
  }, [targets]);

  // HANDLE MISS
  const handleMiss = useCallback(
    () => handleMissFn({ setMisses, onMiss }),
    [setMisses, onMiss]
  );

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
    });

  // HANDLE REFS
  const targetRefs = useRef({});

  const handleRefCallback = (targetId, ref) => {
    targetRefs.current[targetId] = ref;
  };

  // Red flash effect when player is hit
  const handlePlayerHit = useCallback(
    (targetSize) =>
      handlePlayerHitFn({
        targetSize,
        setHealth,
        showFlash,
        playSound,
      }),
    [setHealth, showFlash, playSound]
  );

  useEffect(() => {
    handleGameOverFn({
      targets,
      setGameOver,
      pauseSound,
      playSound,
      hits,
      misses,
      score,
      highScore,
      setHighScore,
      setIsNewHighScore,
      bestAccuracy,
      setBestAccuracy,
    });
  }, [targets, hits, misses, score, highScore, bestAccuracy, pauseSound, playSound, setGameOver, setHighScore, setIsNewHighScore, setBestAccuracy]);

  return (
    <div className={styles.gameContainer}>
      <FlashOverlays flashQueue={flashQueue} />
      <GameCanvas
        gameOver={gameOver}
        health={health}
        targets={targets}
        setTargets={setTargets}
        setHealth={setHealth}
        setGameOver={setGameOver}
        playSound={playSound}
        pauseSound={pauseSound}
        onHit={onHit}
        onMiss={onMiss}
        weapon={weapon}
        ammo={ammo}
        setAmmo={setAmmo}
        cooldowns={cooldowns}
        setCooldowns={setCooldowns}
        showLaser={showLaser}
        setShowLaser={setShowLaser}
        handlePowerUpCollect={handlePowerUpCollect}
        handleTargetHit={handleTargetHit}
      />
      {weapon === 'spread' && <ShotReticle />} {/* Render reticle for shotgun */}
      <ScoreDisplay score={score} />
      <WeaponDisplay weapon={weapon} ammo={ammo} cooldowns={cooldowns} />
      <div className={styles.statsDisplay}>
        Health: {health} <br />
        Score: {score} <br />
        High Score: {highScore} <br />
        Best Accuracy: {bestAccuracy.toFixed(1)}%
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
        />
      )}
    </div>
  );
};

export default Game;
