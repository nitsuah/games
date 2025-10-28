# Phase 5 - Future Enhancements & Improvements

**Status**: Planning / Backlog  
**Started**: TBD  
**Last Updated**: October 28, 2025

This document outlines future work after Phase 4 completion. Priorities will be reassessed based on user feedback and project goals.

---

## 🎯 High Priority Features

### 1. AI Enemy System (FPS Game)
**Goal**: Add basic AI enemy that moves and attacks player

**Requirements**:
- Enemy spawns at random positions
- Pathfinding toward player using simple NavMesh
- Basic attack behavior (shoots projectiles)
- Takes damage and can be destroyed
- Drops power-ups on death
- Visual feedback for enemy state (idle/chase/attack)

**Implementation Notes**:
- Consider using simple state machine (idle → chase → attack)
- Distance-based behavior transitions
- Avoid complex pathfinding initially - direct approach acceptable
- Pool enemy instances for performance

**Files to Modify**:
- Create `app/lib/fps/_comps/Enemy.jsx`
- Create `app/lib/fps/_comps/EnemyAI.jsx`
- Update `FpsCanvas.jsx` to spawn/manage enemies

---

### 2. Wave-Based Difficulty (Asteroid Game)
**Goal**: Progressive difficulty with wave system

**Requirements**:
- Wave counter displayed in UI
- Increasing target count per wave (10 → 15 → 20...)
- Faster target speeds in later waves
- Mix of small/medium/large targets
- Boss wave every 5th wave
- Brief cooldown between waves for preparation

**Implementation Notes**:
- Add `waveNumber` to game state
- Modify `generateTargets.js` to accept wave parameters
- Add wave transition UI overlay
- Persist high wave reached to localStorage

**Files to Modify**:
- `app/lib/asteroid/_comp/Game/GameCanvas.jsx`
- `app/lib/asteroid/_comp/Game/generateTargets.js`
- Create `app/lib/asteroid/_comp/UI/WaveIndicator.jsx`

---

### 3. Enhanced Weapon System
**Goal**: Complete and polish weapon mechanics

**Improvements Needed**:
- Spread shot: Better visual feedback (muzzle flash, tracers)
- Laser beam: Add beam charge-up animation
- Explosive: Larger explosion effect, better AoE indicator
- Add weapon unlock system (start with 1 weapon, unlock others)
- Weapon upgrade system (damage, fire rate, ammo capacity)

**Files to Modify**:
- `app/lib/asteroid/_comp/Weapons/weaponHandler.js`
- `app/lib/asteroid/_comp/Weapons/ShootingSystem.jsx`
- Create weapon upgrade UI components

---

## 🔧 Technical Improvements

### Performance Optimization
- [ ] Implement object pooling for projectiles/particles
- [ ] Optimize texture loading and reuse
- [ ] Add LOD (Level of Detail) for distant objects
- [ ] Profile and optimize useFrame callbacks
- [ ] Reduce draw calls with instanced rendering

### Code Quality
- [ ] Increase test coverage to 80%+ (currently ~60%)
- [ ] Add TypeScript (gradual migration, start with new files)
- [ ] Refactor game state to useReducer (better predictability)
- [ ] Add error boundaries around game components
- [ ] Document complex game logic with JSDoc comments

### Architecture
- [ ] Extract game engine logic from React components
- [ ] Create shared game utilities library
- [ ] Standardize collision detection across games
- [ ] Implement event system for game events (onHit, onDeath, etc.)

---

## 🎨 Visual & Audio Polish

### Graphics Enhancements
- [ ] Post-processing: bloom, motion blur, chromatic aberration
- [ ] Improved particle effects (trails, explosions, impacts)
- [ ] Dynamic lighting and shadows
- [ ] Environment maps for better reflections
- [ ] Skybox with stars/nebula (asteroid game)

### Audio Improvements
- [ ] Background music with adaptive layers
- [ ] Spatial 3D audio positioning
- [ ] More weapon sound variations
- [ ] UI sound effects (menu navigation, button clicks)
- [ ] Audio mixing/ducking system

---

## 🧪 Testing & Quality Assurance

### Automated Testing
- [ ] Add E2E tests for complete game sessions
- [ ] Test power-up collection and effects
- [ ] Test weapon switching and reload
- [ ] Test game over and restart flows
- [ ] Add visual regression testing (Percy/Chromatic)

### Manual Testing
- [ ] Cross-browser testing (Chrome, Firefox, Edge, Safari)
- [ ] Mobile device testing (touch controls)
- [ ] Performance testing on low-end hardware
- [ ] Accessibility audit with screen reader
- [ ] Usability testing with external users

---

## 🌐 User Experience

### UI/UX Improvements
- [ ] Main menu redesign (more polish, animations)
- [ ] Loading screens with progress bars
- [ ] Settings menu (audio volume, graphics quality, controls)
- [ ] Tutorial/onboarding for new players
- [ ] Pause menu with options (resume, restart, quit)
- [ ] Better game over screen (stats, retry, menu)

### Accessibility
- [ ] Keyboard-only navigation
- [ ] Colorblind-friendly mode
- [ ] Adjustable font sizes
- [ ] Audio cues for visual events
- [ ] Configurable control schemes

---

## 🚀 Advanced Features (Long-term)

### Progression System
- [ ] Player XP and leveling
- [ ] Unlockable cosmetics (ship skins, weapon skins, trails)
- [ ] Achievement system with rewards
- [ ] Daily challenges
- [ ] Profile statistics tracking

### Multiplayer (Exploratory)
- [ ] Research WebSocket vs WebRTC for real-time sync
- [ ] Prototype 1v1 deathmatch mode
- [ ] Lobby system and matchmaking
- [ ] Leaderboards (global, friends, weekly)
- [ ] Spectator mode

### Content Expansion
- [ ] New game modes (survival, time attack, puzzle)
- [ ] Additional maps/environments
- [ ] Seasonal events and limited-time content
- [ ] User-generated content (custom maps/modes)

---

## 🐛 Known Issues to Address

### Current Bugs
- None critical (all V2 playtest bugs fixed)

### Technical Debt
- Husky pre-commit hooks fail (package.json location issue)
- Service worker cache strategies need optimization
- Audio loading errors occasionally appear in console (non-blocking)
- Lighthouse performance warnings (LCP, TBT) - acceptable but improvable

### Browser Compatibility
- Test Safari performance (WebGL/Three.js behavior)
- Verify pointer lock on different browsers
- Test audio context on iOS (requires user gesture)

---

## 📝 Notes & Considerations

### Development Philosophy
- Ship working features, not broken promises
- Test before merge, always
- Prioritize stability over new features
- User feedback drives priorities

### Resource Constraints
- Solo dev project - realistic scope required
- Performance matters - target 60 FPS on mid-range hardware
- Keep bundle size reasonable - lazy load where possible

### Maintenance
- Keep dependencies updated (security, features)
- Monitor for breaking changes in Next.js/Three.js
- Regular E2E test runs to catch regressions

---

## 🔗 Related Documentation

- **Current Phase**: `TODO.md` - Active work in Phase 4
- **Completed Work**: `PHASE-3.md` - Historical backlog
- **Setup Guide**: `DEVELOPMENT_SETUP.md`
- **Project Overview**: `README.md`

---

**Ready to start?** Pick a high-priority feature, create a task list, test thoroughly, ship it. Repeat.
