import * as THREE from 'three';

const SpreadShotHandler = ({
  camera,
  targets,
  setTargets,
  setShowLaser,
  playSound,
  onHit,
  onMiss,
  SPREAD_ANGLE = 0.25,
  SPREAD_COUNT = 15,
  SPREAD_RANGE = 100,
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
        return { ...target, isHit: true }; // Mark target as hit
      }
    }
    return target;
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

  if (typeof setShowLaser === 'function') {
    setShowLaser(lasers); // Update visual feedback
    setTimeout(() => setShowLaser(null), 120); // Remove lasers after 120 milliseconds
  } else {
    console.error('setShowLaser is not a function or is undefined.');
  }
};

export default SpreadShotHandler;
