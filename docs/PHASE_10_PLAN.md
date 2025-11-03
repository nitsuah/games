# Phase 10: New Games Development

**Status**: Planning  
**Previous Phase**: [Phase 9 Complete](./PHASE_9_COMPLETE.md) ✅

---

## 🎯 Primary Goals

1. **Code Architecture for Reusability** - Extract shared systems for multi-game support
2. **Target-Target Collision Physics** - Full inter-target collision system
3. **Connect camera and player object during rotation** - new inputs dont re-align the body of the character/ship (purple rectangle) to match the new rotation of the player camera. so the camera rotates but the player body stays at old rotation.
4. **Weapon Visual Effects** - Muzzle flashes, shell casings, impact effects
5. **Target Visual Feedback** - Spawn, hit, split, and destruction animations
6. **Audio Polish** - Spatial sound, layered impacts, dynamic music
7. **Balance & Tuning** - Speed boost adjustment, weapon balance
8. **Performance Optimization** - Object pooling, culling, LOD

---

## 🏗️ Architecture for Scale (NEW HIGH PRIORITY)

### Goal

Build a reusable game framework to support multiple arcade games without code duplication.

### Shared Systems to Extract

**1. Audio System (`lib/shared/audio/`)** ✅

- ✅ `AudioManager.js` - Centralized audio loading, volume control, mute state
- ✅ `SoundEffect.js` - Play one-shot sounds with variations
- `MusicPlayer.js` - Background music with loop, fade, crossfade (future)
- Already have: `useSound.js`, `SoundManager.js` (refactor these)

**2. Input System (`lib/shared/input/`)** ✅

- ✅ `KeyboardManager.js` - Key binding, key state tracking
- ✅ `MouseManager.js` - Mouse position, click handling, pointer lock
- `GamepadManager.js` - Controller support (future)
- Pattern: Event-driven with callbacks, not game-specific

**3. Scoring System (`lib/shared/scoring/`)** ✅

- ✅ `ScoreManager.js` - Score calculation, multipliers, combos
- ✅ `HighScoreManager.js` - localStorage persistence, leaderboards
- ✅ `StatsTracker.js` - Accuracy, time played, achievements
- Already have: `saveGameStats.js`, `loadSavedScores.js` (consolidate)

**4. UI Components (`lib/shared/ui/`)**

- `ArcadeButton.jsx` - Reusable arcade-styled button
- `ArcadeMenu.jsx` - Base menu with arcade aesthetic
- `ArcadeHeader.jsx` - Title with scanlines and flicker
- `ArcadeCard.jsx` - Game selection card
- Extract from: GameOverOverlay, PauseMenu, HomePage

**5. Game State Management (`lib/shared/state/`)**

- `GameLoop.js` - Standardized game loop with pause/resume
- `SceneManager.js` - Scene transitions, loading screens
- `PowerUpManager.js` - Generic power-up system
- Pattern: State machine for game states (menu/playing/paused/gameover)

**6. Physics & Collision (`lib/shared/physics/`)**

- `CollisionDetection.js` - Sphere-sphere, box-box, raycasting
- `PhysicsBody.js` - Velocity, acceleration, drag
- `SpatialGrid.js` - Spatial partitioning for optimization
- Extract from: Player collision, target collision

### Game-Specific Structure

```bash
lib/
  ├── shared/           # Reusable across all games
  │   ├── audio/
  │   ├── input/
  │   ├── scoring/
  │   ├── ui/
  │   ├── state/
  │   └── physics/
  ├── asteroid/         # Asteroid-specific (6DOF space shooter)
  │   └── _comp/
  ├── fps/              # FPS-specific (terrain-based 3D)
  │   └── _comps/
  ├── platformer/       # 2D platformer (NEW)
  │   └── _comp/
  └── breakout/         # 2D breakout (NEW)
      └── _comp/
```

### Benefits

- Add new games in 1-2 days by reusing 70%+ of code (including testing & polish)
- Consistent arcade aesthetic across all games
- Centralized bug fixes benefit all games
- Portfolio shows architectural thinking

---

## 🎮 New Games Roadmap (Phase 10+)

### Quick Wins (1-2 Days Each)

**1. Breakout/Arkanoid** 🧱

- **Reuse**: Arcade menus, audio system, scoring, power-ups
- **New**: 2D paddle physics, brick patterns, ball bounce
- **Complexity**: Low - Pure 2D, simple physics
- **Portfolio Value**: Shows 2D game dev, physics variety

