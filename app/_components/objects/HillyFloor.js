import { useMemo, forwardRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';

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
          [0, -1],
          [0, 1],
          [-1, 0],
          [1, 0],
        ].forEach(([dz, dx]) => {
          const nz = z + dz,
            nx = x + dx;
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
      _color = 'green',
      heightmapUrl = null, // New prop for EXR heightmap
      maxGradient = 1, // New prop for max gradient between neighbors
    },
    ref
  ) => {
    const [heightData, setHeightData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      if (!heightmapUrl) {
        setHeightData(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const loader = new EXRLoader();
      loader.load(
        heightmapUrl,
        (texture) => {
          const { width: imgW, height: imgH, data } = texture.image;
          // Find min/max for normalization
          let min = Infinity,
            max = -Infinity;
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
          setIsLoading(false);
        },
        undefined,
        (error) => {
          console.error('An error occurred loading the EXR heightmap:', error);
          setIsLoading(false);
        }
      );
    }, [heightmapUrl, width, depth, hillHeight, maxGradient]);

    // Compute min/max for color mapping (tracked but not used directly)
    const [_minMax, setMinMax] = useState([0, 1]);
    useEffect(() => {
      if (heightData) {
        let min = Infinity,
          max = -Infinity;
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
      if (isLoading || !heightData) { // Added isLoading check
        return null;
      }
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
    }, [heightData, width, depth, hillHeight, maxGradient, isLoading]);

    const geometry = useMemo(() => {
      if (!computedHeightData) { // Also depend on computedHeightData
        return null;
      }
      // Use min/max from computedHeightData for color mapping
      let min = Infinity,
        max = -Infinity;
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
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.computeVertexNormals();
      return geometry;
    }, [width, depth, computedHeightData]);

    if (isLoading || !computedHeightData) {
      return null; // Or render a loading indicator / placeholder
    }

    return (
      <mesh ref={ref} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial vertexColors={true} />
      </mesh>
    );
  }
);

export default HillyFloor;
