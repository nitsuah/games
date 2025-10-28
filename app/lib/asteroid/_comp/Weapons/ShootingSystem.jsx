import { useEffect, useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useSound } from '@/utils/audio/useSound';
import CooldownManager from '@/lib/asteroid/_comp/Weapons/CooldownManager';
import Explosion from '@/_components/effects/Explosion';
import { WEAPON_CONFIG, WEAPON_TYPES } from '@/lib/asteroid/_comp/config';
import { weaponHandler } from '@/lib/asteroid/_comp/Weapons/weaponHandler';

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
              triggerExplosion: (position) =>
                setExplosions((prev) => [
                  ...prev,
                  { id: Date.now(), position, explosionRadius: WEAPON_CONFIG.explosive.radius },
                ]),
            }
          : {},
      triggerExplosion: (position) =>
        setExplosions((prev) => [
          ...prev,
          { id: Date.now(), position, explosionRadius: WEAPON_CONFIG.explosive.radius },
        ]),
    });

    const weaponCooldown = WEAPON_TYPES.find((w) => w.key === weapon).cooldown;
    const adjustedCooldown = rapidFireActive ? weaponCooldown / 2 : weaponCooldown;
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
        }, 100); // Fire every 100ms when holding mouse
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
