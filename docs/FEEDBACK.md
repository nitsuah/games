# QA Feedback & Testing

**Branch**: `phase-7`  
**Last Updated**: October 29, 2025

## QA Validation Checklist

### Core Gameplay

- [ ] **Player Movement** - Ship should drive with inertia (tokyo drift feel), it should NOT stop instantly (which it currently does). also add Q,E for diagonal movement, Z,C for rolling and X for yaw? `/~` should bring the user back to center
- [ ] **Shooting** - All weapons fire correctly, rapid fire works for all weapon types
- [ ] **Score Tracking** - Score DOES NOT persist between waves, was reset to 0 and does not track during the match either. definitely something wrong with this piece of things. accuracy sort of looks like its doing something but its not correct either. when paused current score shows as 0.
- [ ] **Power-ups** - All power-ups collectable and functional
  - [ ] health - works but no visual feedback when collected, should be a "green" affect like time slow but likely more visually impactful/strong
  - [ ] shield - works well good effect (may be impacting the display of explosive weapon?)
  - [ ] invincibility - works well good effect, good aura
  - [ ] rapid fire - DOES NOT WORK AT ALL FOR MOST WEAPONS. needs to increase fire rate significantly for a limited time for all weapons but modifying what happens when the left mouse is held down. LASER should be constant beam. spread should fire rapidly 3 at a time and then fire again after a short delay. explosive should fire rapidly but with a slight delay between shots (the latter presently works as expected)
  - [ ] slow motion - perfect. no notes at the moment, objects might have a slight bug where they then no longer move after time slow ends? or their inertia is just gone.
  - [ ] speed boost - works well, now we can tune down the player speed and how much this boosts a bit.
  - [ ] Music off does not mute game music (but does on "new game"/restart", just not current game running. but turning back on works fine)
  - [ ] confirm restart button - does restart wave but doesnt respawn enemies
  - [ ] Confirm quit button doesnt sent back to home -  but is cool, is there a way we can prevent users from accidentally hitting "back" on their browser and losing their progress? maybe a popup warning?
  - [ ] FPS counter is on top of what i assumne is the score panel in the top left? move the score to below wave and health panel to the bottom right of the screen.
  - [ ] make the ammo bar color blue instead of green to better match the theme (still make red when low)
  - [ ] between waves it used to countdown next to "preparing" (it might be behind the pause menu?) but now it just says "preparing" with no countdown. add countdown back in.

### UI

- [ ] Pause menu sucks. needs to be more visually appealing and have working sound/music toggles. match to current game hud/ui
- [ ] game over menu sucks.

### Weapons

- [ ] **Spread Weapon (Shotgun)** - Tighter spread, correct range (80 units), rapid fire works continuously
- [ ] **Laser Weapon** - Continuous beam with rapid fire, doesn't stop after one shot
- [ ] **Explosive Weapon** - Area damage, rapid fire works continuously

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
