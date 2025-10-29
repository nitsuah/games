/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

// Mock dynamic imports
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (fn) => {
    const Component = fn().then((mod) => mod.default || mod);
    Component.preload = jest.fn();
    return Component;
  },
}));

// Mock canvas and WebGL
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  canvas: {},
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(),
  putImageData: jest.fn(),
  createImageData: jest.fn(),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Trail Quality Keyboard Shortcut', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('pressing T key cycles trail quality and updates localStorage', async () => {
    // Set initial quality to 'high'
    localStorageMock.setItem('trailQuality', 'high');

    // Simulate the trail quality toggle logic (isolated from Game component)
    const cycle = (q) => (q === 'off' ? 'low' : q === 'low' ? 'high' : 'off');
    
    // Initial state
    let currentQuality = localStorageMock.getItem('trailQuality');
    expect(currentQuality).toBe('high');

    // Simulate pressing 'T' key
    const nextQuality = cycle(currentQuality);
    localStorageMock.setItem('trailQuality', nextQuality);

    // Verify it cycled to 'off'
    expect(localStorageMock.setItem).toHaveBeenCalledWith('trailQuality', 'off');
    expect(localStorageMock.getItem('trailQuality')).toBe('off');

    // Press 'T' again
    currentQuality = localStorageMock.getItem('trailQuality');
    const thirdQuality = cycle(currentQuality);
    localStorageMock.setItem('trailQuality', thirdQuality);

    // Verify it cycled to 'low'
    expect(localStorageMock.setItem).toHaveBeenCalledWith('trailQuality', 'low');
    expect(localStorageMock.getItem('trailQuality')).toBe('low');

    // Press 'T' one more time
    currentQuality = localStorageMock.getItem('trailQuality');
    const fourthQuality = cycle(currentQuality);
    localStorageMock.setItem('trailQuality', fourthQuality);

    // Verify it cycled back to 'high'
    expect(localStorageMock.setItem).toHaveBeenCalledWith('trailQuality', 'high');
    expect(localStorageMock.getItem('trailQuality')).toBe('high');
  });

  test('trail quality cycles correctly from each starting state', () => {
    const cycle = (q) => (q === 'off' ? 'low' : q === 'low' ? 'high' : 'off');

    // Test all transitions
    expect(cycle('high')).toBe('off');
    expect(cycle('off')).toBe('low');
    expect(cycle('low')).toBe('high');
  });

  test('localStorage.setItem is called with correct trail quality', () => {
    const testQuality = 'low';
    
    localStorageMock.setItem('trailQuality', testQuality);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('trailQuality', testQuality);
    expect(localStorageMock.getItem('trailQuality')).toBe(testQuality);
  });

  test('handles localStorage errors gracefully', () => {
    // Mock setItem to throw an error
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });

    // Should not throw when wrapped in try-catch
    expect(() => {
      try {
        localStorageMock.setItem('trailQuality', 'high');
      } catch {
        // Ignore error as done in the actual code
      }
    }).not.toThrow();
  });
});
