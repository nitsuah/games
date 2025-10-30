# PHASE 7 QA TEST CHECKLIST

**Branch**: `phase-7`  

## Completed Features - Test These

### Critical Gameplay Fixes

- [ ] Speed in general and the boost is better, but my space ship itself needs to tokyo drift man. it  still stops too quickly when I release the keys. it should have more inertia and keep drifting/sliding for longer before coming to a stop. - app/lib/asteroid/_comp/Player/Player.jsx
- [ ] the time slow effect is PERFECT!
- [ ] give the health effect a similar but more temporary visual effect like time slow has.
- [ ] invincibility should just have the new "halo" effect but in random colors, turn off the old wireframe effect.
- [ ] the shield effect is good but has the old wireframe effect mixed in, remove that and keep the new effect only.
- [ ] decrease the opacity as well of the halo effects of shield and invincibility so they are more subtle and less overpowering. have them fade in and out (in opacity) but decrease their current max in half to start (and fade out/in from there).
- [ ] Score is not tracking or updating between rounds so the wave progresses but shows 0 score and 0 accuracy - app/lib/asteroid/_comp/Game/Game.jsx, app/lib/asteroid/_comp/Game/handleTargetHit.js
- [ ] the ui text seems to black now? so hard to make it out. ui panels in game might need backgrounds. the health bar is in a better place but hard to discern. use the Weapon ui and FPS ui's for best practices.
- [ ] move the FPS counter to the top left of the ui.
- [ ] ui debug text Score, Wave #, Best, should be ui panels like everything else so the contrast between everything and updating it is easier to manage. organizae it all better into a panel or hud breakdown. 
- [ ] SHOTGUN IS SO MUCH BETTER! THANK YOU! - it should dissapear faster the closer it is to the player (so fade off the trail) the shots also go too far - reduce max distance - app/lib/asteroid/_comp/Weapons/ShootingSystem.jsx
- [ ] RAPID FIRE - works as expected for explosion weapon. but not for the spread weapon/shotgun. it doesnt work at all now for that one or just shoots 3 rapidly and never again, doesnt loop as expected (FULL AUTO) - app/lib/asteroid/_comp/Weapons/ShootingSystem.jsx - the laser weapon does not work as expected with rapid fire either - it shoots once and then stops. should be full auto like the explosion weapon. and almost stay on/never stop like a laser beam would in real life until ammo runs out or button released. maybe because it works like a "bolt" weapon and instead it should take from the max ammo pool continuously while held down? like skipping reload or setting it to 0?
- [ ] Feedback from copilot - app/lib/asteroid/_comp/Weapons/ShootingSystem.jsx
Comment on lines +146 to +147
The setTimeout callbacks access ammo[weapon] without capturing the current value, which could lead to race conditions if ammo is depleted between the timeouts. Consider capturing the ammo value or using a more robust approach for managing the burst fire sequence.

app/lib/asteroid/_comp/UI/WeaponDisplay.jsx
Comment on lines +4 to +5

The fallback object { name: 'Unknown', maxAmmo: 0, cooldown: 0 } should be defined as a constant to avoid creating a new object on every render. This improves performance and follows best practices.

app/lib/asteroid/_comp/Game/Game.jsx
Comment on lines +605 to +627

The restart logic contains extensive game state reset code that duplicates initialization logic. Consider extracting this into a reusable resetGameState() function to reduce duplication and improve maintainability.

app/contexts/AudioContext.jsx
Comment on lines +26 to +32

The error from play() is silently caught with an empty handler. Consider logging the error in development mode to aid debugging: .catch((err) => { if (process.env.NODE_ENV === 'development') console.warn('Failed to play BGM:', err); })

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
