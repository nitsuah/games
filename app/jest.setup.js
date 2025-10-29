// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Suppress React Three Fiber primitive casing warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // Filter out react-three-fiber primitive warnings
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('react-three') || 
       args[0].includes('primitive') ||
       args[0].includes('lower case'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock canvas and WebGL for Three.js tests
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
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

// Mock Web Audio API for sound tests
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { setValueAtTime: jest.fn() },
    type: 'sine',
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
  })),
  currentTime: 0,
  destination: {},
}));

// Mock requestAnimationFrame for Three.js useFrame
global.requestAnimationFrame = jest.fn((cb) => {
  cb(0);
  return 0;
});

global.cancelAnimationFrame = jest.fn();
