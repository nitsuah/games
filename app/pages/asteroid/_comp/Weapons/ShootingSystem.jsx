import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useSound } from '@/utils/audio/useSound';
import SpreadShotHandler from './SpreadShotHandler';
import LaserShotHandler from './LaserShotHandler';
import ExplosiveShotHandler from './ExplosiveShotHandler';
import CooldownManager from './CooldownManager';
import Explosion from '../../../../_components/effects/Explosion';
import LaserBeam from './LaserBeam';
import { WEAPON_TYPES } from './constants';

const ShootingSystem = ({
  onHit,
  onMiss,
  isGameOver,
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

  const handleShoot = () => {
    if (isGameOver) return;

    // Check if the weapon is on cooldown
    if (cooldowns[weapon] > 0) {
      console.log(`Weapon: ${weapon} is on cooldown. Remaining: ${cooldowns[weapon].toFixed(2)}s`);
      return;
    }

    // Check if ammo is available
    if (ammo[weapon] <= 0) {
      console.log(`Weapon: ${weapon} is out of ammo.`);
      playSound('empty'); // Play empty ammo sound
      return;
    }

    if (weapon === 'laser') {
      LaserShotHandler({
        camera,
        scene,
        setShowLaser,
        playSound,
        onHit,
        onMiss,
        targets,
        setTargets,
      });
    }

    if (weapon === 'spread') {
      SpreadShotHandler({
        camera,
        targets,
        setTargets,
        setShowLaser,
        playSound,
        onHit,
        onMiss,
      });
    }

    if (weapon === 'explosive') {
      const explosionRadius = 50;
      ExplosiveShotHandler({
        camera,
        scene,
        setShowLaser,
        playSound,
        onHit,
        onMiss,
        targets,
        setTargets,
        explosionRadius,
        triggerExplosion: (position) => {
          setExplosions((prev) => [
            ...prev,
            { id: Date.now(), position, explosionRadius },
          ]);
        },
      });
    }

    // Set the cooldown for the weapon
    const weaponCooldown = WEAPON_TYPES.find((w) => w.key === weapon).cooldown;
    const adjustedCooldown = rapidFireActive ? weaponCooldown / 2 : weaponCooldown; // Halve cooldown if rapid fire is active
    setCooldowns((prev) => ({
      ...prev,
      [weapon]: adjustedCooldown,
    }));

    // Decrease ammo for the weapon
    if (typeof setAmmo === 'function') {
      setAmmo((prev) => ({
        ...prev,
        [weapon]: Math.max(0, prev[weapon] - 1),
      }));
      console.log(`Ammo for ${weapon} decreased. Remaining: ${ammo[weapon] - 1}`);
    } else {
      console.error('setAmmo is not a function or is undefined.');
    }

    playSound('shoot');
  };

  useEffect(() => {
    window.addEventListener('click', handleShoot);
    return () => window.removeEventListener('click', handleShoot);
  }, [handleShoot]);

  return (
    <>
      <CooldownManager 
        cooldowns={cooldowns} 
        setCooldowns={setCooldowns} 
        rapidFireActive={rapidFireActive}
      />
      {explosions.map((explosion) => (
        <Explosion
          key={explosion.id}
          position={explosion.position}
          explosionRadius={explosion.explosionRadius}
          onComplete={() =>
            setExplosions((prev) =>
              prev.filter((e) => e.id !== explosion.id)
            )
          }
        />
      ))}
    </>
  );
};

export default ShootingSystem;
