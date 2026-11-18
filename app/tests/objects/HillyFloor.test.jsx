import React from 'react';
import { render } from '@testing-library/react';
import HillyFloor, { buildHillyGeometry } from '../../_components/objects/HillyFloor';

// Fake EXR texture: a 2x2 RGBA float image with increasing red-channel heights.
jest.mock('three/examples/jsm/loaders/EXRLoader', () => ({
  EXRLoader: jest.fn().mockImplementation(() => ({
    load: (_url, onLoad) => {
      onLoad({
        image: {
          width: 2,
          height: 2,
          data: new Float32Array([0, 0, 0, 1, 1, 0, 0, 1, 2, 0, 0, 1, 3, 0, 0, 1]),
        },
      });
    },
  })),
}));

describe('buildHillyGeometry', () => {
  const heights = [
    [0, 1, 2],
    [3, 4, 5],
  ];

  it('creates one vertex per height sample with the height on z', () => {
    const geometry = buildHillyGeometry(heights, 3, 2);
    const pos = geometry.attributes.position;
    expect(pos.count).toBe(6);
    const zs = [];
    for (let i = 0; i < pos.count; i++) zs.push(pos.getZ(i));
    expect(zs).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('adds a per-vertex color attribute running dark green to yellow-green', () => {
    const geometry = buildHillyGeometry(heights, 3, 2);
    const color = geometry.attributes.color;
    expect(color.count).toBe(6);
    expect(color.itemSize).toBe(3);
    // Lowest vertex: t = 0
    expect(color.getX(0)).toBeCloseTo(0.1);
    expect(color.getY(0)).toBeCloseTo(0.4);
    // Highest vertex: t = 1
    expect(color.getX(5)).toBeCloseTo(0.6);
    expect(color.getY(5)).toBeCloseTo(0.9);
    expect(geometry.attributes.normal).toBeDefined();
  });

  it('handles a flat heightmap without dividing by zero', () => {
    const geometry = buildHillyGeometry([[2, 2], [2, 2]], 2, 2);
    const color = geometry.attributes.color;
    for (let i = 0; i < color.count; i++) {
      expect(Number.isFinite(color.getX(i))).toBe(true);
    }
  });
});

describe('HillyFloor', () => {
  let errorSpy;
  beforeEach(() => {
    // react-dom warns about R3F intrinsic elements (<mesh>) it doesn't know.
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => errorSpy.mockRestore());

  it('renders nothing without a heightmap', () => {
    const { container } = render(<HillyFloor width={4} depth={4} />);
    expect(container.firstChild).toBeNull();
  });

  it('builds geometry once the heightmap loads (regression: #391)', () => {
    expect(() =>
      render(<HillyFloor width={4} depth={4} heightmapUrl="/fake.exr" />)
    ).not.toThrow();
    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('ReferenceError'),
      expect.anything()
    );
  });
});
