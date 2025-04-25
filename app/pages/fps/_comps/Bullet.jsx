import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import * as THREE from "three";

const Bullet = ({ start, end, onComplete }) => {
  const direction = new THREE.Vector3().subVectors(end, start).normalize();
  const speed = 150; // Increased bullet speed
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      onComplete(); // Trigger onComplete to remove the bullet
    }, 5000); // Destroy after 5 seconds

    return () => clearTimeout(timeout); // Cleanup timeout
  }, [onComplete]);

  useFrame(() => {
    if (traveled.current >= 400) {
      onComplete(); // Remove the bullet if it travels too far
    }
    traveled.current += speed * 0.1; // Adjust travel tracking for increased speed
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 1, 1]} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
};

export default Bullet;
