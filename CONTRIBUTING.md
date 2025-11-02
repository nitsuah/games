# Contributing to Games

Welcome to the Games arcade project! This document provides guidelines and information for contributing.

---

## 🎮 Project Overview

A collection of retro-styled arcade games built with React, Next.js, and Three.js. All games share a unified arcade aesthetic and reusable component architecture.

### Current Games

- **Asteroid** - 6DOF space shooter with physics-based combat
- **FPS** - First-person shooter with terrain navigation (in progress)

---

## 🏗️ Architecture

### Project Structure

```text
app/
├── lib/
│   ├── shared/          # Reusable across all games
│   │   ├── physics/     # Collision detection, spatial partitioning
│   │   ├── ui/          # ArcadeButton, ArcadeCard, ArcadeHeader, ArcadeMenu
│   │   └── audio/       # Sound management (planned expansion)
│   ├── asteroid/        # Asteroid game-specific code
│   │   └── _comp/       # Game components, logic, and handlers
│   └── fps/             # FPS game-specific code
│       └── _comps/      # FPS components
├── pages/               # Next.js pages (routes)
├── _components/         # Global effects and utilities
├── utils/               # Shared utilities
├── public/              # Static assets (sounds, images)
└── tests/               # Unit tests mirroring src structure
```

### Shared Systems

**Physics** (`lib/shared/physics/CollisionDetection.js`)

- `checkSphereCollision()` - Sphere-sphere collision detection
- `calculateElasticCollision()` - Physics-based collision response
- `SpatialGrid` - Spatial partitioning for O(n log n) collision optimization

**UI Components** (`lib/shared/ui/`)

- `ArcadeButton` - Neon-styled interactive button with glow effects
- `ArcadeCard` - Game selection card with multiple display modes
- `ArcadeHeader` - Title header with scanline effects
- `ArcadeMenu` - Overlay menu container with arcade styling

---

## 🧪 Testing

### Testing Strategy

**Coverage: ~20%** (218 tests) - We strategically test **pure logic** while relying on E2E tests for visual/3D components.

#### What to Test ✅

When adding new features, write tests for:

- **Pure utility functions** - Aim for 100% coverage
- **Game logic handlers** - State transitions, scoring, combos
- **Input handlers** - Keyboard/mouse event handling
- **Physics systems** - Collision detection, spatial algorithms
- **UI components** - Shared arcade components in `lib/shared/ui/`
- **Game mechanics** - Target generation, wave progression

#### What NOT to Test ❌

These are covered by E2E tests or are too brittle to unit test:

- **R3F Components** - React Three Fiber visual components
- **THREE.js Integration** - 3D rendering, raycasting, camera calculations
- **Web Audio API** - Sound generation and management
- **Canvas rendering** - Visual effects, explosions, particles

**Why?** Heavy mocking of THREE.js/R3F creates fragile tests that break with library updates and provide false confidence. Playwright E2E tests verify actual 3D gameplay instead.

### Running Tests

```bash
# Unit tests (watch mode)
npm test

# Coverage report
npm run test:coverage

# E2E tests (requires dev server running)
npm run test:e2e

# Development server
npm run dev
```

### Test Organization

```text
tests/
├── asteroid/_comp/      # Asteroid game logic tests
│   ├── Game/           # Game state handlers (10 files)
│   └── Target/         # Target mechanics
├── fps/_comps/          # FPS game logic tests
├── shared/
│   ├── physics/        # Collision detection, spatial grids
│   └── ui/             # Shared arcade components
├── utils/              # Shared utility functions
└── e2e/                # Playwright end-to-end tests
```

### Writing Good Tests

1. **Test pure functions thoroughly** - Edge cases, boundaries, errors
2. **Use descriptive test names** - `describe('handlePlayerHit', () => { it('should apply shield before health damage', ...)})`
3. **Mirror source structure** - `lib/asteroid/_comp/Game/handleMiss.js` → `tests/asteroid/_comp/Game/handleMiss.test.js`
4. **Mock external dependencies** - localStorage, refs, R3F hooks when necessary
5. **Aim for 75%+ coverage** on files you modify

### Example Test Structure

```javascript
import { handlePlayerHit } from '@/lib/asteroid/_comp/Game/handlePlayerHit';

describe('handlePlayerHit', () => {
  it('should consume shield before reducing health', () => {
    const state = { health: 100, shields: 1, invincible: false };
    const result = handlePlayerHit(state, 20);
    expect(result.shields).toBe(0);
    expect(result.health).toBe(100); // Health unchanged
  });

  it('should reduce health when no shields', () => {
    const state = { health: 100, shields: 0, invincible: false };
    const result = handlePlayerHit(state, 20);
    expect(result.health).toBe(80);
  });
});
```

