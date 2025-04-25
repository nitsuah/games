import { useState, useCallback } from 'react';

export default function usePowerUps(setHealth, setTargets, showFlash = () => {}) {
  const [shieldActive, setShieldActive] = useState(false);
  const [rapidFireActive, setRapidFireActive] = useState(false);
  const [slowMotionActive, setSlowMotionActive] = useState(false);
  const [invincibilityActive, setInvincibilityActive] = useState(false);
  const [speedBoostActive, setSpeedBoostActive] = useState(false);

  const handlePowerUpCollect = useCallback((type) => {
    switch (type) {
      case 'health':
        setHealth((prevHealth) => Math.min(prevHealth + 25, 100));
        showFlash('green');
        break;
      case 'speedBoost':
        setSpeedBoostActive(true);
        showFlash('orange', 100);
        setTimeout(() => {
          setSpeedBoostActive(false);
          showFlash('orange', 0);
        }, 10000);
        break;
      case 'shield':
        setShieldActive(true);
        showFlash('blue');
        break;
      case 'invincibility':
        setInvincibilityActive(true);
        showFlash('yellow', 100);
        setTimeout(() => {
          setInvincibilityActive(false);
          showFlash('yellow', 0);
        }, 10000);
        break;
      case 'rapidFire':
        setRapidFireActive(true);
        showFlash('red', 100);
        setTimeout(() => {
          setRapidFireActive(false);
          showFlash('red', 0);
        }, 10000);
        break;
      case 'slowMotion':
        setSlowMotionActive(true);
        setTargets((prevTargets) =>
          prevTargets.map((target) => ({
            ...target,
            speed: target.speed * 0.5,
          }))
        );
        setTimeout(() => {
          setSlowMotionActive(false);
          setTargets((prevTargets) =>
            prevTargets.map((target) => ({
              ...target,
              speed: target.speed * 2,
            }))
          );
        }, 10000);
        break;
      default:
        break;
    }
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
