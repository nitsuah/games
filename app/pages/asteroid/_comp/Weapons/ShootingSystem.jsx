import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useSound } from '@/utils/audio/useSound';
import CooldownManager from './CooldownManager';
import Explosion from '../../../../_components/effects/Explosion';
import { WEAPON_CONFIG, WEAPON_TYPES, INITIAL_AMMO  } from '../config';
import { weaponHandler } from './weaponHandler';

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
      console.debug(`Weapon: ${weapon} is on cooldown. Remaining: ${cooldowns[weapon].toFixed(2)}s`);
      return;
    }

    // Check if ammo is available
    if (ammo[weapon] <= 0) {
      console.debug(`Weapon: ${weapon} is out of ammo.`);
      playSound('empty'); // Play empty ammo sound
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
      weaponParams: weapon === 'spread'
        ? { SPREAD_ANGLE: WEAPON_CONFIG.spread.angle, SPREAD_COUNT: WEAPON_CONFIG.spread.count, SPREAD_RANGE: WEAPON_CONFIG.spread.range }
        : weapon === 'explosive'
        ? { explosionRadius: WEAPON_CONFIG.explosive.radius, triggerExplosion: (position) => setExplosions((prev) => [...prev, { id: Date.now(), position, explosionRadius: WEAPON_CONFIG.explosive.radius }]) }
        : {},
      triggerExplosion: (position) => setExplosions((prev) => [...prev, { id: Date.now(), position, explosionRadius: WEAPON_CONFIG.explosive.radius }]),
    });

    // Set the cooldown for the weapon
    const weaponCooldown = WEAPON_TYPES.find((w) => w.key === weapon).cooldown;
    const adjustedCooldown = rapidFireActive ? weaponCooldown / 2 : weaponCooldown;
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
      console.debug(`Ammo for ${weapon} decreased. Remaining: ${ammo[weapon] - 1}`);
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
