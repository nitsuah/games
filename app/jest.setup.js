// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';

// Mock React.createElement to handle three.js primitives without errors
const originalCreateElement = React.createElement;
const threePrimitives = new Set([
  'primitive', 'mesh', 'sprite', 'group', 'scene',
  'boxGeometry', 'sphereGeometry', 'planeGeometry', 'circleGeometry', 'coneGeometry',
  'meshStandardMaterial', 'meshBasicMaterial', 'spriteMaterial', 'lineBasicMaterial',
  'ambientLight', 'directionalLight', 'pointLight', 'spotLight', 'hemisphereLight',
  'perspectiveCamera', 'orthographicCamera'
]);

React.createElement = function(type, props, ...children) {
  // If it's a three.js primitive, create a mock component
  if (typeof type === 'string' && threePrimitives.has(type)) {
    const MockComponent = React.forwardRef((_props, _ref) => null);
    MockComponent.displayName = type;
    return originalCreateElement(MockComponent, props, ...children);
  }
  return originalCreateElement(type, props, ...children);
};

// Suppress React Three Fiber warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('react-three') || 
       args[0].includes('is using incorrect casing') ||
       args[0].includes('lower case') ||
       args[0].includes('PascalCase'))
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
