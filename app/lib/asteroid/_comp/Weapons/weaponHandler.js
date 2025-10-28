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
  const from = camera.position.clone();
  const forwardDirection = new THREE.Vector3();
  camera.getWorldDirection(forwardDirection);

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
    // Spread logic — widened and sped-up for better feel
  const { SPREAD_ANGLE = 1.25, SPREAD_COUNT = 18, SPREAD_RANGE = 260 } = weaponParams;
    const hitTargets = new Set();
    const lasers = [];
    const updatedTargets = targets.map((target) => {
      if (!target.isHit) {
        const targetPosition = new THREE.Vector3(target.x, target.y, target.z);
        const toTarget = targetPosition.sub(from).normalize();
        const distance = from.distanceTo(targetPosition);
        const angle = forwardDirection.angleTo(toTarget);
        if (angle <= SPREAD_ANGLE && distance <= SPREAD_RANGE) {
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

    for (let i = 0; i < SPREAD_COUNT; i++) {
      const spreadDirection = forwardDirection
        .clone()
        .applyEuler(
          new THREE.Euler(
            (Math.random() - 0.5) * SPREAD_ANGLE,
            (Math.random() - 0.5) * SPREAD_ANGLE,
            0
          )
        );
      const to = from.clone().add(spreadDirection.multiplyScalar(SPREAD_RANGE));
      // attach a speed scalar to the tracer so the renderer can animate a trail
      lasers.push({ from, to, speed: 1.6 + Math.random() * 0.8 });
    }
    if (setShowLaser) {
      // Show tracers longer so the ShootingSystem can render fading trails
      setShowLaser(lasers);
      setTimeout(() => setShowLaser(null), 350);
    }
    return;
  }

  if (type === 'explosive') {
    // Explosive logic
    const { explosionRadius = 50 } = weaponParams;
    const maxRange = 100;
    const raycaster = new THREE.Raycaster(from, forwardDirection);
    const intersects = raycaster.intersectObjects(scene.children, true);
    const impactPoint =
      intersects[0]?.point || from.clone().add(forwardDirection.multiplyScalar(maxRange));
    if (setShowLaser) {
      setShowLaser([{ from, to: impactPoint }]);
      setTimeout(() => setShowLaser(null), 120);
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
