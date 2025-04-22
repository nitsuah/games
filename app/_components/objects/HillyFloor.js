import React, { useMemo } from "react";
import { useHeightfield } from "@react-three/cannon";
import * as THREE from "three";

const HillyFloor = ({ width = 100, depth = 100, hillHeight = 5, color = "green" }) => {
  // Generate height data for hills
  const heightData = useMemo(() => {
    const data = [];
    for (let z = 0; z < depth; z++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        const height = Math.sin(x * 0.1) * Math.cos(z * 0.1) * hillHeight; // Generate hills
        row.push(height);
      }
      data.push(row);
    }
    return data;
  }, [width, depth, hillHeight]);

  // Add physics to the hilly floor
  const [ref] = useHeightfield(() => ({
    args: [heightData, { elementSize: 1 }], // Heightfield dimensions
    position: [-(width / 2), 0, -(depth / 2)], // Center the floor
    rotation: [-Math.PI / 2, 0, 0], // Rotate to make it horizontal
    type: "Static", // Ensure it acts as a static floor
  }));

  // Create geometry for the hilly floor
  const geometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(width, depth, width - 1, depth - 1);
    const vertices = geometry.attributes.position.array;
    for (let i = 0, j = 0; i < vertices.length; i += 3, j++) {
      vertices[i + 2] = heightData[Math.floor(j / width)][j % width]; // Set height
    }
    geometry.computeVertexNormals();
    return geometry;
  }, [width, depth, heightData]);

  return (
    <>
      {/* Physics representation */}
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="transparent" opacity={0} />
      </mesh>
      {/* Visual representation */}
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
        <meshStandardMaterial color={color} />
      </mesh>
    </>
  );
};

export default HillyFloor;
