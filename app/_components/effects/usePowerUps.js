import { useState, useCallback } from 'react';
import { POWER_UPS } from './powerUpConfig';

export default function usePowerUps(setHealth, setTargets, showFlash = () => {}) {
  const [shieldActive, setShieldActive] = useState(false);
  const [rapidFireActive, setRapidFireActive] = useState(false);
  const [slowMotionActive, setSlowMotionActive] = useState(false);
  const [invincibilityActive, setInvincibilityActive] = useState(false);
  const [speedBoostActive, setSpeedBoostActive] = useState(false);

  const handlePowerUpCollect = useCallback((type) => {
    const powerUp = POWER_UPS.find((p) => p.type === type);
    if (!powerUp) return;
    powerUp.effect({
      setHealth,
      setTargets,
      showFlash,
      setShieldActive,
      setRapidFireActive,
      setSlowMotionActive,
      setInvincibilityActive,
      setSpeedBoostActive,
    });
  }, [setHealth, setTargets, showFlash]);

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
