import { now } from '@/utils/time';
import { splitTarget } from '../Target/splitTarget';
import { MIN_ALIVE_TIME } from '../config';
import soundManager from '@/utils/audio/SoundManager';

export const handleTargetHit = ({
  targetId,
  cooldowns,
  weapon,
  ammo,
  setTargets,
  setHits,
  setScore,
  onHit,
  targetRefs,
  setCombo,
  setComboMultiplier,
  comboTimerRef,
  setScorePopups,
}) => {
  if (cooldowns[weapon] > 0 || ammo[weapon] <= 0) {
    return;
  }

  let pointsEarned = 0;

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

        // Base points per hit
        pointsEarned = 100;

        // Play hit impact sound with pitch based on target size
        // Larger targets = lower pitch (0.7), smaller = higher pitch (up to 2.0)
        const pitchVariation = Math.max(0.7, Math.min(2.0, 10 / target.size));
        const intensity = Math.min(1.5, target.size / 5); // Larger targets = louder impact
        soundManager.playHitImpact(intensity, pitchVariation);

        if (target.size > 1) {
          // Use the shared splitTarget utility, but override x/y/z with current position
          const fragments = splitTarget({ ...target, x: currentX, y: currentY, z: currentZ }, now);
          newTargets.push(...fragments);
        }

        updatedTargets.push({ ...target, isHit: true });
        
        // Create score popup at target position (will be calculated with multiplier below)
        if (setScorePopups) {
          const popupId = `popup-${targetId}-${Date.now()}`;
          setScorePopups((prev) => [
            ...prev,
            {
              id: popupId,
              position: [currentX, currentY, currentZ],
              score: pointsEarned, // Will be updated with multiplier after calculation
            },
          ]);
          
          // Remove popup after duration
          setTimeout(() => {
            setScorePopups((prev) => prev.filter((p) => p.id !== popupId));
          }, 1000);
        }
      } else {
        updatedTargets.push(target);
      }
    });

    return [...updatedTargets, ...newTargets];
  });

  setHits((prevHits) => prevHits + 1);

  // Combo logic
  let multiplier = 1;
  setCombo((prevCombo) => {
    const newCombo = prevCombo + 1;
    // Calculate multiplier based on combo
    if (newCombo >= 10) {
      setComboMultiplier(3);
      multiplier = 3;
    } else if (newCombo >= 5) {
      setComboMultiplier(2);
      multiplier = 2;
    } else if (newCombo >= 2) {
      setComboMultiplier(1.5);
      multiplier = 1.5;
    } else {
      setComboMultiplier(1);
      multiplier = 1;
    }
    return newCombo;
  });

  // Add score incrementally with multiplier
  const finalScore = Math.round(pointsEarned * multiplier);
  if (pointsEarned > 0) {
    setScore((prevScore) => prevScore + finalScore);
    
    // Update score popup with final multiplied score
    if (setScorePopups) {
      setScorePopups((prev) => 
        prev.map((p) => 
          p.score === pointsEarned ? { ...p, score: finalScore } : p
        )
      );
    }
  }

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