**2. Space Invaders** 👾

- **Reuse**: Wave system, shooting mechanics, enemy management
- **New**: Formation movement, shields, enemy patterns
- **Complexity**: Medium - 2D with pattern AI
- **Portfolio Value**: Classic arcade, procedural patterns

**3. Flappy Bird Clone** 🐦

- **Reuse**: Audio, scoring, high scores, arcade UI
- **New**: Simple 2D physics, procedural obstacles, endless runner
- **Complexity**: Low - Minimal mechanics
- **Portfolio Value**: Mobile-ready, infinite gameplay

**4. Target Practice Gallery** 🎯 (exists)

- **Reuse**: Asteroid shooting mechanics, targets, weapons
- **New**: Static 3D scene, time pressure, accuracy focus
- **Complexity**: Low - Reuse 80% from Asteroid
- **Portfolio Value**: Shows code reuse, quick iteration

**5. Pong 3D** 🏓

- **Reuse**: Physics, scoring, power-ups, arcade UI
- **New**: Simple AI opponent, 3D perspective
- **Complexity**: Low - Classic mechanics
- **Portfolio Value**: AI implementation, networked potential

### Game Variety Strategy

- ✅ **6DOF Space Shooter** - Asteroid (COMPLETE - asteroid)
- 🔄 **Terrain-Based 3D FPS** - In progress (fps)
- 📋 **2D Platformer** - Next (prove 2D architecture)
- 📋 **2D Arcade Classic** - Breakout or Space Invaders
- 📋 **Endless Runner** - Flappy Bird or Temple Run style

### Target Portfolio

- **3-5 Playable Games** - Show variety and depth
- **1 Deep Game** - Asteroid with full polish
- **2-3 Quick Games** - Built in 1-2 days each using framework
- **Consistent Aesthetic** - All games feel like one arcade

---

## 🔥 High Priority

### 1. Target-Target Collision Physics

**Current State**: Only player-target collision implemented (Phase 8)

**Implementation Plan**:

- Refactor targets to have velocity state (currently only speed/direction)
- Implement sphere-sphere collision detection
- Apply elastic collision physics between targets
- Prevent overlapping/stacking
- Add spatial partitioning for efficient collision checks

**Benefits**:

- More dynamic target movement
- Creates interesting evasion patterns
- Adds visual interest to the arena

**Technical Requirements**:

- Add `velocity: Vector3` to target state
- Implement `checkTargetCollision(target1, target2)` function
- Use fixed timestep physics updates
- Interpolation for smooth movement

---

### 2. Speed Boost Tuning

**QA Feedback**: "works well, now we can tune down the player speed and how much this boosts a bit."

**Current Values**:

- `BASE_ACCELERATION`: 12.0
- `MAX_VELOCITY`: 0.65
- Speed boost multiplier: TBD (needs investigation)

**Proposed Changes**:

- Reduce base player speed slightly
- Reduce speed boost multiplier for better balance
- Test and iterate based on feel

---

---

### 4. Target Visual Feedback

**On Spawn**:

- Fade in with scale animation (small → full size)
- Particle ring/burst effect
- Distinct color per size tier (already implemented)

**When Hit**:

- Flash white briefly
- Emit particles matching target color
- Slight scale pulse (hit → shrink → normal)
- Damage number popup (optional, arcade-style)

**When Splitting**:

- Dramatic particle burst at split point
- Child targets spawn with outward velocity
- Brief trail effect as they separate
- Sound effect (higher pitch for smaller targets)

**When Destroyed**:

- Explosion particle effect
- Fragments scatter outward
- Score popup animation
- Combo multiplier display if active

---

## 🎵 Audio Polish

### Weapon Sounds

- **Laser**: Sci-fi beam sound with charge-up whine
- **Shotgun**: Punchy blast with shell casing clink
- **Explosive**: Deep boom with echo/reverb

### Impact Sounds

- Layered sounds: metal clang + explosion + debris scatter
- Pitch varies with target size (larger = deeper)
- Stereo panning based on impact direction
- Distance attenuation for far impacts

### Ambient/Music

- **Current**: Background music (bgm)
- **Add**: Dynamic music layers that increase with wave progression
- **Add**: Low health tension music/heartbeat
- **Add**: Victory sting at wave completion
- **Add**: Combo sound effects (escalating with multiplier)

### Power-Up Sounds

