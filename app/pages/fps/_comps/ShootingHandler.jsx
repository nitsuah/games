import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const ShootingHandler = ({ playerPosition, setBullets, setExplosions, setDecals }) => {
  const { camera, scene } = useThree();

  const handleShoot = () => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x: 0, y: 0 }, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const target = intersects[0];
      const start = camera.position.clone();
      const end = target.point;

      // Add bullet
      const bulletId = Date.now();
      setBullets((prev) => [
        ...prev,
        {
          id: bulletId,
          start,
          end,
          onComplete: () => {
            // Add explosion after the bullet disappears
            setExplosions((prev) => [
              ...prev,
              { id: Date.now(), position: end, onComplete: () => {
                setExplosions((prevExplosions) =>
                  prevExplosions.filter((e) => e.id !== bulletId)
                );
              }},
            ]);

            // Add decal after the explosion
            setDecals((prev) => [
              ...prev,
              { id: Date.now(), position: end, normal: target.face.normal },
            ]);

            // Remove the bullet
            setBullets((prevBullets) => prevBullets.filter((b) => b.id !== bulletId));
          },
        },
      ]);
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleShoot);
    return () => window.removeEventListener("click", handleShoot);
  }, [camera, scene, setBullets, setExplosions, setDecals]);

  return null;
};

export default ShootingHandler;