---

## 🎯 Code Quality Guidelines

### Performance Considerations

1. **Object Pooling** - Reuse particle objects to reduce GC pressure
2. **Spatial Partitioning** - Use `SpatialGrid` for efficient collision detection
3. **Frame Budget** - Target 60 FPS, profile with browser DevTools
4. **LOD System** - Reduce detail for distant objects

### Documentation Standards

- **JSDoc comments** for all public functions and classes
- **Inline comments** for complex logic or non-obvious code
- **README updates** when adding new features or systems

### Code Style

- Follow existing patterns in the codebase
- Use functional components with hooks
- Extract reusable logic into utility functions
- Keep components focused and single-purpose

---

## 🚀 Development Workflow

### Adding a New Game

1. **Create game directory**: `lib/your-game/`
2. **Reuse shared systems**: Import from `lib/shared/`
3. **Add page route**: Create `pages/your-game.jsx`
4. **Update home page**: Add game card to arcade selection
5. **Write tests**: Add tests in `tests/your-game/`

### Adding a Shared System

1. **Create in** `lib/shared/[category]/`
2. **Write comprehensive tests** - 100% coverage expected
3. **Document with JSDoc** - Include usage examples
4. **Update this guide** - Document the new system

### Pull Request Process

1. **Create feature branch** from `main`
2. **Write tests** for new functionality
3. **Ensure all tests pass** (`npm test`)
4. **Update documentation** if needed
5. **Submit PR** with clear description

---

## 🎨 Design Philosophy

### Arcade Aesthetic

- **Neon colors** - Cyan (#00ffff), magenta (#ff1493), yellow (#ffff00)
- **CRT effects** - Scanlines, bloom, slight chromatic aberration
- **Retro fonts** - Monospace, bold, all-caps for emphasis
- **Screen shake** - Subtle feedback for impacts and explosions
- **Particle effects** - Abundant, colorful, satisfying

### Game Feel Principles

- **Immediate feedback** - Every action has visual/audio response
- **Juicy interactions** - Screen shake, particles, sound layers
- **Clear communication** - HUD elements are readable and informative
- **Rewarding progression** - Combos, multipliers, power-ups
- **Balanced challenge** - Fair but demanding difficulty curve

---

## 📊 Technical Debt

### Current Focus Areas

1. **Power-Up Config Testability** - Extract duration management from inline setTimeout logic
2. **Performance Optimization** - Object pooling implementation needed for particle systems
3. **JSDoc Documentation** - Expand documentation for shared systems

### Resolved Items ✅

- Target velocity refactoring (Phase 9)
- Collision physics implementation (Phase 10)
- Spatial partitioning optimization (Phase 10)
- Shared UI component extraction (Phase 9)

---

## 🐛 Debugging Tips

### Performance Issues

1. **Check frame rate**: Look for frame drops in browser DevTools
2. **Profile JS execution**: Use Performance tab to identify hotspots
3. **Reduce particle count**: Lower particle limits for testing
4. **Check collision grid**: Verify cell size is appropriate for object density

### Physics Bugs

1. **Log collision events**: Add console.logs to collision handlers
2. **Visualize spatial grid**: Render grid boundaries for debugging
3. **Check velocity magnitudes**: Ensure velocities are reasonable
4. **Verify timestep**: Check for frame-rate-dependent behavior

### Audio Issues

1. **Check browser console**: Look for audio loading errors
2. **Verify file paths**: Ensure sounds exist in `public/sounds/`
3. **Test autoplay policy**: User interaction may be required
4. **Check volume levels**: Verify mix isn't causing clipping

---

## 📝 Commit Message Guidelines

Use conventional commits format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test additions or fixes
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `style:` Code style changes (formatting)
- `chore:` Build/tooling changes

Examples:

```text
feat: add spatial grid for collision optimization
fix: correct elastic collision coefficient calculation
test: add coverage for power-up duration manager
docs: update architecture section with physics system
```

---

## 🎓 Learning Resources

### Three.js / React Three Fiber

- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Examples](https://threejs.org/examples/)
- [Discover Three.js](https://discoverthreejs.com/)

### Game Development

- [Game Programming Patterns](https://gameprogrammingpatterns.com/)
- [Red Blob Games](https://www.redblobgames.com/) - Algorithms and visualizations
- [Game Feel by Steve Swink](https://www.game-feel.com/)

### Testing

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright E2E](https://playwright.dev/)

---

## 🤝 Getting Help

- **Issues**: Check existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Tag maintainers for review feedback

---

## 📜 License

See LICENSE file in repository root.

---

**Last Updated**: November 2, 2025  
**Project Status**: Active Development (Phase 10)
