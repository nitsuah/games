import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { splitTarget } from '@/lib/asteroid/_comp/Target/splitTarget';
import { PLAYER_SPHERE_RADIUS } from '@/lib/asteroid/_comp/config';

const CollisionDetection = ({ setTargets, onPlayerHit, isGameOver }) => {
  const { camera } = useThree();

  useFrame(() => {
    if (isGameOver) return;

    const playerSphere = new THREE.Sphere(camera.position.clone(), PLAYER_SPHERE_RADIUS);

    setTargets((prevTargets) => {
      let hasChanged = false;

      const updatedTargets = prevTargets.reduce((acc, target) => {
        if (!target.isHit) {
          const targetSphere = new THREE.Sphere(
            new THREE.Vector3(target.x, target.y, target.z),
            target.size / 2
          );

          if (playerSphere.intersectsSphere(targetSphere)) {
            onPlayerHit(target.size);
            if (target.size > 1) {
              acc.push(...splitTarget(target));
            }
            hasChanged = true;
            return acc;
          }
        }
        acc.push(target);
        return acc;
      }, []);
      return hasChanged ? updatedTargets : prevTargets;
    });
  });

  return null;
};

export default CollisionDetection;
