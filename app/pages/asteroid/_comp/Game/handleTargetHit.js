import { now } from '@/utils/time';

const MIN_ALIVE_TIME = 0.5;

export const handleTargetHit = ({
  targetId,
  cooldowns,
  weapon,
  ammo,
  setTargets,
  setHits,
  onHit,
  targetRefs,
}) => {
  if (cooldowns[weapon] > 0 || ammo[weapon] <= 0) {
    return;
  }
  setTargets((prevTargets) => {
    let updatedTargets = [];
    let newTargets = [];
    prevTargets.forEach((target) => {
      if (
        target.id === targetId &&
        !target.isHit &&
        now() - (target.spawnTime || 0) > MIN_ALIVE_TIME
      ) {
        const meshRef = targetRefs.current[targetId];
        const currentX = meshRef?.current?.position.x || target.x;
        const currentY = meshRef?.current?.position.y || target.y;
        const currentZ = meshRef?.current?.position.z || target.z;

        if (target.size > 1) {
          const newSize = target.size * 0.5;
          const newSpeed = target.speed * 2;
          const newColor =
            newSize > 4
              ? '#0000ff'
              : newSize > 3
              ? '#800080'
              : newSize > 2
              ? '#ff4500'
              : newSize > 1
              ? '#00ffff'
              : '#ffff00';

          const offsetRange = 1.0;
          const spawnTime = now();
          newTargets.push(
            {
              id: `${target.id}-1`,
              x: currentX + Math.random() * offsetRange - offsetRange / 2,
              y: currentY + Math.random() * offsetRange - offsetRange / 2,
              z: currentZ + Math.random() * offsetRange - offsetRange / 2,
              isHit: false,
              size: newSize,
              speed: newSpeed,
              color: newColor,
              spawnTime,
            },
            {
              id: `${target.id}-2`,
              x: currentX + Math.random() * offsetRange - offsetRange / 2,
              y: currentY + Math.random() * offsetRange - offsetRange / 2,
              z: currentZ + Math.random() * offsetRange - offsetRange / 2,
              isHit: false,
              size: newSize,
              speed: newSpeed,
              color: newColor,
              spawnTime,
            }
          );
        }
      } else {
        updatedTargets.push(target);
      }
    });
    return [...updatedTargets, ...newTargets];
  });

  setHits((prevHits) => prevHits + 1);

  if (onHit) onHit();
};
