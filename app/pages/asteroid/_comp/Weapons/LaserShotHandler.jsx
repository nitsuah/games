import * as THREE from 'three';

const LaserShotHandler = ({
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

export default LaserShotHandler;
