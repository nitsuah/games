export const POWER_UPS = [
  {
    type: 'health',
    duration: 0,
    effect: ({ setHealth, showFlash }) => {
      setHealth((prev) => Math.min(prev + 25, 100));
      showFlash('green');
    },
  },
  {
    type: 'speedBoost',
    duration: 10000,
    effect: ({ setSpeedBoostActive, showFlash }) => {
      setSpeedBoostActive(true);
      showFlash('orange', 100);
      setTimeout(() => {
        setSpeedBoostActive(false);
        showFlash('orange', 0);
      }, 10000);
    },
  },
  {
    type: 'shield',
    duration: 0,
    effect: ({ setShieldActive, showFlash }) => {
      setShieldActive(true);
      showFlash('blue');
    },
  },
  {
    type: 'invincibility',
    duration: 10000,
    effect: ({ setInvincibilityActive, showFlash }) => {
      setInvincibilityActive(true);
      showFlash('yellow', 100);
      setTimeout(() => {
        setInvincibilityActive(false);
        showFlash('yellow', 0);
      }, 10000);
    },
  },
  {
    type: 'rapidFire',
    duration: 10000,
    effect: ({ setRapidFireActive, showFlash }) => {
      setRapidFireActive(true);
      showFlash('red', 100);
      setTimeout(() => {
        setRapidFireActive(false);
        showFlash('red', 0);
      }, 10000);
    },
  },
  {
    type: 'slowMotion',
    duration: 10000,
    effect: ({ setSlowMotionActive, setTargets }) => {
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
    },
  },
];
