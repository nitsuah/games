# Games Collection

[![Netlify Status](https://api.netlify.com/api/v1/badges/25a0a90d-195b-4e53-9d94-9a4107321939/deploy-status)](https://app.netlify.com/projects/nitsuah-arcade/deploys)

3D web games built with Next.js, Three.js, and React Three Fiber.

## 🎮 Games

### Asteroid Space Shooter ✅

- **Controls**: `W A S D` to move, Mouse to aim, Click to shoot
- **Weapons**: Press 1/2/3 to switch (Spread/Laser/Explosive), R to reload
- **Power-ups**: Health (green), Shield (blue), Invincibility (yellow), Rapid Fire (red), Slow Motion (purple), Speed Boost (orange)
- **Goal**: Destroy targets, survive, achieve high score

### FPS Tank Commander ✅

- **Controls**: `W A S D` to move, Mouse to aim/shoot, Shift for speed boost
- **Features**: Destructible targets, power-ups, dynamic terrain, health system
- **Goal**: Destroy targets, survive, collect power-ups

### Breakout ✅

- **Controls**: Arrow keys / Mouse to move paddle
- **Features**: Brick destruction, power-ups, multi-ball, laser paddle
- **Goal**: Clear all bricks, achieve high score

### Flappy Bird ✅

- **Controls**: Spacebar/Click to flap
- **Features**: Procedural pipe generation, high score tracking
- **Goal**: Survive as long as possible, avoid pipes

### Pong ✅

- **Controls**: Arrow keys or Mouse to move paddle
- **Features**: AI opponent with adjustable difficulty
- **Goal**: First to 11 points wins

### Snake ✅

- **Controls**: Arrow keys to change direction
- **Features**: Classic snake mechanics, high score tracking
- **Goal**: Eat food, grow longer, avoid walls and self

### Space Invaders ✅

- **Controls**: Arrow keys to move, Spacebar to shoot
- **Features**: Formation enemies, shields, wave progression
- **Goal**: Destroy all enemies, survive waves

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
│   ├── asteroid.jsx      # Asteroid space shooter
│   ├── fps.jsx          # FPS tank game  
│   ├── breakout.jsx     # Breakout brick breaker
│   ├── flappy.tsx       # Flappy bird clone
│   ├── pong.tsx         # Pong with AI
│   ├── snake.tsx        # Classic snake
│   └── space-invaders.tsx # Space invaders
├── lib/             # Game-specific logic
│   ├── asteroid/    # Asteroid game code
│   ├── fps/         # FPS game code
│   ├── breakout/    # Breakout game code
│   ├── flappy/      # Flappy game code
│   ├── pong/        # Pong game code
│   ├── snake/       # Snake game code
│   ├── space-invaders/ # Space invaders code
│   └── shared/      # Shared systems (physics, audio, UI)
├── _components/     # Global effects and reusable components
├── e2e/             # E2E tests (Playwright)
└── scripts/         # Build/test scripts
```

## 📊 Status

**Current Phase**: Phase 10 - Multi-Game Arcade 🎮

**Completed**:

- ✅ Asteroid - 6DOF space shooter with full polish
- ✅ FPS - First-person terrain shooter  
- ✅ Breakout - Classic brick breaker
- ✅ Flappy - Endless runner
- ✅ Pong - AI opponent sports game
- ✅ Snake - Classic snake mechanics
- ✅ Space Invaders - Formation shooter

**Total**: 7 playable arcade games with shared framework

**Next**: Polish, optimization, and new game modes

## 🐛 Known Issues

Minor polish items remaining:

- Health power-up lacks visual feedback
- Restart logic could be refactored

See `docs/FEEDBACK.md` for QA testing checklist.

## 🚀 CI/CD

- **GitHub Actions**: Automated testing, linting, E2E tests, Lighthouse audits
- **Status**: [![CI](https://github.com/nitsuah/games/actions/workflows/ci-cd.yml/badge.svg?branch=phase-7)](https://github.com/nitsuah/games/actions)

---

Built with ❤️ using Next.js 15, Three.js, React Three Fiber
