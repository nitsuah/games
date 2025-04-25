import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const ShootingHandler = ({ playerPosition, setBullets, setExplosions, setDecals, rapidFire }) => {
  const { camera, scene } = useThree();
  const lastBulletTimeRef = useRef(0); // Track the last bullet fired time
  const bulletCooldown = rapidFire ? 1500 : 3000; // Cooldown in milliseconds (1.5s for rapid fire, 3s otherwise)

  const fireBullet = (start, end) => {
    const bulletId = `${Date.now()}-${Math.random()}`; // Ensure unique ID
    setBullets((prev) => [
      ...prev,
      {
        id: bulletId,
        start,
        end,
        onComplete: () => {
          setBullets((prev) => prev.filter((b) => b.id !== bulletId));
        },
      },
    ]);
  };

  const handleShoot = () => {
    const now = Date.now();
    if (now - lastBulletTimeRef.current >= bulletCooldown) {
      lastBulletTimeRef.current = now; // Update last bullet fired time

      const raycaster = new THREE.Raycaster();
      raycaster.set(camera.position, camera.getWorldDirection(new THREE.Vector3())); // Cast ray from camera forward
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const target = intersects[0];
        const start = camera.position.clone();
        const end = target.point;

        if (rapidFire) {
          // Fire 3 bullets in quick succession
          fireBullet(start, end);
          setTimeout(() => fireBullet(start, end), 100); // 100ms delay
          setTimeout(() => fireBullet(start, end), 200); // 200ms delay
        } else {
          fireBullet(start, end);
        }
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        handleShoot(); // Fire bullet on spacebar press
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camera, scene, rapidFire]);

  return null;
};

export default ShootingHandler;
