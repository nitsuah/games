import * as THREE from 'three';

// Generic weapon handler
export function weaponHandler({
  type,
  camera,
  scene,
  targets,
  setTargets,
  setShowLaser,
  playSound,
  onHit,
  onMiss,
  weaponParams = {},
  triggerExplosion,
}) {
  const forwardDirection = new THREE.Vector3();
  camera.getWorldDirection(forwardDirection);
  
  // Different weapons need different starting positions:
  // - All weapons now start forward of camera for proper visualization
  // - Spread: starts forward with slight down offset (projectile travels through space)
  // - Laser: starts lower and more centered (down the center of screen)
  // - Explosive: starts forward with slight down offset
  const weaponOffset = type === 'spread' 
    ? forwardDirection.clone().multiplyScalar(2).add(new THREE.Vector3(0, -0.5, 0))
    : type === 'laser'
    ? forwardDirection.clone().multiplyScalar(1.5).add(new THREE.Vector3(0, -1.2, 0))
    : forwardDirection.clone().multiplyScalar(2.5).add(new THREE.Vector3(0, -0.3, 0));
  
  const from = camera.position.clone().add(weaponOffset);

  if (type === 'laser') {
    // Laser logic
    const hitTargets = new Set();
    const updatedTargets = targets.map((target) => {
      if (!target.isHit) {
        const targetPosition = new THREE.Vector3(target.x, target.y, target.z);
        const distance = from.distanceTo(targetPosition);
        const isIntersected =
          forwardDirection.angleTo(targetPosition.sub(from).normalize()) < 0.04 && distance <= 400;
        if (isIntersected) {
          hitTargets.add(target.id);
          playSound('hit');
          return { ...target, isHit: true };
        }
      }
      return target;
    });
    setTargets(updatedTargets);

    if (hitTargets.size === 0) {
      playSound('miss');
      if (onMiss) onMiss();
    } else {
      hitTargets.forEach((targetId) => {
        if (onHit) onHit(targetId);
      });
    }

    if (setShowLaser) {
      const to = from.clone().add(forwardDirection.multiplyScalar(100));
      setShowLaser([{ from, to }]);
      setTimeout(() => setShowLaser(null), 120);
    }
    return;
  }

  if (type === 'spread') {
    // Buckshot with very tight spread pattern
    const { SPREAD_ANGLE = 0.025, SPREAD_COUNT = 8, SPREAD_RANGE = 150 } = weaponParams; // Tightened from 0.035 to 0.025
    const hitTargets = new Set();
    const lasers = [];
    
    // TODO: Shotgun hit detection is too generous - hitting everything
    // Need to review and tighten the hit cone or improve collision logic
    // Check if we're hitting anything with the spread cone
    const updatedTargets = targets.map((target) => {
      if (!target.isHit) {
        const targetPosition = new THREE.Vector3(target.x, target.y, target.z);
        const toTarget = targetPosition.clone().sub(from).normalize();
        const distance = from.distanceTo(targetPosition);
        const angle = forwardDirection.angleTo(toTarget);
        if (angle <= SPREAD_ANGLE * 3 && distance <= SPREAD_RANGE) {
          hitTargets.add(target.id);
          playSound('hit');
          return { ...target, isHit: true };
        }
      }
      return target;
    });
    setTargets(updatedTargets);

    if (hitTargets.size === 0) {
      playSound('miss');
      if (onMiss) onMiss();
    }

    // Create buckshot pattern with full randomization
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    right.crossVectors(forwardDirection, camera.up).normalize();
    up.crossVectors(right, forwardDirection).normalize();

    for (let i = 0; i < SPREAD_COUNT; i++) {
      // Fully random angle for each pellet (not evenly distributed)
      const angle = Math.random() * Math.PI * 2;
      // Random radius within the spread cone
      const radius = SPREAD_ANGLE * Math.random();
      
      const offsetX = Math.cos(angle) * radius;
      const offsetY = Math.sin(angle) * radius;
      
      const spreadDirection = forwardDirection.clone()
        .add(right.clone().multiplyScalar(offsetX))
        .add(up.clone().multiplyScalar(offsetY))
        .normalize();
      
      const to = from.clone().add(spreadDirection.multiplyScalar(SPREAD_RANGE));
      // Faster projectile speed (3.5 base + small variation)
      lasers.push({ from: from.clone(), to, speed: 3.5 + Math.random() * 0.5 });
    }
    
    if (setShowLaser) {
      setShowLaser(lasers);
      setTimeout(() => setShowLaser(null), 350);
    }
    return;
  }

  if (type === 'explosive') {
    // Explosive logic
    const { explosionRadius = 30 } = weaponParams; // Reduced from 50 to 30 - smaller explosion
    const maxRange = 100;
    const raycaster = new THREE.Raycaster(from, forwardDirection);
    const intersects = raycaster.intersectObjects(scene.children, true);
    const impactPoint =
      intersects[0]?.point || from.clone().add(forwardDirection.multiplyScalar(maxRange));
    if (setShowLaser) {
      setShowLaser([{ from, to: impactPoint }]);
      setTimeout(() => setShowLaser(null), 400); // Reduced from 600ms to 400ms - faster beam decay
    }
    if (triggerExplosion) triggerExplosion(impactPoint);

    const explosionSphere = new THREE.Sphere(impactPoint, explosionRadius);
    const hitTargets = new Set();
    const updatedTargets = targets.map((target) => {
      if (!target.isHit) {
        const targetPosition = new THREE.Vector3(target.x, target.y, target.z);
        if (explosionSphere.containsPoint(targetPosition)) {
          hitTargets.add(target.id);
          playSound('hit');
          return { ...target, isHit: true };
        }
      }
      return target;
    });
    setTargets(updatedTargets);

    if (hitTargets.size === 0) {
      playSound('miss');
      if (onMiss) onMiss();
    }
    return;
  }
}
