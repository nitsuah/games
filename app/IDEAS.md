# Game Ideation: New

## Asteroid

1. **Power-Ups**
   - **In Progress**: Add collectible power-ups (e.g., health restore, shield, rapid fire, slow motion, invincibility).
   - **Next Steps**: Implement floating power-ups that can be collected by colliding with them.

2. **Player Shield**
   - **Planned**: Temporary shield power-up that absorbs one or more hits before breaking.
   - **Next Steps**: Add visual effect around the player when the shield is active.

3. **Level Progression**
   - **Planned**: Add waves or levels with increasing difficulty.
   - **Next Steps**: Introduce new asteroid patterns, more enemies, or environmental hazards for each level.

4. **Enemy Ships**
   - **Planned**: Add AI-controlled enemy ships that chase or shoot at the player.
   - **Next Steps**: Destroying them grants bonus points or drops power-ups.

5. **Asteroid Types**
   - **Planned**: Add different asteroid types (e.g., armored, explosive, fast, splitting into more fragments).
   - **Next Steps**: Implement unique behaviors or effects for each type.

6. **Combo/Multiplier System**
   - **Planned**: Score multipliers for hitting multiple asteroids in quick succession.
   - **Next Steps**: Display combo streaks and bonus points.

7. **Leaderboards**
   - **Planned**: Online or local leaderboard to track high scores and best runs.
   - **Next Steps**: Optionally show friends' scores.

8. **Cosmetic Customization**
   - **Planned**: Unlockable ship skins, trails, or crosshairs based on achievements or score.
   - **Next Steps**: Ensure customization is cosmetic-only and does not affect gameplay.

9. **Environmental Hazards**
    - **Planned**: Add moving obstacles, black holes, or gravity wells that affect movement.
    - **Next Steps**: Hazards can destroy asteroids or the player.

10. **Code Modularization**
    - **Implemented**: Refactored game logic into modular, reusable functions for better maintainability.
    - Functions like `handleTargetHit`, `handleMiss`, `restartGame`, and others are now in separate files.
    - Improved clarity and ease of updates for specific game features.

11. **Weapon Types**
    - **Implemented**: Added foundational support for weapon types (spread, laser, explosive) in `WEAPON_TYPES`.
    - **Next Steps**: Finalize behaviors for each weapon type and integrate them into the shooting system.

---

## FPS Tank Commander

### Core Gameplay (Focus for Next Milestone)

1. **Player Tank Core**
   - Smooth movement and rotation (WASD).
   - Health bar and damage feedback.
   - Two attack types: standard shot and alternate fire (e.g., rapid fire or explosive).
   - Reload/cooldown bar for each attack.
   - Ammo system: limited ammo, ammo pickups as power-ups.
   - Boost/Sprint: temporary speed increase (Shift), with a visible boost meter/cooldown.

2. **Targets & Power-Ups**
   - Destructible targets for practice and scoring.
   - Power-ups: health restore, speed boost, rapid fire, ammo drops.
   - Visual/audio feedback for pickups and effects.

3. **Enemy Implementation (Next Major Feature)**
   - Add a basic AI enemy that moves and attacks the player.
   - Enemy can be destroyed using either attack type.
   - Enemy drops power-ups or score on destruction.
   - Integrate enemy with health, damage, and feedback systems.

4. **HUD & UI**
   - Display health, ammo, reload/cooldown, boost meter, and score.
   - Clear, readable layout for all stats.
   - Feedback for low health, low ammo, reload/boost ready.

5. **Game Over & Restart**
   - Game over screen when health reaches zero.
   - Option to restart and track high scores.

### Polishing & Integration

- Ensure all attack types, power-ups, and movement features are visually and mechanically polished.
- Decals and effects for hits, destruction, and power-up use.
- Responsive controls and clear feedback for all actions.

### Deferred/Advanced Features (After Enemy Integration)

- Multiple enemy types and AI behaviors.
- Level progression, waves, or bosses.
- Cosmetic customization (skins, trails, crosshairs).
- Environmental hazards and destructible objects.
- Multiplayer and advanced progression.

---
