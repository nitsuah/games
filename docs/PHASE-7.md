# PHASE 7 - Game Polish & Code Quality Improvements

**Branch**: `phase-7`  
**Status**: In Progress 🚧  
**Started**: October 29, 2025

## Overview

Phase 7 focuses on comprehensive game polish, code quality improvements from PR feedback, and fixing all outstanding gameplay issues identified during play-testing. This phase combines technical debt cleanup with gameplay improvements.

## Goals

1. ✅ Address all GitHub PR feedback (code quality)
2. 🎮 Fix all gameplay issues from FEEDBACK.md
3. 🎨 Improve visual effects and UI consistency
4. 🔧 Implement missing features (reload indicators, confirmations)
5. ⚖️ Balance weapons and power-ups

---

## 📋 Tasks

### Code Quality Improvements (PR Feedback)

- [ ] **Extract score/accuracy saving utility**
  - Create `utils/saveGameStats.js` helper function
  - Remove duplication from Game.jsx (lines 469-489)
  - Apply DRY principles

- [ ] **Wrap debug console.logs**
  - Add `process.env.NODE_ENV === 'development'` checks
  - Target files: `Game.jsx`, `PauseMenu.jsx`
  - Keep production builds clean

### Critical Gameplay Fixes

- [ ] **Input blocking during pause/transitions**
  - Disable shooting when pause menu is showing
  - Disable movement during pause menu
  - Prevent shooting during wave transitions
  - File: `GameCanvas.jsx`, `Player.jsx`

- [ ] **Implement inertia/drift movement**
  - Replace instant stop with gradual deceleration
  - Add drag coefficient for space-like physics
  - Make movement feel more "floaty and slippery"
  - File: `Player.jsx`

- [ ] **Score and accuracy tracking bug**
  - Investigate localStorage persistence issues
  - Verify hit/miss counting logic
  - Test accuracy calculation across waves
  - Files: `Game.jsx`, `handleTargetHit.js`

### Weapon System Overhaul

- [ ] **Fix shotgun spread and behavior**
  - Currently fires 3 shots always → should only be 3 shots with rapid fire
  - Tighten spread angle significantly (currently "soup can wide")
  - Update `WEAPON_CONFIG` in `config.js`
  - Update shooting logic in weapon handlers

- [ ] **Implement full-auto rapid fire**
  - Make all weapons fire continuously during rapid fire
  - Hold button → continuous fire until: ammo out, button released, OR timer ends
  - Fix shotgun looping issue (fires 3 then stops)
  - Fix basic laser rapid fire
  - Files: `ShootingHandler.jsx` or relevant weapon files

- [ ] **Adjust explosion weapon**
  - Reduce radius in `config.js` (currently too large)
  - Reduce affected target count proportionally
  - Balance for gameplay feel

- [ ] **Add reload progress indicators**
  - Visual progress bar for each weapon's reload time
  - Show on ammo indicator
  - Different reload behaviors:
    - Laser: instant reload
    - Shotgun: moderate reload (visible between bursts)
    - Explosive: bolt-action (long visible reload)
  - Show during rapid fire mode
  - Files: `AmmoIndicator.jsx`, weapon configs

### Power-Up Improvements

- [ ] **Improve power-up spawning**
  - Make pickups slightly bigger for visibility
  - Spread them out more to avoid clustering
  - Update spawn logic in power-up generation

- [ ] **Balance speed boost**
  - Increase acceleration significantly
  - Increase max speed more (currently ineffective with inertia)
  - Make it feel impactful and useful
  - File: `Player.jsx`

- [ ] **Enhance shield visual effect**
  - Add "pizzazz" similar to invincibility
  - Keep blue color theme
  - Maybe pulsing glow or particle effects?
  - File: `Player.jsx` or effect components

- [ ] **Enhance invincibility visual effect**
  - More visual impact
  - Keep random color theme
  - Make it more like shield but colorful
  - File: effect components

- [ ] **Add slow motion visual indicator**
  - Purple tint overlay or edge blur
  - Show time dilation effect to player
  - Challenge: black background, need creative solution
  - Consider: vignette, chromatic aberration, or UI elements

