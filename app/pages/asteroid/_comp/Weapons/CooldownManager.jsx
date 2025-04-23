import React, { useEffect } from 'react';

const CooldownManager = ({ cooldowns, setCooldowns, rapidFireActive }) => {
  useEffect(() => {
    const updateCooldowns = () => {
      setCooldowns((prev) => {
        const updatedCooldowns = { ...prev };
        let hasChanged = false;

        Object.keys(updatedCooldowns).forEach((key) => {
          if (updatedCooldowns[key] > 0) {
            const reduction = rapidFireActive ? 2 / 60 : 1 / 60; // Halve cooldown reduction if rapid fire is active
            updatedCooldowns[key] = Math.max(0, updatedCooldowns[key] - reduction);
            hasChanged = true;
          }
        });

        if (hasChanged) {
          console.log('Updated Cooldowns:', updatedCooldowns); // Log cooldowns for debugging
        }

        return hasChanged ? updatedCooldowns : prev; // Only update state if cooldowns have changed
      });
    };

    const interval = setInterval(updateCooldowns, 1000 / 60); // Run at 60 FPS
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [setCooldowns, rapidFireActive]);

  return null;
};

export default CooldownManager;
