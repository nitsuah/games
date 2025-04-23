import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useSound } from '@/utils/audio/useSound';
import SpreadShotHandler from './SpreadShotHandler';
import LaserShotHandler from './LaserShotHandler';
import CooldownManager from './CooldownManager';
import ExplosiveShotHandler from './ExplosiveShotHandler';

const WEAPON_TYPES = [
  { key: 'spread', name: 'Spread Shot', maxAmmo: 30, cooldown: 0.3 },
  { key: 'laser', name: 'Laser Beam', maxAmmo: 50, cooldown: 0 },
  { key: 'explosive', name: 'Explosive Shot', maxAmmo: 10, cooldown: 1 },
];

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
}) => {
  const { camera, scene } = useThree();
  const { playSound } = useSound();

  useEffect(() => {
    const handleShoot = () => {
      if (document.pointerLockElement && !isGameOver) {
        // Check if the weapon is on cooldown
        if (cooldowns[weapon] > 0) {
          playSound('miss');
          return;
        }

        // Check if the player has ammo
        if (ammo[weapon] <= 0) {
          playSound('empty'); // Play empty ammo sound
          return; // Prevent shooting if out of ammo
        }

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
          ExplosiveShotHandler({
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

        // Set the cooldown for the weapon
        const weaponCooldown = WEAPON_TYPES.find((w) => w.key === weapon).cooldown;
        setCooldowns((prev) => ({
          ...prev,
          [weapon]: weaponCooldown,
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
  ]);

  return <CooldownManager cooldowns={cooldowns} setCooldowns={setCooldowns} />;
};

export default ShootingSystem;