### UI/UX Improvements

- [ ] **Pause menu functionality**
  - Wire up sound toggle to actual sound system
  - Wire up music toggle to actual music system
  - Actually pause sounds/music when paused
  - File: `PauseMenu.jsx`, sound system integration

- [ ] **Add confirmation dialogs**
  - Restart button → confirmation prompt
  - Quit button → confirmation prompt (then redirect to main menu)
  - Prevent accidental restarts/quits
  - File: `PauseMenu.jsx`

- [ ] **Standardize UI styling**
  - Make pause menu fonts consistent with rest of game
  - Unify button styles across all menus
  - Review and update CSS modules

- [ ] **Reorganize HUD layout**
  - Move power-up indicators to top-right (with ammo/health)
  - All status indicators in top-right area
  - Move score to top-left (with wave indicator)
  - All game progress info in top-left area
  - Ensure no overlaps when power-ups are active
  - Files: `Game.jsx` (layout), various UI components

---

## 🎯 Success Criteria

### Functionality

- ✅ Can't shoot/move during pause or wave transitions
- ✅ Movement has proper inertia and drift
- ✅ Score and accuracy save/load correctly
- ✅ All weapons work properly with rapid fire
- ✅ Shotgun spread is tighter and behaves correctly
- ✅ Reload indicators show for all weapons
- ✅ Confirmation dialogs prevent accidents

### Polish

- ✅ Shield and invincibility have impressive visual effects
- ✅ Slow motion has visible time-dilation effect
- ✅ Power-ups are easy to see and grab
- ✅ UI is consistent and well-organized
- ✅ All audio controls work in pause menu

### Code Quality

- ✅ No duplicate code for score saving
- ✅ Debug logs only in development
- ✅ Clean production builds
- ✅ All PR feedback addressed

---

## 📝 Testing Plan

### Unit Tests

- Test score/accuracy utility functions
- Test weapon behavior with rapid fire
- Test movement physics calculations

### Integration Tests

- Test pause menu audio integration
- Test UI layout at different resolutions
- Test power-up collection and effects

### Manual Play-Testing

- [ ] **Movement Feel** - Test inertia and drift, should feel like Asteroids
- [ ] **Weapon Balance** - Test all weapons, confirm spread/rapid fire work
- [ ] **Power-Up Collection** - Verify spawn distribution, grabbing correct items
- [ ] **Visual Effects** - Check shield, invincibility, slow motion effects
- [ ] **UI/UX** - Test pause menu, confirmations, HUD layout
- [ ] **Audio** - Verify pause stops sounds, toggles work
- [ ] **Score Persistence** - Play multiple games, verify high scores save

---

## 🔧 Technical Notes

### Inertia Movement Implementation

```javascript
// Replace instant stop with gradual deceleration
const DRAG = 0.95; // Adjust for desired "floatiness"
velocity.multiplyScalar(DRAG);
// Apply input as force, not direct velocity
```

### Rapid Fire System

```javascript
// Continuous fire while conditions met
if (rapidFireActive && mouseDown && ammo > 0 && !cooldownActive) {
  fire();
  // Continue in next frame
}
```

### Reload Progress Indicator

```javascript
// Calculate reload percentage
const reloadProgress = (time - lastShotTime) / reloadTime;
// Show progress bar: 0% → 100%
```

---

## 📦 Deliverables

1. All gameplay issues from FEEDBACK.md resolved
2. All PR feedback addressed
3. Clean, DRY codebase
4. Comprehensive test coverage
5. Updated documentation
6. Ready for Phase 8 (new features)

---

## 🚀 Next Phase Preview

**Phase 8** will focus on new game modes, leaderboards, and advanced features now that core gameplay is polished.

---

## Notes

- This is a comprehensive polish phase - take time to get each item right
- Prioritize gameplay feel over perfect visual polish
- Test frequently during implementation
- Document any new bugs discovered during testing
- Consider gameplay balance when adjusting values
