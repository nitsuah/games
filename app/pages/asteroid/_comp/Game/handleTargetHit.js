import { now } from '@/utils/time';
import { splitTarget } from '../Target/splitTarget';
import { MIN_ALIVE_TIME } from '../config';

export const handleTargetHit = ({
  targetId,
  cooldowns,
  weapon,
  ammo,
  setTargets,
  setHits,
  onHit,
  targetRefs,
  setCombo,
  setComboMultiplier,
  comboTimerRef,
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
          // Use the shared splitTarget utility, but override x/y/z with current position
          const fragments = splitTarget(
            { ...target, x: currentX, y: currentY, z: currentZ },
            now
          );
          newTargets.push(...fragments);
        }

        updatedTargets.push({ ...target, isHit: true });
      } else {
        updatedTargets.push(target);
      }
    });

    return [...updatedTargets, ...newTargets];
  });

  setHits((prevHits) => prevHits + 1);

  // Combo logic
  setCombo((prevCombo) => {
    const newCombo = prevCombo + 1;
    // Calculate multiplier based on combo
    if (newCombo >= 10) {
      setComboMultiplier(3);
    } else if (newCombo >= 5) {
      setComboMultiplier(2);
    } else if (newCombo >= 2) {
      setComboMultiplier(1.5);
    } else {
      setComboMultiplier(1);
    }
    return newCombo;
  });

  // Reset combo timer
  if (comboTimerRef.current) {
    clearTimeout(comboTimerRef.current);
  }
  comboTimerRef.current = setTimeout(() => {
    setCombo(0);
    setComboMultiplier(1);
  }, 3000); // 3 seconds to maintain combo

  if (onHit) onHit();
};
