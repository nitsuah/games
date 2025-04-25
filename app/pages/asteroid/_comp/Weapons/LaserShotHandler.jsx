import * as THREE from 'three';

const LaserShotHandler = ({
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

  // Iterate through all targets
  const updatedTargets = targets.map((target) => {
    if (!target.isHit) {
      const targetPosition = new THREE.Vector3(target.x, target.y, target.z);
      const distance = from.distanceTo(targetPosition);

      // Widen the precision by increasing the angle threshold
      const isIntersected = forwardDirection.angleTo(
        targetPosition.sub(from).normalize()
      ) < 0.04 && distance <= 400; // Angle threshold of 0.04 radians (approx. 2.29 degrees)

      if (isIntersected) {
        hitTargets.add(target.id);
        playSound('hit');
        return { ...target, isHit: true }; // Mark target as hit
      }
    }
    return target;
  });

  setTargets(updatedTargets); // Update targets state

  // If no targets were hit, register a miss
  if (hitTargets.size === 0) {
    playSound('miss');
    if (typeof onMiss === 'function') {
      onMiss();
    }
  } else {
    hitTargets.forEach((targetId) => {
      if (typeof onHit === 'function') {
        onHit(targetId); // Call onHit for each hit target
      }
    });
  }

  // Visual feedback for the laser
  if (typeof setShowLaser === 'function') {
    const to = from.clone().add(forwardDirection.multiplyScalar(100));
    setShowLaser([{ from, to }]);
    setTimeout(() => setShowLaser(null), 120); // Remove laser after 120ms
  } else {
    console.error('setShowLaser is not a function or is undefined.');
  }
};

export default LaserShotHandler;
