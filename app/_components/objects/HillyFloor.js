import React, { useMemo, forwardRef, useEffect, useState } from "react";
import * as THREE from "three";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";

// Simple value noise function (fallback)
function valueNoise(x, z, seed = 0) {
  const n = Math.sin(x * 12.9898 + z * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

// 2D Gaussian bell curve factor (centered at middle)
function bellCurve(x, z, width, depth, sigma = 0.35) {
  const cx = (width - 1) / 2;
  const cz = (depth - 1) / 2;
  const dx = (x - cx) / (width * sigma);
  const dz = (z - cz) / (depth * sigma);
  return Math.exp(-(dx * dx + dz * dz));
}

// Helper to clamp the gradient between neighbors
function smoothHeightmap(data, maxDelta = 1) {
  const height = data.length;
  const width = data[0].length;
  let changed = true;
  // Iterate until no changes (or max 5 passes)
  for (let pass = 0; pass < 5 && changed; pass++) {
    changed = false;
    for (let z = 0; z < height; z++) {
      for (let x = 0; x < width; x++) {
        const h = data[z][x];
        // Check neighbors
        [
          [0, -1], [0, 1], [-1, 0], [1, 0]
        ].forEach(([dz, dx]) => {
          const nz = z + dz, nx = x + dx;
          if (nz >= 0 && nz < height && nx >= 0 && nx < width) {
            const nh = data[nz][nx];
            const delta = h - nh;
            if (Math.abs(delta) > maxDelta) {
              // Clamp neighbor to within maxDelta
              data[nz][nx] = h - Math.sign(delta) * maxDelta;
              changed = true;
            }
          }
        });
      }
    }
  }
  return data;
}

const HillyFloor = forwardRef(
  (
    {
      width = 100,
      depth = 100,
      hillHeight = 6, // Increased default
      color = "green",
      heightmapUrl = null, // New prop for EXR heightmap
      maxGradient = 1,     // New prop for max gradient between neighbors
    },
    ref
  ) => {
    const [heightData, setHeightData] = useState(null);

    useEffect(() => {
      if (!heightmapUrl) {
        setHeightData(null);
        return;
      }
      const loader = new EXRLoader();
      loader.load(heightmapUrl, (texture) => {
        const { width: imgW, height: imgH, data } = texture.image;
        // Find min/max for normalization
        let min = Infinity, max = -Infinity;
        for (let i = 0; i < data.length; i += 4) {
          const h = data[i];
          if (h < min) min = h;
          if (h > max) max = h;
        }
        // Normalize and store as 2D array
        const arr = [];
        for (let z = 0; z < depth; z++) {
          const row = [];
          for (let x = 0; x < width; x++) {
            const ix = Math.floor((x / (width - 1)) * (imgW - 1));
            const iz = Math.floor((z / (depth - 1)) * (imgH - 1));
            const idx = (iz * imgW + ix) * 4;
            let h = data[idx];
            // Normalize to 0..1
            h = (h - min) / (max - min || 1);
            row.push(h * hillHeight);
          }
          arr.push(row);
        }
        // Smooth the heightmap to enforce max gradient
        setHeightData(smoothHeightmap(arr, maxGradient));
      });
    }, [heightmapUrl, width, depth, hillHeight, maxGradient]);

    // Compute min/max for color mapping
    const [minMax, setMinMax] = useState([0, 1]);
    useEffect(() => {
      if (heightData) {
        let min = Infinity, max = -Infinity;
        for (let z = 0; z < heightData.length; z++) {
          for (let x = 0; x < heightData[z].length; x++) {
            const h = heightData[z][x];
            if (h < min) min = h;
            if (h > max) max = h;
          }
        }
        setMinMax([min, max]);
      }
    }, [heightData]);

    const computedHeightData = useMemo(() => {
      if (heightData) {
        // Apply bell curve to EXR heightmap
        const arr = [];
        for (let z = 0; z < depth; z++) {
          const row = [];
          for (let x = 0; x < width; x++) {
            row.push(heightData[z][x] * bellCurve(x, z, width, depth));
          }
          arr.push(row);
        }
        return arr;
      }
      // Fallback: procedural noise, normalized and bell curved
      let min = Infinity, max = -Infinity;
      const data = [];
      for (let z = 0; z < depth; z++) {
        const row = [];
        for (let x = 0; x < width; x++) {
          const noiseVal = valueNoise(x * 0.1, z * 0.1);
          const baseHeight = (noiseVal * 2 - 1) * 0.5 + 0.5; // Normalize to 0..1
          const bell = bellCurve(x, z, width, depth);
          const height = baseHeight * bell * hillHeight;
          row.push(height);
          if (height < min) min = height;
          if (height > max) max = height;
        }
        data.push(row);
      }
      // Scale and smooth
      for (let z = 0; z < depth; z++) {
        for (let x = 0; x < width; x++) {
          data[z][x] = ((data[z][x] - min) / (max - min || 1)) * hillHeight;
        }
      }
      return smoothHeightmap(data, maxGradient);
    }, [heightData, width, depth, hillHeight, maxGradient]);

    const geometry = useMemo(() => {
      const geometry = new THREE.PlaneGeometry(width, depth, width - 1, depth - 1);
      const vertices = geometry.attributes.position.array;
      const colors = [];
      // Use min/max from computedHeightData for color mapping
      let min = Infinity, max = -Infinity;
      for (let z = 0; z < computedHeightData.length; z++) {
        for (let x = 0; x < computedHeightData[z].length; x++) {
          const h = computedHeightData[z][x];
          if (h < min) min = h;
          if (h > max) max = h;
        }
      }
      for (let i = 0, j = 0; i < vertices.length; i += 3, j++) {
        const z = Math.floor(j / width);
        const x = j % width;
        const h = computedHeightData[z][x];
        vertices[i + 2] = h;
        // Map height to t in [0,1]
        const t = (h - min) / (max - min || 1);
        // Interpolate from dark green (low) to yellow-green (high)
        const color = new THREE.Color();
        color.setRGB(
          0.1 + 0.5 * t, // R: more yellow at high
          0.4 + 0.5 * t, // G: brighter at high
          0.1 + 0.2 * (1 - t) // B: less blue at high
        );
        colors.push(color.r, color.g, color.b);
      }
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      geometry.computeVertexNormals();
      return geometry;
    }, [width, depth, computedHeightData]);

    return (
      <mesh ref={ref} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial vertexColors={true} />
      </mesh>
    );
  }
);

export default HillyFloor;
