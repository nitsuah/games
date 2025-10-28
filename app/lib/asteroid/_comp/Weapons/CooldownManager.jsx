import { useEffect } from 'react';

const CooldownManager = ({ _cooldowns, setCooldowns, rapidFireActive }) => {
  useEffect(() => {
    const updateCooldowns = () => {
      setCooldowns((prev) => {
        const updatedCooldowns = { ...prev };
        let hasChanged = false;

        Object.keys(updatedCooldowns).forEach((key) => {
          if (updatedCooldowns[key] > 0) {
            const reduction = rapidFireActive ? updatedCooldowns[key] * 0.99 : 1 / 60;
            updatedCooldowns[key] = Math.max(0, updatedCooldowns[key] - reduction);
            hasChanged = true;
          }
        });

        if (hasChanged) {
          // keep a lightweight debug log in case cooldowns behave unexpectedly
          // console.debug('Updated Cooldowns:', updatedCooldowns);
        }

        return hasChanged ? updatedCooldowns : prev;
      });
    };

    const interval = setInterval(updateCooldowns, 1000 / 60);
    return () => clearInterval(interval);
  }, [setCooldowns, rapidFireActive]);

  return null;
};

export default CooldownManager;
