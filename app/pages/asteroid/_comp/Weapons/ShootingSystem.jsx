import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSound } from '@/utils/audio/useSound';

const WEAPON_TYPES = [
  { key: 'spread', name: 'Spread Shot', maxAmmo: 30, cooldown: 0.3 },
  { key: 'laser', name: 'Laser Beam', maxAmmo: 10, cooldown: 0 },
  { key: 'explosive', name: 'Explosive Shot', maxAmmo: 5, cooldown: 0 },
];

const SPREAD_ANGLE = 0.2; // Spread angle in radians
const SPREAD_COUNT = 100; // Number of pellets for the shotgun
const SPREAD_RANGE = 100; // Maximum range for shotgun projectiles

const ShootingSystem = ({
  onHit,
  onMiss,
  isGameOver,
  weapon,
  ammo,
  setAmmo,
  cooldowns,
  setCooldowns,
  showLaser,
  setShowLaser,
}) => {
  const { camera, scene } = useThree();
  const { playSound } = useSound();

  useEffect(() => {
    const handleShoot = () => {
      if (document.pointerLockElement && !isGameOver) {
        if (cooldowns[weapon] > 0) {
          playSound('miss');
          return;
        }
        if (ammo[weapon] <= 0) {
          playSound('empty');
          return;
        }

        setCooldowns((prev) => ({ ...prev, [weapon]: WEAPON_TYPES.find(w => w.key === weapon).cooldown }));
        setAmmo((prev) => ({ ...prev, [weapon]: Math.max(0, prev[weapon] - 1) }));

        playSound('shoot');

        if (weapon === 'spread') {
          const origin = camera.position.clone();
          const forwardDirection = new THREE.Vector3();
          camera.getWorldDirection(forwardDirection);

          const hitTargets = new Set(); // Track hit targets to avoid duplicates
          const lasers = []; // Store laser data for visual feedback

          for (let i = 0; i < SPREAD_COUNT; i++) {
            // Generate a random direction within the spread angle
            const spreadDirection = forwardDirection.clone().applyEuler(
              new THREE.Euler(
                (Math.random() - 0.5) * SPREAD_ANGLE,
                (Math.random() - 0.5) * SPREAD_ANGLE,
                0
              )
            );

            const raycaster = new THREE.Raycaster(origin, spreadDirection);
            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
              const target = intersects[0];
              if (target.object.userData?.isTarget && !hitTargets.has(target.object.userData.targetId)) {
                hitTargets.add(target.object.userData.targetId);
                target.object.userData.isHit = true;
                playSound('hit');
                onHit(target.object.userData.targetId);
              }
            }

            // Debugging: Visualize the ray
            lasers.push({
              from: origin,
              to: origin.clone().add(spreadDirection.multiplyScalar(SPREAD_RANGE)),
            });
          }

          // If no targets were hit, register a miss
          if (hitTargets.size === 0) {
            playSound('miss');
            onMiss();
          }

          setShowLaser(lasers); // Update visual feedback

          // Remove lasers after 0.5 seconds
          setTimeout(() => setShowLaser([]), 500);
        }

        if (weapon === 'laser') {
          const from = camera.position.clone();
          const direction = new THREE.Vector3();
          camera.getWorldDirection(direction);
          const raycaster = new THREE.Raycaster(from, direction);
          const intersects = raycaster.intersectObjects(scene.children, true);
          let to;
          if (intersects[0]?.point) {
            to = intersects[0].point.clone();
          } else {
            to = from.clone().add(direction.multiplyScalar(100));
          }
          setShowLaser([{ from, to }]); // Ensure lasers is always an array

          // Remove laser after 0.5 seconds
          setTimeout(() => setShowLaser([]), 500);

          const targetIntersect = intersects.find((intersect) => {
            const parent = intersect.object.parent;
            return parent?.userData?.isTarget && !parent?.userData?.isHit;
          });
          if (targetIntersect) {
            const targetId = targetIntersect.object.parent.userData.targetId;
            targetIntersect.object.parent.userData.isHit = true;
            playSound('hit');
            onHit(targetId);
          } else {
            playSound('miss');
            onMiss();
          }
        }
      }
    };

    window.addEventListener('click', handleShoot);
    return () => window.removeEventListener('click', handleShoot);
  }, [camera, scene, onHit, onMiss, isGameOver, weapon, ammo, setAmmo, cooldowns, setCooldowns, playSound, setShowLaser]);

  // Cooldown timer
  useEffect(() => {
    let frame;
    const updateCooldown = () => {
      setCooldowns((prev) => {
        if (prev[weapon] > 0) {
          return { ...prev, [weapon]: Math.max(0, prev[weapon] - 1 / 60) };
        }
        return prev;
      });
      frame = requestAnimationFrame(updateCooldown);
    };
    frame = requestAnimationFrame(updateCooldown);
    return () => cancelAnimationFrame(frame);
  }, [weapon, setCooldowns]);

  return null;
};

export default ShootingSystem;
