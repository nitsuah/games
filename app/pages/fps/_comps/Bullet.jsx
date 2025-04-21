import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import * as THREE from "three";

const Bullet = ({ start, end, onComplete }) => {
  const direction = new THREE.Vector3().subVectors(end, start).normalize();
  const speed = 100; // Increased bullet speed
  const traveled = useRef(0);
  const scale = useRef(0.1); // Start with a small scale

  // Add physics to the bullet
  const [ref, api] = useSphere(() => ({
    mass: 10, // Increased mass for stronger impact
    position: start.toArray(),
    args: [0.1], // Sphere radius
    onCollide: () => onComplete(), // Trigger onComplete when a collision occurs
  }));

  useEffect(() => {
    // Apply initial velocity in the direction of the target
    api.velocity.set(
      direction.x * speed,
      direction.y * speed,
      direction.z * speed
    );
  }, [api, direction, speed]);

  useFrame(() => {
    if (traveled.current >= 1500) {
      onComplete(); // Remove the bullet if it travels too far
    }
    traveled.current += speed * 0.1; // Adjust travel tracking for increased speed
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 5, 5]} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
};

export default Bullet;
