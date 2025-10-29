import React from 'react';
import { render } from '@testing-library/react';

// Mock @react-three/fiber hooks used by LaserBeam
jest.mock('@react-three/fiber', () => {
  return {
    useFrame: (_cb) => {
      // register a no-op frame callback; tests won't call it explicitly
    },
    useThree: () => ({ camera: { position: { x: 0, y: 0, z: 0 }, quaternion: {} } }),
    useLoader: (loader, inputs) => {
      // return fake textures; if an array is requested, return an array
      if (Array.isArray(inputs)) return inputs.map(() => ({}));
      return {};
    },
  };
});

import LaserBeam from '@/lib/asteroid/_comp/Weapons/LaserBeam';
import * as THREE from 'three';

describe('LaserBeam', () => {
  const makeVec = (x, y, z) => new THREE.Vector3(x, y, z);

  const sampleLaser = {
    from: makeVec(0, 0, 0),
    to: makeVec(0, 10, 0),
    speed: 2,
  };

  test('does not render sprite trails when trailQuality is off', () => {
    const { container } = render(<LaserBeam lasers={[sampleLaser]} weaponType="laser" trailQuality="off" />);
    // react-three primitives render as custom tags like <sprite/>, so inspect innerHTML
    expect(container.innerHTML.includes('<sprite')).toBe(false);
  });

  test('renders sprite trails for low and high quality', () => {
    const low = render(<LaserBeam lasers={[sampleLaser]} weaponType="laser" trailQuality="low" />);
    const high = render(<LaserBeam lasers={[sampleLaser]} weaponType="laser" trailQuality="high" />);

    expect(low.container.innerHTML.includes('<sprite')).toBe(true);
    expect(high.container.innerHTML.includes('<sprite')).toBe(true);
    // high should have at least as many sprite occurrences as low
    const lowCount = (low.container.innerHTML.match(/<sprite/g) || []).length;
    const highCount = (high.container.innerHTML.match(/<sprite/g) || []).length;
    expect(highCount).toBeGreaterThanOrEqual(lowCount);
  });
});
