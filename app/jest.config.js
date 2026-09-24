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
    'lib/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    '_components/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    'contexts/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/jest.config.js',
    '!**/next.config.js',
    '!**/_document.js',
    '!**/pages/_app.js',
    // Everything below is a render shell: a page route, a canvas game loop,
    // or a React Three Fiber/WebGL scene. jsdom can't run these meaningfully,
    // so they're covered by Playwright (e2e/) instead. Game *logic* extracted
    // from these shells (tankLogic, weaponHandler, the TS game components,
    // shared managers, audio) is unit-tested and counted.
    '!pages/**/*',
    '!_components/objects/**/*',
    '!_components/effects/**/*.jsx',
    // Canvas game loops (logic lives in lib/<game>/components/*.ts)
    '!lib/breakout/BreakoutGame.tsx',
    '!lib/flappy/FlappyGame.tsx',
    '!lib/pong/PongGame.tsx',
    '!lib/snake/SnakeGame.tsx',
    '!lib/space-invaders/SpaceInvadersGame.tsx',
    '!lib/tank/TankGame.jsx',
    // R3F scenes / meshes
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
    '!lib/asteroid/_comp/Weapons/ShootingSystem.jsx',
    '!lib/asteroid/_comp/UI/BoundaryBox.jsx',
    '!lib/asteroid/_comp/UI/InvincibilityEffect.jsx',
    '!lib/asteroid/_comp/UI/PointerLockControls.js',
    '!lib/asteroid/_comp/UI/ShieldEffect.jsx',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
