const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/$1',
    // Handle CSS imports (with CSS modules)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    // Handle image imports
    '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/e2e/'],
  collectCoverageFrom: [
    'lib/**/*.{js,jsx}',
    'pages/**/*.{js,jsx}',
    '_components/**/*.{js,jsx}',
    'utils/**/*.{js,jsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/jest.config.js',
    '!**/next.config.js',
    '!**/_document.js',
    '!**/pages/_app.js',
    // Exclude page routes, 3D meshes, visual canvases/effects, and audio wrappers
    '!pages/**/*',
    '!_components/objects/**/*',
    '!_components/effects/**/*.jsx',
    '!lib/breakout/**/*',
    '!lib/fps/FpsCanvas.jsx',
    '!lib/fps/_comps/Bot.jsx',
    '!lib/fps/_comps/Bullet.jsx',
    '!lib/fps/_comps/ComboDisplay.jsx',
    '!lib/fps/_comps/Controls.js',
    '!lib/fps/_comps/Crosshair.jsx',
    '!lib/fps/_comps/Decal.jsx',
    '!lib/fps/_comps/HealthVignette.jsx',
    '!lib/fps/_comps/PowerUp.jsx',
    '!lib/fps/_comps/ShatterCube.jsx',
    '!lib/fps/_comps/ShootingHandler.jsx',
    '!lib/fps/_comps/Target.jsx',
    '!lib/asteroid/_comp/Game/Game.jsx',
    '!lib/asteroid/_comp/Game/GameCanvas.jsx',
    '!lib/asteroid/_comp/Player/Player.jsx',
    '!lib/asteroid/_comp/Player/MovementControls.jsx',
    '!lib/asteroid/_comp/Target/Target.jsx',
    '!lib/asteroid/_comp/Target/CollisionDetection.jsx',
    '!lib/asteroid/_comp/Target/TargetCollisionHandler.jsx',
    '!lib/asteroid/_comp/Target/TargetCollisionManager.js',
    '!lib/asteroid/_comp/Weapons/ShootingSystem.jsx',
    '!lib/asteroid/_comp/Weapons/weaponHandler.js',
    '!lib/asteroid/_comp/UI/**/*',
    '!utils/audio/**/*',
    '!lib/shared/audio/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
