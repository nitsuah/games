import React, { useMemo, forwardRef } from "react";
import * as THREE from "three";

const HillyFloor = forwardRef(({ width = 100, depth = 100, hillHeight = 5, color = "green" }, ref) => {
  const heightData = useMemo(() => {
    const data = [];
    for (let z = 0; z < depth; z++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        const height = Math.sin(x * 0.1) * Math.cos(z * 0.1) * hillHeight;
        row.push(height);
      }
      data.push(row);
    }
    return data;
  }, [width, depth, hillHeight]);

  const geometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(width, depth, width - 1, depth - 1);
    const vertices = geometry.attributes.position.array;
    for (let i = 0, j = 0; i < vertices.length; i += 3, j++) {
      vertices[i + 2] = heightData[Math.floor(j / width)][j % width];
    }
    geometry.computeVertexNormals();
    return geometry;
  }, [width, depth, heightData]);

  return (
    <mesh ref={ref} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color={color} />
    </mesh>
  );
});

export default HillyFloor;
