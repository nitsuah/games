import { useState, useCallback } from 'react';

export default function usePowerUps(setHealth, setTargets) {
  const [shieldActive, setShieldActive] = useState(false);
  const [rapidFireActive, setRapidFireActive] = useState(false);
  const [slowMotionActive, setSlowMotionActive] = useState(false);
  const [invincibilityActive, setInvincibilityActive] = useState(false);
  const [speedBoostActive, setSpeedBoostActive] = useState(false);

  const [showRedFlash, setShowRedFlash] = useState(false);
  const [showGreenFlash, setShowGreenFlash] = useState(false);
  const [showBlueFlash, setShowBlueFlash] = useState(false);
  const [showYellowFlash, setShowYellowFlash] = useState(false);
  const [showPurpleFlash, setShowPurpleFlash] = useState(false);
  const [showOrangeFlash, setShowOrangeFlash] = useState(false);

  const handlePowerUpCollect = useCallback((type) => {
    switch (type) {
      case 'health':
        setHealth((prevHealth) => Math.min(prevHealth + 25, 100));
        setShowGreenFlash(true);
        setTimeout(() => setShowGreenFlash(false), 100);
        break;
      case 'speedBoost':
        setSpeedBoostActive(true);
        setShowOrangeFlash(true);
        setTimeout(() => {
          setSpeedBoostActive(false);
          setShowOrangeFlash(false);
        }, 10000);
        break;
      case 'shield':
        setShieldActive(true);
        setShowBlueFlash(true);
        break;
      case 'invincibility':
        setInvincibilityActive(true);
        setShowYellowFlash(true);
        setTimeout(() => {
          setInvincibilityActive(false);
          setShowYellowFlash(false);
        }, 10000);
        break;
      case 'rapidFire':
        setRapidFireActive(true);
        setShowRedFlash(true);
        setTimeout(() => {
          setRapidFireActive(false);
          setShowRedFlash(false);
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
  }, [setHealth, setTargets]);

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
    showRedFlash,
    setShowRedFlash,
    showGreenFlash,
    setShowGreenFlash,
    showBlueFlash,
    setShowBlueFlash,
    showYellowFlash,
    setShowYellowFlash,
    showPurpleFlash,
    setShowPurpleFlash,
    showOrangeFlash,
    setShowOrangeFlash,
    handlePowerUpCollect,
  };
}
