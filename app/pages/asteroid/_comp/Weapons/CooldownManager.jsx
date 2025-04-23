import { useEffect } from 'react';

const CooldownManager = ({ cooldowns, setCooldowns }) => {
  useEffect(() => {
    const updateCooldowns = () => {
      setCooldowns((prev) => {
        const updatedCooldowns = { ...prev };
        Object.keys(updatedCooldowns).forEach((key) => {
          if (updatedCooldowns[key] > 0) {
            updatedCooldowns[key] = Math.max(0, updatedCooldowns[key] - 1 / 60); // Decrease cooldown by 1 frame (assuming 60 FPS)
          }
        });
        return updatedCooldowns;
      });
    };

    const interval = setInterval(updateCooldowns, 1000 / 60); // Run at 60 FPS
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [setCooldowns]);

  return null;
};

export default CooldownManager;
