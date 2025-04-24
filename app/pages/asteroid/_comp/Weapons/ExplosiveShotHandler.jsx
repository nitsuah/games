import * as THREE from 'three';

const ExplosiveShotHandler = ({
  camera,
  targets,
  setTargets,
  setShowLaser,
  playSound,
  onHit,
  onMiss,
  explosionRadius,
  triggerExplosion,
  scene,
}) => {
  const from = camera.position.clone();
  const forwardDirection = new THREE.Vector3();
  camera.getWorldDirection(forwardDirection);

  const maxRange = 100;
  const raycaster = new THREE.Raycaster(from, forwardDirection);
  const intersects = raycaster.intersectObjects(scene.children, true);

  const impactPoint = intersects[0]?.point || from.clone().add(forwardDirection.multiplyScalar(maxRange));

  if (typeof setShowLaser === 'function') {
    setShowLaser([{ from, to: impactPoint }]); // Show the laser leading to the impact point
    setTimeout(() => setShowLaser(null), 120); // Remove laser after 0.5 seconds
  } else {
    console.error('setShowLaser is not a function or is undefined.');
  }

  // Trigger explosion animation at the impact point
  triggerExplosion(impactPoint);

  // Check for targets within the explosion radius
  const explosionSphere = new THREE.Sphere(impactPoint, explosionRadius);
  const hitTargets = new Set();

  const updatedTargets = targets.map((target) => {
    if (!target.isHit) {
      const targetPosition = new THREE.Vector3(target.x, target.y, target.z);
      if (explosionSphere.containsPoint(targetPosition)) {
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
};

export default ExplosiveShotHandler;
