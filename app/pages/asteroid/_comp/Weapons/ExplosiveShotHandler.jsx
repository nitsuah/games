import * as THREE from 'three';

const ExplosiveShotHandler = ({
  camera,
  scene,
  setShowLaser,
  playSound,
  onHit,
  onMiss,
  targets,
  setTargets,
  explosionRadius = 50, // Radius of the explosion sphere
  maxRange = 500, // Maximum range of the explosive shot
  triggerExplosion, // Callback to trigger an explosion
}) => {
  const from = camera.position.clone();
  const forwardDirection = new THREE.Vector3();
  camera.getWorldDirection(forwardDirection);

  // Perform a raycast to detect collisions along the path
  const raycaster = new THREE.Raycaster(from, forwardDirection);
  const intersects = raycaster.intersectObjects(scene.children, true);
  let impactPoint;

  if (intersects.length > 0 && intersects[0]?.distance <= maxRange) {
    // If a collision occurs within the max range, use the collision point
    impactPoint = intersects[0].point.clone();
  } else {
    // If no collision occurs, calculate the max range point
    impactPoint = from.clone().add(forwardDirection.multiplyScalar(maxRange));
  }

  // Visual feedback for the explosive shot
  setShowLaser([{ from, to: impactPoint }]); // Show the laser leading to the impact point
  setTimeout(() => setShowLaser(null), 500); // Remove laser after 0.5 seconds

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
