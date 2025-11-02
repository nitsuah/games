# QA Feedback & Testing

**Branch**: `phase-8`  
**Last Updated**: November 1, 2025

---

## 📋 Deferred to Phase 9

### Visual Polish

- [ ] **CRT Effect Improvements** - Enhance scanlines (thinner), add subtle jitter/distortion for authentic retro feel
- [ ] **Coin Insert Animation** - Add coin drop animation + sound effect when clicking "INSERT COIN"

### Gameplay Feel

- [ ] **Player Inertia** - Current drift is improved but needs fine-tuning for "tokyo drift feel"
- [ ] **Health Power-Up Visual** - Green flash effect exists but may need to be more prominent
- [ ] **Score/Accuracy Display** - Needs manual verification that values update correctly during gameplay

### Technical Investigation

- [ ] **White Border Bug** - Occasional white lines on viewport edges (may be dev-only issue)

---

## Outstanding Issues for Phase 9

### Power-Ups

- [ ] **Shield Visual Bug** - May be impacting the display of explosive weapon (needs investigation)
- [ ] **Speed Boost Tuning** - Works well, but could reduce base player speed and boost multiplier for better balance

### Score Tracking

- [ ] **In-Game Testing** - Logic looks correct, may have been user error or pause menu display issue (needs manual validation)

### UI/Visual (Validation Needed)

- [ ] **FPS Counter** - Located in top-left corner (validate positioning)
- [ ] **UI Panels** - Confirm all text readable with dark backgrounds (Score, Wave, Health, Weapon, Stats)
- [ ] **Shield Effect** - Verify blue halo (no wireframe), 50% opacity with pulsing fade
- [ ] **Invincibility Effect** - Verify rainbow halo (no wireframe), 50% opacity with pulsing fade, random colors
- [ ] **Time Slow Effect** - Confirm visual feedback present

### Audio & Controls (Validation Needed)

- [ ] **Pause Menu** - Verify sound/music toggles work, game pauses correctly
- [ ] **Input Blocking** - Confirm cannot shoot/move during pause or wave transitions

---

## Performance Targets

- Target: 60 FPS on modern hardware (300 FPS on high-end systems)
- All tests passing: 169/169 ✅

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
