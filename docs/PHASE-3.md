# Phase 3 — Consolidated TODO & Backlog

This is the **single source of truth** for all remaining tasks, features, and improvements. All other TODO files redirect here.

Last updated: October 28, 2025

---

## 🎯 Current Sprint: Phase 4 Tasks

### Lighthouse & Performance

- [ ] Run Lighthouse locally with native Node.js
- [ ] Generate `app/lighthouse-report.json` (desktop mode)
- [ ] Parse report for color-contrast and accessibility issues
- [ ] Fix any remaining Lighthouse failures

### Testing & Quality Assurance
- [ ] Add E2E smoke tests (Playwright/Puppeteer) for:
  - Main menu loads successfully
  - Asteroid game loads and starts
  - FPS game loads and starts
  - Pointer lock basic flow works
- [ ] Add `app/scripts/contrast-check.js` to CI (non-blocking)
- [ ] Verify test coverage for critical game mechanics

### Manual Playtest Checklist

#### Asteroid Game
- [ ] Health system: damage on collision (small/large targets)
- [ ] Health UI updates correctly
- [ ] Red flash effect on player hit
- [ ] Collision sound effects work
- [ ] Shield power-up: collects correctly
- [ ] Shield: absorbs exactly 3 hits
- [ ] Shield: shows visual barrier effect
- [ ] Shield: indicator counter displays
- [ ] Invincibility power-up: prevents all damage
- [ ] Health restore power-up: adds health correctly
- [ ] Rapid fire power-up: increases fire rate
- [ ] Slow motion power-up: affects game speed
- [ ] Speed boost power-up: increases movement speed
- [ ] Power-up indicators show in top-right UI
- [ ] Power-up durations are correct
- [ ] Weapon switching works (spread/laser/explosive)
- [ ] Ammo system functions correctly
- [ ] Cooldown bars display properly
- [ ] Game over triggers when health = 0
- [ ] Pointer lock releases on game over
- [ ] Restart button resets all game state
- [ ] Scores persist to localStorage
- [ ] High score tracking works

#### FPS Tank Game
- [ ] Tank movement (WASD) is smooth
- [ ] Mouse aim and shooting work
- [ ] Targets can be destroyed
- [ ] Score system tracks points
- [ ] Health bar displays correctly
- [ ] Damage feedback is clear
- [ ] Power-ups spawn and can be collected
- [ ] Speed boost (Shift) works with cooldown
- [ ] Reload bar shows weapon cooldown
- [ ] Game over screen appears at 0 health
- [ ] Restart functionality works
- [ ] Stats persist to localStorage

#### Accessibility
- [ ] Run `app/scripts/contrast-check.js` locally
- [ ] Fix any low-contrast color pairs
- [ ] Verify keyboard navigation works
- [ ] Test screen reader compatibility (basic)

---

## 📋 Backlog: Future Features & Improvements

### Asteroid Game Enhancements
- [ ] Add waves/levels with increasing difficulty
- [ ] Implement AI-controlled enemy ships
- [ ] Add different asteroid types (armored, explosive, splitting)
- [ ] Combo/multiplier system for quick successive hits
- [ ] Online or local leaderboard
- [ ] Cosmetic customization (ship skins, trails, crosshairs)
- [ ] Environmental hazards (black holes, gravity wells)
- [ ] Complete all weapon types from `WEAPON_TYPES` config

### FPS Tank Enhancements
- [ ] Add basic AI enemy that moves and attacks
- [ ] Enemy drops power-ups on destruction
- [ ] Multiple enemy types with unique behaviors
- [ ] Boss encounters and special events
- [ ] Level selection and progression tracking
- [ ] Destructible environment objects
- [ ] Advanced ammo system with different ammo types

### Code Quality & Architecture
- [ ] Increase test coverage to 80%+
- [ ] Add TypeScript (gradual migration)
- [ ] Implement object pooling for projectiles/particles
- [ ] Optimize texture loading and asset management
- [ ] Add performance monitoring and FPS counter
- [ ] Refactor game state management to useReducer
- [ ] Add error boundaries to prevent crashes

### User Experience
- [ ] Add loading screens with progress indicators
- [ ] Improve responsive design for mobile devices
- [ ] Implement settings/options menu (audio, graphics quality)
- [ ] Add tutorial/onboarding for new players
- [ ] Implement pause menu
- [ ] Add background music with volume controls
- [ ] Spatial audio for 3D positioning

### Visual Polish
- [ ] Enhanced particle effects for explosions
- [ ] Improved lighting and shadows
- [ ] Post-processing effects (bloom, motion blur)
- [ ] Consistent visual theme across games
- [ ] Better explosion animations
- [ ] Trail effects for projectiles

### Advanced Features (Long-term)
- [ ] Multiplayer foundation (WebSocket support)
- [ ] Lobby system and matchmaking
- [ ] Player progression and XP system
- [ ] Unlockable cosmetics and achievements
- [ ] Analytics and telemetry (privacy-compliant)
- [ ] A/B testing framework

---

## 🐛 Known Issues

### Critical
- None currently

### Medium Priority
- Lighthouse unused-javascript assertion too strict (adjusted to maxLength: 3)
- Performance warnings on LCP, TBT in CI (acceptable for now)

### Low Priority
- Audio loading errors in console (non-blocking)
- Service worker cache strategies could be optimized

---

## 📝 Notes

- All critical Phase 1-3 items are complete
- Focus is now on stabilization and validation (Phase 4)
- Next major milestone: Add AI enemy to FPS game
- Documentation is being consolidated (see `DOCS_CONSOLIDATION.md`)

---

## 🔗 Related Documentation

- Development setup: `docs/DEVELOPMENT_SETUP.md`
- Full roadmap: `docs/COPILOT_ROADMAP.md`
- Phase 4 goals: `docs/PHASE-4.md`
- Feature ideas: `docs/IDEAS.md`
