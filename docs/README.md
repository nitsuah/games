# Games Collection

3D web games built with Next.js, Three.js, and React Three Fiber.

## 🎮 Games

### Asteroid Space Shooter
- **Controls**: WASD to move, Mouse to aim, Click to shoot
- **Weapons**: Press 1/2/3 to switch (Spread/Laser/Explosive), R to reload
- **Power-ups**: Health (green), Shield (blue), Invincibility (yellow), Rapid Fire (red), Slow Motion (purple), Speed Boost (orange)
- **Goal**: Destroy targets, survive, achieve high score

### FPS Tank Commander
- **Controls**: WASD to move, Mouse to aim/shoot, Shift for speed boost
- **Features**: Destructible targets, power-ups, dynamic terrain, health system
- **Goal**: Destroy targets, survive, collect power-ups

## 🛠️ Development

### Quick Start
```powershell
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
```
app/
├── pages/           # Next.js pages
│   ├── asteroid/    # Asteroid game components
│   └── fps/         # FPS game components
├── lib/             # Shared game logic
├── _components/     # Reusable components
├── e2e/             # E2E tests (Playwright)
└── scripts/         # Build/test scripts
```

## 📊 Status

**Current Phase**: 4.1 - Playtest & Stabilize
- ✅ All features implemented
- ⏳ Manual playtest in progress
- ⏳ Bug fixes as needed
- 🎯 Target: Merge to main when stable

See `TODO.md` for active tasks and `PHASE-3.md` for complete backlog.

## 🐛 Known Issues

Check `TODO.md` for current bugs discovered during playtest.

## 🚀 CI/CD

- **GitHub Actions**: Automated testing, linting, E2E tests, Lighthouse audits
- **Status**: [![CI](https://github.com/nitsuah/games/actions/workflows/ci-cd.yml/badge.svg?branch=phase-4)](https://github.com/nitsuah/games/actions)

---

Built with ❤️ using Next.js 15, Three.js, React Three Fiber