- Distinct collection sound per power-up type
- Activation whoosh/energy sound
- Ambient hum while active (e.g., shield force field)
- Deactivation sound when power-up expires

---

## 🎨 UI Polish

### Crosshair

- Dynamic reticle that expands/contracts with movement
- Hit confirmation (crosshair pulses/changes color on hit)
- Different crosshair per weapon type
- Lead indicator for fast-moving targets (advanced feature)

### HUD Elements

- Health bar: pulse/shake when taking damage
- Ammo counter: flash when depleted, glow when full
- Combo multiplier: grow animation, trailing particles
- Wave indicator: dramatic transition animation

### Screen Effects

- Vignette increases when low health
- Color grading shifts (red tint) when critical
- Motion blur on rapid movement (subtle)
- Chromatic aberration on damage (very subtle)

---

## 🎮 Control & Feel Improvements

### Mouse Sensitivity

- Add sensitivity slider in settings
- Separate X/Y sensitivity options
- Mouse smoothing toggle
- Invert Y-axis option

### Keyboard Controls

- ✅ WASD movement (already implemented)
- ✅ Number keys for weapon switching (already implemented)
- **Add**: Mouse wheel for weapon cycling
- **Add**: Quick-switch (last weapon)
- **Add**: Reload animation/sound when pressing R

### Accessibility

- **Add**: Colorblind modes (modify target colors)
- **Add**: Reduce motion option (disable screen shake, particles)
- **Add**: High contrast mode
- **Add**: Larger UI elements option
- **Add**: Audio cues for visual events

---

## ⚖️ Balance & Pacing

### Weapon Balance

**Laser**:

- Good for precision at long range
- Consider: Slight damage falloff at extreme distance?
- Consider: Overheat mechanic instead of ammo?

**Explosive**:

- Good for groups/area denial
- Splash radius feels appropriate (15 units)
- Consider: Slight self-damage if too close?

### Difficulty Progression

**Wave Scaling**:

- **Current**: Targets increase each wave
- **Enhance**: Introduce new mechanics per wave:
  - Wave 3: Targets start changing direction mid-flight
  - Wave 5: Fast-moving "runner" targets
  - Wave 7: Tanky targets that require multiple hits
  - Wave 10: Boss target (extra large, splits into many pieces)

**Power-Up Timing**:

- Drop rates should increase on harder waves
- Specific power-ups spawn based on player performance:
  - Low health → health power-up more likely
  - Low ammo → ammo/rapid-fire more likely
  - High combo → damage multiplier power-up

**Score Balancing**:

- Current multiplier progression: 1x → 1.5x → 2x → 3x → 5x
- Consider: Time-based combo decay (forces aggressive play)
- Consider: Bonus points for risky plays (close-range shotgun kills)
- Consider: Wave clear bonus based on accuracy

---

## 🔧 Technical Improvements

### Performance Optimization

- Object pooling for particles/projectiles
- LOD (Level of Detail) for distant targets
- Culling for off-screen objects
- Reduce particle count on low-end hardware

### Physics System

- Implement proper collision detection library (or simple sphere-sphere)
- Spatial partitioning for efficient collision checks
- Fixed timestep physics updates (decouple from render FPS)
- Interpolation/extrapolation for smooth movement

### State Management

- Clean up player state management
- Separate physics state from render state
- Better organization of game loop logic

---

## 📋 Implementation Priority

### Sprint 1: Collision Physics & Balance (Week 1) ✅ COMPLETE

1. ✅ Shared audio system extraction (AudioManager, SoundEffect)
2. ✅ Shared input system extraction (KeyboardManager, MouseManager)
3. ✅ Shared scoring system extraction (ScoreManager, HighScoreManager, StatsTracker)
4. ✅ Target-target collision physics (verified already implemented in Phase 9)
5. ✅ Speed boost tuning (reduced player speeds for better balance)

### Sprint 2: Visual & Audio Effects ✅ COMPLETE

1. ✅ Shell casings for spread weapon (physical ejection with bounce)
2. ✅ Enhanced explosion effects (multi-layer with fire, shockwave, debris)
3. ✅ Target spawn animations (fade in, scale up over 300ms)
4. ✅ Target hit feedback (flash, HitParticles, scale pulse)
5. ✅ Target split animations (SplitParticles component with 20 particles, radial burst)
6. ✅ Weapon sounds with variation (playLaserShoot, playShotgunShoot, playCannonShoot)
7. ✅ Hit impact sounds with pitch/intensity based on target size
8. ✅ Explosion sounds with spatial pan and size variation
9. ✅ Muzzle flashes for all weapons (already existed)
10. ✅ Impact effects (already existed)

