import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

const Cube = ({ position, color = "blue", size = 1 }) => {
  const cubeRef = useRef();
  const [shattered, setShattered] = useState(false);
  const [planePositionArray, setPlanePositionArray] = useState([]);

  // Create planes for the cube
  const createCubePlanes = () => {
    const group = new THREE.Group();
    const boxSegment = 6; // Number of segments per face
    const planeSize = size / boxSegment;

    const positions = []; // Store original positions for reforming

    for (let i = 0; i < 6; i++) {
      const planeGroup = new THREE.Group();

      for (let j = 0; j < boxSegment; j++) {
        for (let k = 0; k < boxSegment; k++) {
          const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
          const planeMaterial = new THREE.MeshStandardMaterial({
            color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1,
          });
          const plane = new THREE.Mesh(planeGeometry, planeMaterial);

          plane.position.x = (j - boxSegment / 2 + 0.5) * planeSize;
          plane.position.y = (k - boxSegment / 2 + 0.5) * planeSize;

          planeGroup.add(plane);
          positions.push({ x: plane.position.x, y: plane.position.y, z: plane.position.z });
        }
      }

      switch (i) {
        case 0: planeGroup.position.y = size / 2; planeGroup.rotation.x = -Math.PI / 2; break; // Top
        case 1: planeGroup.position.y = -size / 2; planeGroup.rotation.x = Math.PI / 2; break; // Bottom
        case 2: planeGroup.position.z = size / 2; break; // Front
        case 3: planeGroup.position.z = -size / 2; planeGroup.rotation.y = Math.PI; break; // Back
        case 4: planeGroup.position.x = -size / 2; planeGroup.rotation.y = -Math.PI / 2; break; // Left
        case 5: planeGroup.position.x = size / 2; planeGroup.rotation.y = Math.PI / 2; break; // Right
      }

      group.add(planeGroup);
    }

    setPlanePositionArray(positions);
    return group;
  };

  // Shatter the cube
  const shatterCube = () => {
    if (shattered || !cubeRef.current) return;

    setShattered(true);
    cubeRef.current.children.forEach((planeGroup) => {
      planeGroup.children.forEach((plane) => {
        const x = gsap.utils.random(-5, 5);
        const y = gsap.utils.random(-5, 5);
        const z = gsap.utils.random(-5, 5);

        gsap.to(plane.position, { x, y, z, duration: 1, ease: "power1.in" });
        gsap.to(plane.rotation, {
          x: gsap.utils.random(-Math.PI, Math.PI),
          y: gsap.utils.random(-Math.PI, Math.PI),
          z: gsap.utils.random(-Math.PI, Math.PI),
          duration: 1,
          ease: "power1.in",
        });
        gsap.to(plane.material, { opacity: 0, duration: 1, ease: "power1.in" });
      });
    });

    // Reform the cube after a delay
    setTimeout(() => reformCube(), 1000);
  };

  // Reform the cube
  const reformCube = () => {
    if (!cubeRef.current) return;

    cubeRef.current.children.forEach((planeGroup, groupIndex) => {
      planeGroup.children.forEach((plane, planeIndex) => {
        const originalPosition = planePositionArray[groupIndex * 36 + planeIndex]; // 36 planes per face
        gsap.to(plane.position, {
          x: originalPosition.x,
          y: originalPosition.y,
          z: originalPosition.z,
          duration: 1,
          ease: "power1.out",
        });
        gsap.to(plane.rotation, { x: 0, y: 0, z: 0, duration: 1, ease: "power1.out" });
        gsap.to(plane.material, { opacity: 1, duration: 1, ease: "power1.out" });
      });
    });

    setShattered(false);
  };

  return (
    <group
      ref={cubeRef}
      position={position}
      onClick={shatterCube} // Trigger shatter on click
    >
      {createCubePlanes()}
    </group>
  );
};

export default Cube;
