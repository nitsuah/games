import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useSound } from '@/utils/audio/useSound';
import SpreadShotHandler from './SpreadShotHandler';
import LaserShotHandler from './LaserShotHandler';
import CooldownManager from './CooldownManager';
import ExplosiveShotHandler from './ExplosiveShotHandler';
import Explosion from '../../../../_components/effects/Explosion';
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
  const [explosions, setExplosions] = useState([]); // Track active explosions

  useEffect(() => {
    const handleShoot = () => {
      if (isGameOver) {
        console.debug('Shooting disabled because the game is over.');
        return; // Prevent shooting when the game is over
      }

      if (document.pointerLockElement && !isGameOver) {
        // Check if the weapon is on cooldown
        if (cooldowns[weapon] > 0) {
          console.log(`Weapon: ${weapon}, Cooldown Remaining: ${cooldowns[weapon].toFixed(2)}s`);
          playSound('miss');
          return;
        }

        // Check if the player has ammo
        if (ammo[weapon] <= 0) {
          playSound('empty'); // Play empty ammo sound
          return; // Prevent shooting if out of ammo
        }

        // Log weapon and cooldown for testing
        console.log(`Weapon: ${weapon}, Cooldown Applied: ${cooldowns[weapon]}s`);

        // Handle weapon-specific logic
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

        if (weapon === 'laser') {
          LaserShotHandler({
            camera,
            scene,
            setShowLaser,
            playSound,
            onHit,
            onMiss,
          });
        }

        if (weapon === 'explosive') {
          const explosionRadius = 50; // Adjust the explosion radius here
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
        console.log(`Weapon: ${weapon}, Adjusted Cooldown: ${adjustedCooldown}s`); // Log adjusted cooldown
        setCooldowns((prev) => ({
          ...prev,
          [weapon]: adjustedCooldown,
        }));

        // Decrease ammo for the weapon
        setAmmo((prev) => ({
          ...prev,
          [weapon]: Math.max(0, prev[weapon] - 1),
        }));

        playSound('shoot');
      }
    };

    window.addEventListener('click', handleShoot);
    return () => window.removeEventListener('click', handleShoot);
  }, [
    camera,
    scene,
    onHit,
    onMiss,
    isGameOver,
    weapon,
    ammo,
    setAmmo,
    cooldowns,
    setCooldowns,
    playSound,
    setShowLaser,
    setTargets,
    rapidFireActive,
  ]);

  useEffect(() => {
    if (rapidFireActive) {
      console.log('Rapid Fire Power-Up is active!');
    } else {
      console.log('Rapid Fire Power-Up expired!');
    }
  }, [rapidFireActive]);

  return (
    <>
      <CooldownManager 
        cooldowns={cooldowns} 
        setCooldowns={setCooldowns} 
        rapidFireActive={rapidFireActive} // Pass rapidFireActive to CooldownManager
      />
      {explosions.map((explosion) => (
        <Explosion
          key={explosion.id}
          position={explosion.position}
          explosionRadius={explosion.explosionRadius} // Pass explosionRadius to Explosion
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
