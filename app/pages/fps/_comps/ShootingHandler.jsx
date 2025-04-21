import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const ShootingHandler = ({ playerPosition, setBullets, setExplosions, setDecals }) => {
  const { camera, scene } = useThree(); // Access camera and scene from useThree

  const handleShoot = () => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x: 0, y: 0 }, camera); // Use camera from useThree
    const intersects = raycaster.intersectObjects(scene.children, true); // Use scene from useThree

    if (intersects.length > 0) {
      const target = intersects[0];
      const start = new THREE.Vector3(...playerPosition);
      const end = target.point;

      // Add bullet
      setBullets((prev) => [
        ...prev,
        { id: Date.now(), start, end },
      ]);

      // Add explosion
      setExplosions((prev) => [
        ...prev,
        { id: Date.now(), position: end },
      ]);

      // Add decal (ensure target.face exists)
      if (target.face) {
        setDecals((prev) => [
          ...prev,
          { id: Date.now(), position: end, normal: target.face.normal },
        ]);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleShoot);
    return () => window.removeEventListener("click", handleShoot);
  }, [camera, scene, playerPosition]);

  return null; // This component doesn't render anything
};

export default ShootingHandler;
