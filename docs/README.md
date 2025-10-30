# Games Collection

[![Netlify Status](https://api.netlify.com/api/v1/badges/25a0a90d-195b-4e53-9d94-9a4107321939/deploy-status)](https://app.netlify.com/projects/nitsuah-arcade/deploys)

3D web games built with Next.js, Three.js, and React Three Fiber.

## 🎮 Games

### Asteroid Space Shooter

- **Controls**: `W A S D` to move, Mouse to aim, Click to shoot
- **Weapons**: Press 1/2/3 to switch (Spread/Laser/Explosive), R to reload
- **Power-ups**: Health (green), Shield (blue), Invincibility (yellow), Rapid Fire (red), Slow Motion (purple), Speed Boost (orange)
- **Goal**: Destroy targets, survive, achieve high score

### FPS Tank Commander

- **Controls**: `W A S D` to move, Mouse to aim/shoot, Shift for speed boost
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

## 📊 Status

**Current Phase**: Phase 7 ✅ COMPLETE

- ✅ Player physics with tokyo drift inertia
- ✅ All weapons balanced and functional
- ✅ UI visibility and consistency improvements
- ✅ Visual effects polish (shield/invincibility)
- ✅ Code quality improvements and optimizations

See `docs/PHASE-7.md` for detailed completion summary.

**Next**: Ready for Phase 8 (new features, game modes, advanced polish)

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
