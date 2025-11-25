# Games Collection

[![Netlify Status](https://api.netlify.com/api/v1/badges/25a0a90d-195b-4e53-9d94-9a4107321939/deploy-status)](https://app.netlify.com/projects/nitsuah-arcade/deploys)
[![CI](https://github.com/nitsuah/games/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/nitsuah/games/actions)

3D web games built with Next.js 15, Three.js, and React Three Fiber.

## 🎮 Games

### 🎯 Asteroid Space Shooter

**Status**: ✅ Complete | **Playable**: `/asteroid`

- **Controls**: `W A S D` to move, Mouse to aim, Click to shoot
- **Weapons**: Press 1/2/3 to switch (Spread/Laser/Explosive), R to reload
- **Power-ups**: Health (green), Shield (blue), Invincibility (yellow), Rapid Fire (red), Slow Motion (purple), Speed Boost (orange)
- **Features**: Wave system, multiple weapon types, power-up system, high score tracking
- **Goal**: Destroy targets, survive waves, achieve high score

### 🎮 FPS Tank Commander

**Status**: ✅ Complete | **Playable**: `/fps`

- **Controls**: `W A S D` to move, Mouse to aim/shoot, Shift for speed boost
- **Features**: First-person shooter, destructible targets, power-ups, dynamic terrain, health system
- **Physics**: Tokyo drift inertia, realistic projectile ballistics
- **Goal**: Destroy targets, survive, collect power-ups

### 🧱 Breakout Classic

**Status**: ✅ Complete | **Playable**: `/breakout`

- **Controls**: Mouse to move paddle, Click to launch ball, Space to restart
- **Features**: Classic brick-breaking gameplay, power-ups, score tracking, lives system
- **Mechanics**: Wave management, brick patterns, paddle physics
- **Goal**: Clear all bricks, progress through waves, set high scores

## 🛠️ Development

### Quick Start

```sh
cd app
npm install
npm run dev
```

Open `http://localhost:3000`

### Key Commands

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm test` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run lint` - Check code quality

### Requirements

- Node.js v22.21.0 (native Windows)
- npm 10.9.4
- Modern browser with WebGL support

### Project Structure

```bash
app/
├── pages/           # Next.js pages
│   ├── asteroid/    # Asteroid game components
│   └── fps/         # FPS game components
├── lib/             # Shared game logic
├── _components/     # Reusable components
├── e2e/             # E2E tests (Playwright)
└── scripts/         # Build/test scripts
```

## 📊 Testing & Quality

- **Unit Tests**: 218 passing (Jest)
- **E2E Tests**: Full game flow coverage (Playwright)
- **Test Coverage**: Core game logic covered
- **CI/CD**: GitHub Actions (lint, test, E2E, Lighthouse audits)
- **Code Quality**: ESLint + Prettier, pre-commit hooks

## 📈 Current Status

**Version**: Phase 10+ ✅ Production Ready

### Recent Milestones

- ✅ All 3 games fully playable and tested
- ✅ Code quality improvements (TypeScript types, documentation)
- ✅ Performance optimizations (game loops, physics)
- ✅ Comprehensive test coverage (218 unit tests)
- ✅ E2E testing for all game flows
- ✅ Accessibility improvements (keyboard navigation, ARIA labels)

### Active Development

- 📝 Documentation updates and consolidation
- 🔧 Tech debt management (see `docs/TECH_DEBT.md`)
- 🎨 Performance monitoring and optimization
- 🚀 Continuous deployment to Netlify

## 🔧 Technical Stack

- **Framework**: Next.js 15.3.0
- **3D Graphics**: Three.js 0.175.0, React Three Fiber 9.1.2
- **Physics**: @react-three/cannon 6.6.0
- **Styling**: Styled Components 6.1.17
- **Animation**: GSAP 3.12.2
- **Testing**: Jest 30.2.0, Playwright 1.56.1
- **Build Tools**: ESLint 9.38.0, Prettier 3.6.2

---

Built with ❤️ using Next.js 15, Three.js, React Three Fiber