### Sprint 3: UI/UX Polish & Controls ✅ COMPLETE

1. ✅ **Camera-Player Rotation Sync** - Fixed using quaternion copy for accurate 3D rotation
2. ✅ Score popups integration - Wired ScorePopup to display at target hit positions with multiplier
3. ✅ Combo display enhancements - Added grow animation (scale 1.3x) when combo increases
4. ✅ **Dynamic crosshair system** - Weapon-specific colors, velocity-based scaling, hit pulse animation
5. ✅ **HUD animations** - Health bar pulse on damage (0.5s), ammo flash on fire (0.2s)

### Sprint 4: Settings & Accessibility (Week 2)

1. Mouse sensitivity slider
2. Separate X/Y sensitivity options
3. Mouse smoothing toggle
4. Invert Y-axis option
5. Colorblind mode options
6. Reduce motion toggle

### Sprint 5: UI/UX Polish (Week 3)

1. Dynamic crosshair system
2. HUD animations (health pulse, ammo flash, combo grow)
3. Screen effects (vignette, color grading)
4. Settings menu (sensitivity, accessibility)
5. Damage numbers and score popups

### Sprint 6: Optimization & Testing (Week 3)

1. Object pooling implementation
2. Spatial partitioning for collisions
3. LOD system for targets
4. Performance profiling
5. Playtest and balance tuning

---

## 💡 Bonus Ideas (Phase 10?)

### Advanced Features

- **Slow-motion on perfect kills** (all targets hit in combo)
- **Kill cam replay** for impressive shots
- **Challenge modes** (time attack, accuracy challenge, no-damage run)
- **Modifiers** (low gravity, double speed, giant targets)
- **Leaderboard integration** (online high scores)
- **Replay system** (save/share gameplay)

### Weapon Variants

- **Laser**: Continuous beam (hold to fire, overheats)
- **Shotgun**: Slug mode (single powerful shot)
- **Explosive**: Sticky grenades (delayed explosion)
- **New**: Railgun (pierces multiple targets)
- **New**: Cluster bomb (splits into bomblets)

### Target Variants

- **Shielded targets** (require multiple hits)
- **Phasing targets** (teleport periodically)
- **Splitting targets** (pre-emptively split when damaged)
- **Homing targets** (chase the player)
- **Kamikaze targets** (explode on contact)

---

## 🧪 Testing Checklist

### Gameplay Feel

- [ ] Target-target collisions feel natural
- [ ] Weapons have satisfying visual feedback
- [ ] Target destruction is rewarding
- [ ] Audio enhances immersion
- [ ] Speed boost feels balanced

### Technical

- [ ] Stable 60 FPS with all effects
- [ ] No collision detection bugs/edge cases
- [ ] Proper cleanup of particles/effects
- [ ] No memory leaks during long play sessions
- [ ] Consistent physics across different frame rates

### Accessibility

- [ ] Colorblind modes work correctly
- [ ] Reduced motion mode disables appropriate effects
- [ ] High contrast mode readable
- [ ] Audio cues complement visual feedback

### Polish

- [ ] Every weapon feels unique and impactful
- [ ] Target destruction is satisfying
- [ ] Audio/visual feedback is cohesive
- [ ] No jarring visual/audio moments
- [ ] Game feels "juicy" and responsive

---

## 📊 Success Metrics

### Quantitative

- Player retention (% who complete wave 5+)
- Average playtime per session
- Highest wave reached (median)
- Weapon usage distribution (are all weapons viable?)
- Power-up collection rate

### Qualitative

- "Do weapons feel impactful?"
- "Are target destructions satisfying?"
- "Does audio enhance the experience?"
- "Is speed boost balanced?"
- "Would you play again?"

---

## 🚀 Phase 10 Deliverables

1. **Full collision physics** with target-target interactions
2. **Enhanced weapon effects** for all weapon types
3. **Polished target feedback** for all states (spawn, hit, split, destroy)
4. **Rich audio** with spatial positioning and dynamic mixing
5. **Improved UI/UX** with animations and settings
6. **Balanced gameplay** with tuned speed boost and weapons
7. **Performance optimizations** for smooth 60 FPS with all effects
8. **Comprehensive testing** across all systems

---

**Target Completion**: 3-4 weeks  
**Focus**: Making the game feel polished and professional
