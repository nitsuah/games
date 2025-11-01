# QA Feedback & Testing

**Branch**: `phase-7`  
**Last Updated**: October 29, 2025

## QA Validation Checklist

### Core Gameplay

- [ ] **Player Movement** - Ship should drive with inertia (tokyo drift feel), it should NOT stop instantly (which it currently does). also add Q,E for diagonal movement, Z,C for rolling and X for yaw? `/~` should bring the user back to center → **ADDED TO PHASE 8 PLAN**
- [x] **Shooting** - All weapons fire correctly, rapid fire works for all weapon types → **FIXED: Rapid fire now works for ALL weapons**
- [ ] **Score Tracking** - Need to test in-game. Score tracking logic looks correct, may have been user error or pause menu display issue
- [ ] **Power-ups** - All power-ups collectable and functional
  - [ ] health - works but no visual feedback when collected, should be a "green" affect like time slow but likely more visually impactful/strong
  - [ ] shield - works well good effect (may be impacting the display of explosive weapon?)
  - [ ] invincibility - works well good effect, good aura
  - [x] rapid fire - **FIXED: Now works for ALL weapons. Laser 50ms, Spread 150ms, Explosive 80ms fire rates**
  - [ ] slow motion - perfect. no notes at the moment, objects might have a slight bug where they then no longer move after time slow ends? or their inertia is just gone.
  - [ ] speed boost - works well, now we can tune down the player speed and how much this boosts a bit.
  - [x] Music off does not mute game music → **FIXED: Music toggle now properly pauses/resumes bgm**
  - [x] confirm restart button - does restart wave but doesnt respawn enemies → **FIXED: Now spawns 10 targets**
  - [x] Confirm quit button doesnt send back to home → **FIXED: Now navigates to /**
  - [ ] Browser back warning - is there a way we can prevent users from accidentally hitting "back" on their browser and losing their progress? maybe a popup warning? → **ADDED TO PHASE 8**
  - [x] FPS counter overlap → **FIXED: FPS top-left, Score/Combo moved to top-right below Wave**
  - [x] make the ammo bar color blue instead of green → **FIXED: Blue (#3366ff) when >20%, red when low**
  - [ ] between waves countdown - it might be behind the pause menu? add countdown back in → **NEED TO INVESTIGATE**

### UI

- [x] Pause menu sound/music toggles → **FIXED: Music toggle now works properly**
- [ ] Pause menu visual design - needs to be more visually appealing and match current game hud/ui → **ADDED TO PHASE 8**
- [ ] game over menu sucks → **ADDED TO PHASE 8**

### Weapons

- [x] **Spread Weapon (Shotgun)** - Tightened in Phase 7, rapid fire now works → **VALIDATED**
- [x] **Laser Weapon** - Continuous beam (50ms fire rate), works correctly → **VALIDATED**
- [x] **Explosive Weapon** - Area damage, rapid fire works (80ms fire rate) → **VALIDATED**

### UI/Visual

- [ ] **FPS Counter** - Located in top-left corner
- [ ] **UI Panels** - All text readable with dark backgrounds (Score, Wave, Health, Weapon, Stats)
- [ ] **Shield Effect** - Blue halo only (no wireframe), 50% opacity with pulsing fade
- [ ] **Invincibility Effect** - Rainbow halo only (no wireframe), 50% opacity with pulsing fade, random colors
- [ ] **Time Slow Effect** - Visual feedback present

### Audio & Controls

- [ ] **Pause Menu** - Sound/music toggles work, game pauses correctly
- [ ] **Input Blocking** - Cannot shoot/move during pause or wave transitions

---

## Known Outstanding Issues

### To Be Fixed

1. **Health Power-up Visual** - No visual effect when collected (needs temporary feedback similar to time slow)
2. **Code Quality** - Restart logic should be extracted to reusable function

### Performance

- Target: 60 FPS on modern hardware
- All tests passing (42/42)

---

## QA Test Session Template

**Tester**: _____________  
**Date**: _____________  
**Browser/Device**: _____________

### Issues Found

- List any bugs or unexpected behavior

### Performance Notes

- FPS: _______
- Load Time: _______
- Lag/Stuttering: _______

### Suggestions

- Feature requests or improvement ideas
