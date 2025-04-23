import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSound } from '@/utils/audio/useSound';

const WEAPON_TYPES = [
  { key: 'spread', name: 'Spread Shot', maxAmmo: 30, cooldown: 0.3 },
  { key: 'laser', name: 'Laser Beam', maxAmmo: 10, cooldown: 0 },
  { key: 'explosive', name: 'Explosive Shot', maxAmmo: 5, cooldown: 0 },
];

const now = () => performance.now() / 1000;

const SPREAD_ANGLE = 10; // Maximum angle offset for spread rays
const SPREAD_COUNT = 5; // Number of rays in the spread

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
  const raycaster = new THREE.Raycaster();
  const { playSound } = useSound();

  useEffect(() => {
    const handleShoot = (e) => {
      if (document.pointerLockElement && !isGameOver) {
        if (cooldowns[weapon] > 0 && ammo[weapon] > 0) {
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
          const from = camera.position.clone();
          const direction = new THREE.Vector3();
          camera.getWorldDirection(direction);

          // Generate multiple rays for the spread
          for (let i = 0; i < SPREAD_COUNT; i++) {
            const spreadDirection = direction.clone();
            const offsetX = (Math.random() - 0.5) * SPREAD_ANGLE * (Math.PI / 180);
            const offsetY = (Math.random() - 0.5) * SPREAD_ANGLE * (Math.PI / 180);
            spreadDirection.applyAxisAngle(camera.up, offsetX);
            spreadDirection.applyAxisAngle(new THREE.Vector3(1, 0, 0), offsetY);

            raycaster.set(from, spreadDirection);
            const intersects = raycaster.intersectObjects(scene.children, true);

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

        if (weapon === 'laser') {
          const from = camera.position.clone();
          const left = new THREE.Vector3();
          camera.getWorldDirection(left);
          left.crossVectors(camera.up, left).normalize();
          const offset = 0.5;
          from.add(left.multiplyScalar(offset));
          const direction = new THREE.Vector3();
          camera.getWorldDirection(direction);
          raycaster.set(from, direction);
          const intersects = raycaster.intersectObjects(scene.children, true);
          let to;
          if (intersects[0]?.point) {
            to = intersects[0].point.clone();
          } else {
            to = from.clone().add(direction.multiplyScalar(100));
          }
          if (e.button === 0) {
            setShowLaser({ from, to, time: now(), which: 'left' });
          } else if (e.button === 2) {
            setShowLaser({ from, to, time: now(), which: 'right' });
          }
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
