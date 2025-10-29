# PHASE 7 QA TEST CHECKLIST

**Branch**: `phase-7`  
**Deploy URL**: _[Add deploy URL here]_  
**Test Date**: _[Fill in when testing]_

## Completed Features - Test These

### Critical Gameplay Fixes

- [ ] **Input Blocking During Pause/Wave Transitions**
  - ✅ IMPLEMENTED: Can no longer shoot when pause menu is open
  - ✅ IMPLEMENTED: Can no longer move when pause menu is open
  - ✅ IMPLEMENTED: Can no longer shoot during wave transitions
  - ✅ IMPLEMENTED: Can no longer move during wave transitions
  - **Test**: Press ESC to pause, try shooting and moving - should not work
  - **Test**: Wait for wave transition, try shooting and moving - should not work

- [ ] **Inertia/Drift Movement (Asteroids Physics)**
  - ✅ IMPLEMENTED: Ship now drifts when keys released (drag coefficient 0.92)
  - ✅ IMPLEMENTED: Movement feels floaty and slippery like classic Asteroids
  - ✅ IMPLEMENTED: Gradual deceleration instead of instant stop
  - **Test**: Press WASD keys and release - ship should coast/drift before stopping
  - **Test**: Movement should feel like ice skating in space

- [ ] **Speed Boost Balance**
  - ✅ IMPLEMENTED: Acceleration increased from 15 to 80 (5.3x faster)
  - ✅ IMPLEMENTED: Max velocity increased from 0.5 to 2.5 (5x faster)
  - ✅ IMPLEMENTED: Much more noticeable and useful with inertia system
  - **Test**: Grab orange speed boost power-up, movement should be MUCH faster

### Weapon System Overhaul

- [ ] **Shotgun Spread and Behavior**
  - ✅ IMPLEMENTED: Spread angle tightened from 0.6 to 0.15 (75% tighter)
  - ✅ IMPLEMENTED: Single shot by default (no longer triple shot always)
  - ✅ IMPLEMENTED: Triple burst ONLY when rapid fire is active
  - **Test**: Fire shotgun without rapid fire - should be single shot
  - **Test**: Fire shotgun WITH rapid fire - should be 3-shot burst
  - **Test**: Spread should be much tighter, not "soup can wide"

- [ ] **Full-Auto Rapid Fire System**
  - ✅ IMPLEMENTED: All weapons continuous fire when rapid fire active
  - ✅ IMPLEMENTED: Hold mouse = continuous fire until ammo out, button released, or timer ends
  - ✅ IMPLEMENTED: Laser always continuous (even without rapid fire)
  - ✅ IMPLEMENTED: Shotgun loops 3-shot bursts during rapid fire
  - **Test**: Get red rapid fire power-up
  - **Test**: Hold mouse down - should continuously fire until ammo depleted
  - **Test**: Shotgun should keep firing 3-shot bursts, not stop after one burst

- [ ] **Explosion Weapon Balance**
  - ✅ IMPLEMENTED: Radius reduced from 50 to 30 (40% smaller)
  - ✅ IMPLEMENTED: More balanced, less overpowered
  - **Test**: Fire explosive weapon, explosion should be noticeably smaller

### Power-Up Improvements

- [ ] **Power-Up Visibility and Distribution**
  - ✅ IMPLEMENTED: Size increased from 1.0 to 1.8 (80% bigger)
  - ✅ IMPLEMENTED: Spread out more across play area
  - ✅ IMPLEMENTED: Better spacing to prevent clustering
  - **Test**: Power-ups should be much easier to see
  - **Test**: Power-ups should be spread out, not bunched together
  - **Test**: Should be easier to grab the right power-up

### Code Quality (Non-Visible)

- [ ] **Debug Console Logs**
  - ✅ IMPLEMENTED: All debug logs wrapped in dev-only checks
  - ✅ IMPLEMENTED: Clean production builds
  - **Test**: Open browser console in production build - should have minimal/no debug spam

- [ ] **Score/Accuracy Saving**
  - ✅ IMPLEMENTED: Extracted into reusable utility function
  - ✅ IMPLEMENTED: Cleaner, more maintainable code (DRY principle)
  - **Test**: Play game, check that high scores persist after refresh

---

## Known Issues Still To Fix (Not Yet Implemented)

### Score Tracking

- [ ] Score and accuracy persistence may still have issues - needs investigation

### Audio Controls

- [ ] Pause menu music/sound toggles don't work yet
- [ ] Music and sounds don't stop when paused

### UI/UX Polish Needed

- [ ] Pause menu needs restart button with confirmation
- [ ] Pause menu quit button needs confirmation prompt
- [ ] UI elements not consistent (fonts/styles)
- [ ] HUD needs reorganization (power-ups overlap wave info)
- [ ] Shield needs more visual pizzazz (blue themed)
- [ ] Invincibility needs more visual impact
- [ ] Slow motion needs purple tint or visual effect

### Advanced Features

- [ ] Reload progress bars not yet implemented

---

## QA Notes Section

**Tester Name**: _____________  
**Date**: _____________  
**Browser**: _____________  

### Issues Found

_[List any bugs or issues discovered during testing]_

### Suggestions

_[Any feedback or improvement suggestions]_

### Performance

- FPS: _______
- Load Time: _______
- Any lag/stuttering? _______

