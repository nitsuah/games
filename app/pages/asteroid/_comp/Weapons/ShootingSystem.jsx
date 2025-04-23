import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSound } from '@/utils/audio/useSound';

const WEAPON_TYPES = [
  { key: 'spread', name: 'Spread Shot', maxAmmo: 30, cooldown: 1 },
  { key: 'laser', name: 'Laser Beam', maxAmmo: 10, cooldown: 0 },
  { key: 'explosive', name: 'Explosive Shot', maxAmmo: 5, cooldown: 2 },
];

const SPREAD_ANGLE = 0.25; // Spread angle in radians
const SPREAD_COUNT = 15; // Number of pellets for the shotgun
const SPREAD_RANGE = 100; // Maximum range for shotgun projectiles

const handleSpreadShot = ({
  camera,
  targets,
  setTargets,
  setShowLaser,
  playSound,
  onHit,
  onMiss,
}) => {
  const from = camera.position.clone();
  const forwardDirection = new THREE.Vector3();
  camera.getWorldDirection(forwardDirection);

  const hitTargets = new Set(); // Track hit targets to avoid duplicates
  const lasers = []; // Store laser data for visual feedback

  // Iterate through all targets
  const updatedTargets = targets.map((target) => {
    if (!target.isHit) {
      const targetPosition = new THREE.Vector3(target.x, target.y, target.z);
      const toTarget = targetPosition.sub(from).normalize(); // Vector to the target
      const distance = from.distanceTo(targetPosition);

      // Check if the target is within the cone
      const angle = forwardDirection.angleTo(toTarget);
      if (angle <= SPREAD_ANGLE && distance <= SPREAD_RANGE) {
        hitTargets.add(target.id);
        playSound('hit');
        return { ...target, isHit: true, hovered: true }; // Mark as hit and hovered
      }
    }
    return { ...target, hovered: false }; // Reset hover state for other targets
  });

  setTargets(updatedTargets); // Update targets state

  // If no targets were hit, register a miss
  if (hitTargets.size === 0) {
    playSound('miss');
    onMiss();
  }

  // Generate visual feedback for the spread
  for (let i = 0; i < SPREAD_COUNT; i++) {
    const spreadDirection = forwardDirection.clone().applyEuler(
      new THREE.Euler(
        (Math.random() - 0.5) * SPREAD_ANGLE,
        (Math.random() - 0.5) * SPREAD_ANGLE,
        0
      )
    );

    const to = from.clone().add(spreadDirection.multiplyScalar(SPREAD_RANGE));
    lasers.push({ from, to });
  }

  setShowLaser(lasers); // Update visual feedback

  // Remove lasers after 0.5 seconds
  setTimeout(() => setShowLaser(null), 500);
};

const handleLaserShot = ({
  camera,
  scene,
  setShowLaser,
  playSound,
  onHit,
  onMiss,
}) => {
  const from = camera.position.clone();
  const forwardDirection = new THREE.Vector3();
  camera.getWorldDirection(forwardDirection);

  const raycaster = new THREE.Raycaster(from, forwardDirection);
  const intersects = raycaster.intersectObjects(scene.children, true);
  let to;

  if (intersects[0]?.point) {
    to = intersects[0].point.clone(); // Use the intersection point
  } else {
    to = from.clone().add(forwardDirection.multiplyScalar(100)); // Default to a point far ahead
  }

  setShowLaser([{ from, to }]); // Update visual feedback

  // Remove laser after 0.5 seconds
  setTimeout(() => setShowLaser(null), 500);

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
};

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
          handleSpreadShot({
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
          handleLaserShot({
            camera,
            scene,
            setShowLaser,
            playSound,
            onHit,
            onMiss,
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

  // Cooldown timer logic
  useEffect(() => {
    const updateCooldowns = () => {
      setCooldowns((prev) => {
        const updatedCooldowns = { ...prev };
        Object.keys(updatedCooldowns).forEach((key) => {
          if (updatedCooldowns[key] > 0) {
            updatedCooldowns[key] = Math.max(0, updatedCooldowns[key] - 1 / 60); // Decrease cooldown by 1 frame (assuming 60 FPS)
          }
        });
        return updatedCooldowns;
      });
    };

    const interval = setInterval(updateCooldowns, 1000 / 60); // Run at 60 FPS
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [setCooldowns]);

  return null;
};

export default ShootingSystem;
