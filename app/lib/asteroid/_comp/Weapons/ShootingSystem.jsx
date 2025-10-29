import { useEffect, useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useSound } from '@/utils/audio/useSound';
import CooldownManager from '@/lib/asteroid/_comp/Weapons/CooldownManager';
import Explosion from '@/_components/effects/Explosion';
import { WEAPON_CONFIG, WEAPON_TYPES } from '@/lib/asteroid/_comp/config';
import { weaponHandler } from '@/lib/asteroid/_comp/Weapons/weaponHandler';
import soundManager from '@/utils/audio/SoundManager';

const ShootingSystem = ({
  onHit,
  onMiss,
  isGameOver,
  isPaused,
  weapon,
  ammo,
  setAmmo,
  cooldowns,
  setCooldowns,
  setShowLaser,
  targets,
  setTargets,
  rapidFireActive,
}) => {
  const { camera, scene } = useThree();
  const { playSound } = useSound();
  const [explosions, setExplosions] = useState([]);
  const mouseDownRef = useRef(false);
  const autoFireIntervalRef = useRef(null);

  const handleShoot = () => {
    if (isGameOver || isPaused) return;
    if (cooldowns[weapon] > 0) return;
    if (ammo[weapon] <= 0) {
      playSound('empty');
      return;
    }

    weaponHandler({
      type: weapon,
      camera,
      scene,
      targets,
      setTargets,
      setShowLaser,
      playSound,
      onHit,
      onMiss,
      weaponParams:
        weapon === 'spread'
          ? {
              SPREAD_ANGLE: WEAPON_CONFIG.spread.angle,
              SPREAD_COUNT: WEAPON_CONFIG.spread.count,
              SPREAD_RANGE: WEAPON_CONFIG.spread.range,
            }
          : weapon === 'explosive'
          ? {
                  explosionRadius: WEAPON_CONFIG.explosive.radius,
                  triggerExplosion: (position) => {
                    const radius = WEAPON_CONFIG.explosive.radius;
                    setExplosions((prev) => [
                      ...prev,
                      { id: Date.now(), position, explosionRadius: radius },
                    ]);
                    // Map explosion size to nearby target sizes for more characterful sound
                    try {
                      // Find targets within radius*1.5 and use the largest target size as bias
                      const nearby = targets.filter((t) => {
                        const dx = t.x - position.x;
                        const dy = t.y - position.y;
                        const dz = (t.z || 0) - (position.z || 0);
                        const dist2 = dx * dx + dy * dy + dz * dz;
                        return dist2 <= (radius * 1.5) * (radius * 1.5);
                      });
                      const largest = nearby.reduce((max, t) => Math.max(max, t.size || 1), 0) || 1;
                      const sizeFactor = Math.max(0.5, Math.min(3, largest / 10));
                      // Compute simple pan based on x offset from camera
                      const camPos = camera.position || { x: 0, y: 0, z: 0 };
                      const dx = (position.x || 0) - camPos.x;
                      const pan = Math.max(-1, Math.min(1, dx / 50));
                      soundManager.playExplosion(sizeFactor, pan);
                    } catch {
                      /* ignore */
                    }
                  },
                }
          : {},
      triggerExplosion: (position) => {
        const radius = WEAPON_CONFIG.explosive.radius;
        setExplosions((prev) => [
          ...prev,
          { id: Date.now(), position, explosionRadius: radius },
        ]);
        try {
          soundManager.playExplosion(Math.max(0.5, radius / 50));
        } catch {
          /* ignore */
        }
      },
    });

    const weaponCooldown = WEAPON_TYPES.find((w) => w.key === weapon).cooldown;
    const adjustedCooldown = rapidFireActive ? weaponCooldown / 5 : weaponCooldown;
    setCooldowns((prev) => ({ ...prev, [weapon]: adjustedCooldown }));

    if (typeof setAmmo === 'function') {
      setAmmo((prev) => ({ ...prev, [weapon]: Math.max(0, prev[weapon] - 1) }));
    }

    playSound('shoot');
  };

  useEffect(() => {
    const handleMouseDown = () => {
      mouseDownRef.current = true;
      handleShoot(); // Fire immediately on click
      
      // If rapid fire is active, start auto-firing
      if (rapidFireActive) {
        if (autoFireIntervalRef.current) {
          clearInterval(autoFireIntervalRef.current);
        }
        autoFireIntervalRef.current = setInterval(() => {
          if (mouseDownRef.current) {
            handleShoot();
          }
        }, 50); // Fire every 50ms (20 rounds/sec) when holding mouse
      }
    };

    const handleMouseUp = () => {
      mouseDownRef.current = false;
      if (autoFireIntervalRef.current) {
        clearInterval(autoFireIntervalRef.current);
        autoFireIntervalRef.current = null;
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (autoFireIntervalRef.current) {
        clearInterval(autoFireIntervalRef.current);
      }
    };
  }, [handleShoot, rapidFireActive]);

  return (
    <>
      <CooldownManager cooldowns={cooldowns} setCooldowns={setCooldowns} rapidFireActive={rapidFireActive} />
      {explosions.map((explosion) => (
        <Explosion
          key={explosion.id}
          position={explosion.position}
          explosionRadius={explosion.explosionRadius}
          onComplete={() => setExplosions((prev) => prev.filter((e) => e.id !== explosion.id))}
        />
      ))}
    </>
  );
};

export default ShootingSystem;
