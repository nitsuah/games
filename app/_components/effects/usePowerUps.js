import { useState, useCallback, useRef, useEffect } from 'react';
import { POWER_UPS } from './powerUpConfig';

export default function usePowerUps(setHealth, setTargets, showFlash = () => {}, setAmmo = () => {}) {
  const [shieldActive, setShieldActive] = useState(false);
  const [rapidFireActive, setRapidFireActive] = useState(false);
  const [slowMotionActive, setSlowMotionActive] = useState(false);
  const [invincibilityActive, setInvincibilityActive] = useState(false);
  const [speedBoostActive, setSpeedBoostActive] = useState(false);
  
  // Track cleanup functions for timeouts
  const cleanupFunctionsRef = useRef([]);
  
  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
    };
  }, []);

  const handlePowerUpCollect = useCallback(
    (type) => {
      const powerUp = POWER_UPS.find((p) => p.type === type);
      if (!powerUp) return;
      
      const cleanup = powerUp.effect({
        setHealth,
        setTargets,
        showFlash,
        setShieldActive,
        setRapidFireActive,
        setSlowMotionActive,
        setInvincibilityActive,
        setSpeedBoostActive,
        setAmmo,
      });
      
      // Store cleanup function if returned
      if (cleanup && typeof cleanup === 'function') {
        cleanupFunctionsRef.current.push(cleanup);
      }
    },
    [setHealth, setTargets, showFlash, setAmmo]
  );

  return {
    shieldActive,
    setShieldActive,
    rapidFireActive,
    setRapidFireActive,
    slowMotionActive,
    setSlowMotionActive,
    invincibilityActive,
    setInvincibilityActive,
    speedBoostActive,
    setSpeedBoostActive,
    handlePowerUpCollect,
  };
}
