import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Target = ({ position, size = 1, color = "red", type = "default", onHit }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [hit, setHit] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(size);
  const [exploded, setExploded] = useState(false); // Track if the target has fully exploded

  // Safely handle rotation and other updates
  useFrame(() => {
    if (meshRef.current) {
      // Safely modify rotation using rotateY
      meshRef.current.rotation.y += 0.01;
    }
  });

  // Animate effects over time
  useFrame(() => {
    if (hit && !exploded) {
      switch (type) {
        case "explode":
          if (scale < 5) {
            setScale((prev) => prev + 0.1); // Gradually grow in size
            setOpacity((prev) => Math.max(prev - 0.02, 0)); // Gradually fade out
          } else {
            setExploded(true); // Mark as fully exploded
            setScale(0); // Reset scale to 0
          }
          break;
        case "shrink":
          if (scale > 0) {
            setScale((prev) => Math.max(prev - 0.1, 0)); // Gradually shrink
          }
          break;
        case "default":
          if (opacity > 0) {
            setOpacity((prev) => Math.max(prev - 0.02, 0)); // Gradually fade out
          }
          break;
        default:
          break;
      }
    }
  });

  // Handle collision detection
  const handleCollision = () => {
    if (!hit && onHit) {
      setHit(true); // Mark as hit
      onHit(); // Notify parent
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={[scale, scale, scale]}
      onClick={handleCollision} // Detect clicks as "hits"
      onPointerOver={() => setHovered(true)} // Handle hover
      onPointerOut={() => setHovered(false)} // Reset hover
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color={hovered ? "orange" : color} // Change color on hover
        transparent
        opacity={opacity}
      />
    </mesh>
  );
};

export default Target;
