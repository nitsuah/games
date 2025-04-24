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

  const to = intersects[0]?.point || from.clone().add(forwardDirection.multiplyScalar(100));

  if (typeof setShowLaser === 'function') {
    setShowLaser([{ from, to }]);
    setTimeout(() => setShowLaser(null), 200);
  } else {
    console.error('setShowLaser is not a function or is undefined.');
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
};

export default LaserShotHandler;
