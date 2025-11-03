# Phase 10: Build 4 New Arcade Games# Phase 10: Build 4 New Arcade Games

**Status**: 🚀 IN PROGRESS  **Status**: 🚀 IN PROGRESS  

**Foundation**: Asteroid game complete with reusable framework ✅

------

## 🎯 Mission## 🎯 Mission

Build 4 new arcade games using the framework from Asteroid. Show rapid iteration and code reuse.**Build 4 new arcade games** using the framework we built during Asteroid development. Demonstrate rapid iteration and code reuse across different game genres.

### Games to Build### Games to Build

1. 🧱 **Breakout** - 2D brick-breaking (1-2 days)1. 🧱 **Breakout** - 2D brick-breaking (Est: 1-2 days)

2. 👾 **Space Invaders** - 2D formation shooter (1-2 days)  2. 👾 **Space Invaders** - 2D formation shooter (Est: 1-2 days)  

3. 🐦 **Flappy Bird** - Endless runner (1 day)3. 🐦 **Flappy Bird** - Endless runner (Est: 1 day)

4. 🏓 **Pong 3D** - AI opponent (1 day)4. 🏓 **Pong 3D** - AI opponent (Est: 1 day)

**Target**: 5-6 playable games (Asteroid + FPS + 4 new)**Target**: 5-6 playable games total (Asteroid + FPS + 4 new games)

------

## 🧱 Sprint 1: Breakout (Days 1-2)## 🏗️ What We Already Have (Framework ✅)

### Core Mechanics### Reusable Systems (70%+ Code Reuse)

- Paddle: Arrow keys/mouse to move horizontally

- Ball: Physics with bounce angle based on paddle position**Audio** ✅

- Bricks: 8×10 grid, color-coded, multi-hit variants- `SoundManager.js` - Procedural sound generation, master gain

- Power-ups: Multi-ball, expand paddle, slow ball, laser paddle- `DynamicMusicSystem.js` - 4-layer music with wave progression

- Volume controls, mute, spatial audio

### Implementation

**Day 1**: Paddle, ball, brick rendering, basic physics  **Input** ✅  

**Day 2**: Collision, power-ups, audio, scoring, high scores- `KeyboardManager.js` - Key binding, state tracking

- `MouseManager.js` - Mouse handling, pointer lock

### Files- Easy to adapt for arrow keys, WASD, spacebar

``` shell
app/pages/breakout.jsx
app/lib/breakout/
  BreakoutGame.jsx
  BreakoutCanvas.jsx
  components/
    Paddle.js
    Ball.js
    BrickGrid.js
    PowerUpDrop.js
```

**Scoring** ✅

```bash
app/lib/breakout/- `ScoreManager.js` - Score calculation, combos
  BreakoutGame.jsx- `HighScoreManager.js` - localStorage leaderboards
  components/- `StatsTracker.js` - Accuracy, playtime
    Paddle.js
    Ball.js**UI/UX** ✅
    BrickGrid.js- `ArcadeCard.jsx` - Game selection (already on homepage)
    PowerUpDrop.js- Arcade aesthetic: scanlines, neon glow, CRT effects
```

- Settings menu pattern (mouse, audio, accessibility)

- Game over/pause overlays

---

### What Each Game Needs (30% New Code)

## 👾 Sprint 2: Space Invaders (Days 3-4)

- Game-specific mechanics (paddle, ball, formations)

### Core Mechanics- Rendering (2D canvas or 3D Three.js)

- Player: Move left/right, shoot laser (one at a time)- Win/loss conditions

- Enemies: 5×11 formation, move together, shoot back- Level/wave progression logic

- Shields: 4 destructible barriers

- UFO: Bonus enemy flies across top---



### Implementation## 🧱 Game 1: Breakout

**Day 3**: Player, enemy formation, movement, shooting  

**Day 4**: Enemy fire, shields, UFO, waves, audio**Genre**: 2D Brick-Breaking  

**Complexity**: Low  

### Files**Estimated Time**: 1-2 days

```

app/pages/space-invaders.jsx### Core Mechanics

app/lib/space-invaders/

  SpaceInvadersGame.jsx**Paddle**

  components/- Arrow keys / Mouse to move horizontally

    PlayerShip.js- Screen-width constrained

    EnemyFormation.js- Collision detection with ball

    Shield.js

    UFO.js**Ball**

```- Physics: velocity, bounce angle based on paddle hit position

- Speed increases slightly each bounce

---- Death condition: falls below paddle



## 🐦 Sprint 3: Flappy Bird (Day 5)**Bricks**

- 8 rows × 10 columns grid

### Core Mechanics- Color-coded by row (different point values)

- Bird: Spacebar to flap, gravity pulls down- Some bricks require multiple hits

- Pipes: Procedural generation, random gaps- Power-ups drop from destroyed bricks

- Scoring: +1 per pipe passed

- Difficulty modes: Easy/Normal/Hard gap sizes### Power-Ups (Reuse from Asteroid)



### Implementation- **Multi-ball**: Spawn 2 additional balls

Single day: Bird physics, pipe generation, scrolling, collision, audio- **Expand Paddle**: Paddle width × 1.5 for 10 seconds

- **Slow Ball**: Ball speed × 0.6 for 8 seconds

### Files- **Laser Paddle**: Shoot bricks directly (5 shots)

```

app/pages/flappy.jsx### Implementation Plan

app/lib/flappy/

  FlappyGame.jsx**Day 1**:

  components/1. Create `app/pages/breakout.jsx` and `app/lib/breakout/BreakoutGame.jsx`

    Bird.js2. 2D Canvas setup (800×600)

    PipeManager.js3. Paddle movement (keyboard + mouse)

    Background.js4. Ball physics (velocity, bounce, wall collision)

```5. Basic brick grid rendering



---**Day 2**:

6. Paddle-ball collision with angle calculation

## 🏓 Sprint 4: Pong 3D (Day 6)7. Brick-ball collision and brick destruction

8. Power-up drops and collection

### Core Mechanics9. Score integration with `ScoreManager`

- Player paddle: Mouse Y-axis or arrow keys10. Audio: paddle hit, brick break, power-up sounds

- AI paddle: Tracks ball with reaction delay11. Game over/win conditions

- Ball: 3D physics with spin mechanics12. High score leaderboard

- First to 11 wins

### Files to Create

### Implementation

Single day: 3D scene, paddles, AI logic, ball physics, scoring, audio```

app/lib/breakout/

### Files  BreakoutGame.jsx       - Main game component

```  BreakoutCanvas.jsx     - 2D rendering

app/pages/pong.jsx  components/

app/lib/pong/    Paddle.js            - Paddle physics/rendering

  PongGame.jsx    Ball.js              - Ball physics/rendering

  components/    BrickGrid.js         - Brick layout and collision

    PlayerPaddle.jsx    PowerUpDrop.js       - Power-up spawning/collection

    AIPaddle.js```

    Ball.jsx

    Table.jsx### Reused Components

```

- `ScoreManager`, `HighScoreManager` from `lib/shared/scoring/`

---- `SoundManager` for bounce/break sounds

- `KeyboardManager` for arrow keys

## 🎨 Sprint 5: Integration (Day 7)- Pause menu, game over overlay patterns



- [ ] Update homepage with all 4 game cards---

- [ ] E2E tests for new games

- [ ] Cross-game UI consistency## 👾 Game 2: Space Invaders

- [ ] Performance check

- [ ] Documentation**Genre**: 2D Formation Shooter  

**Complexity**: Medium  

---**Estimated Time**: 1-2 days



## 🏗️ Framework Reuse (70%+ Code)### Core Mechanics



**Audio** ✅**Player**

- SoundManager.js - Procedural sounds- Arrow keys to move left/right (bottom of screen)

- DynamicMusicSystem.js - Layered music- Spacebar to shoot laser (one shot on screen at a time)

- Volume controls- 3 lives



**Input** ✅  **Enemies**

- KeyboardManager.js- 5 rows × 11 columns formation

- MouseManager.js- Move left/right together, drop down at edges

- Speed increases as enemies are destroyed

**Scoring** ✅- Enemies shoot back randomly

- ScoreManager.js

- HighScoreManager.js**Shields**

- StatsTracker.js- 4 destructible barriers between player and enemies

- Erosion system: each hit removes pixels

**UI** ✅- Protect player from enemy fire

- ArcadeCard.jsx

- Arcade aesthetic### Wave Progression

- Settings patterns

- **Wave 1**: Basic formation, slow movement

---- **Wave 2**: Faster movement, more frequent shots

- **Wave 3**: UFO bonus enemy appears (flies across top)

## 🚀 Deliverables- **Wave 4+**: Smaller formations, higher speed



By end of Phase 10:### Implementation Plan



1. ✅ Asteroid (6DOF shooter) - COMPLETE**Day 1**:

2. 🔄 FPS (3D terrain) - IN PROGRESS1. Create `app/pages/space-invaders.jsx`

3. 🧱 Breakout - TO BUILD2. Player ship movement and shooting

4. 👾 Space Invaders - TO BUILD3. Enemy formation grid

5. 🐦 Flappy Bird - TO BUILD4. Formation movement logic (left/right sweep, drop down)

6. 🏓 Pong 3D - TO BUILD5. Collision detection (player bullets vs enemies)



**6 unique games** showing 2D, 3D, different genres, rapid development.**Day 2**:

6. Enemy shooting system (random intervals)
7. Shield erosion system
8. UFO bonus enemy
9. Wave progression and speed scaling
10. Audio: laser, explosion, UFO sounds
11. Lives system and game over
12. High scores

### Files to Create

```
app/lib/space-invaders/
  SpaceInvadersGame.jsx  - Main game
  SpaceInvadersCanvas.jsx - 2D rendering
  components/
    PlayerShip.js         - Player movement/shooting
    EnemyFormation.js     - Grid management
    Enemy.js              - Individual enemy logic
    Shield.js             - Destructible barrier
    UFO.js                - Bonus enemy
```

---

## 🐦 Game 3: Flappy Bird

**Genre**: Endless Runner  
**Complexity**: Low  
**Estimated Time**: 1 day

### Core Mechanics

**Bird**
- Constant forward movement
- Spacebar/Click to flap (upward velocity)
- Gravity pulls down continuously
- Rotation based on velocity (nose up when flapping, down when falling)

**Pipes**
- Procedural generation (spawn off-screen right)
- Random gap position (min/max height constraints)
- Scroll left at constant speed
- Collision detection (bird hits pipe or ground = death)

**Scoring**
- +1 point for each pipe successfully passed
- High score persistence
- Optional: Medals (bronze/silver/gold) based on score thresholds

### Implementation Plan

**Single Day**:
1. Create `app/pages/flappy.jsx`
2. Bird physics: flap velocity, gravity, rotation
3. Pipe generation system (random gaps)
4. Scrolling background (parallax clouds/ground)
5. Collision detection (bird vs pipes/ground)
6. Score display and high score
7. Audio: flap, score, hit, death sounds
8. Game over screen with restart button

### Files to Create

```
app/lib/flappy/
  FlappyGame.jsx        - Main game
  FlappyCanvas.jsx      - 2D rendering
  components/
    Bird.js             - Physics and rendering
    PipeManager.js      - Pipe generation/scrolling
    Background.js       - Parallax scrolling
```

### Difficulty Progression

- **Easy Mode**: Larger pipe gaps
- **Normal Mode**: Standard gaps
- **Hard Mode**: Smaller gaps, faster scroll speed

---

## 🏓 Game 4: Pong 3D

**Genre**: Sports/Arcade  
**Complexity**: Low  
**Estimated Time**: 1 day

### Core Mechanics

**Player Paddle** (Right side)
- Mouse Y-axis or Arrow Up/Down
- Constrained to table bounds

**AI Paddle** (Left side)
- Tracks ball Y position with slight lag
- Difficulty: reaction time delay (easy=slow, hard=fast)
- Small random offset for imperfect prediction

**Ball**
- 3D physics: velocity in X/Y/Z
- Paddle collision: reflect X velocity, add spin based on paddle movement
- Top/bottom wall bounce
- Score point when ball passes paddle

**3D Presentation**
- Isometric/perspective camera view
- Glowing neon paddles and ball
- Table with grid lines
- Score display above table

### Implementation Plan

**Single Day**:
1. Create `app/pages/pong.jsx`
2. Three.js scene setup (table, paddles, ball)
3. Player paddle control (mouse Y-axis)
4. AI paddle logic (track ball with delay)
5. Ball physics (velocity, bouncing)
6. Paddle collision with spin mechanics
7. Scoring system (first to 11 wins)
8. Audio: paddle hit, wall bounce, score sounds
9. AI difficulty selector (Easy/Medium/Hard)

### Files to Create

```
app/lib/pong/
  PongGame.jsx          - Main game
  PongScene.jsx         - Three.js 3D rendering
  components/
    PlayerPaddle.jsx    - Player control
    AIPaddle.js         - AI logic
    Ball.jsx            - Ball physics
    Table.jsx           - 3D table model
```

### AI Difficulty Levels

- **Easy**: 400ms reaction delay, large random offset
- **Medium**: 200ms delay, small offset
- **Hard**: 50ms delay, minimal offset (nearly perfect)

---

## 📋 Implementation Sprint Plan

### Sprint 1: Breakout (Days 1-2)

- Day 1: Core mechanics, paddle, ball, brick rendering
- Day 2: Polish, power-ups, audio, high scores

### Sprint 2: Space Invaders (Days 3-4)

- Day 3: Player, enemies, formation movement
- Day 4: Shooting, shields, waves, audio

### Sprint 3: Flappy Bird (Day 5)

- Single day: Bird physics, pipes, scoring, audio

### Sprint 4: Pong 3D (Day 6)

- Single day: 3D scene, paddles, AI, physics

### Sprint 5: Integration & Polish (Day 7)

- Update homepage with all 4 new game cards
- E2E tests for new games
- Cross-game UI consistency check
- Performance optimization
- Documentation updates

---

## 🎨 Consistent Arcade Aesthetic

All games share:

- **Color Palette**: Neon cyan (#00ffff), magenta (#ff1493), yellow (#ffff00)
- **Effects**: Scanlines, CRT curvature, screen glow
- **UI**: Arcade-style fonts, pixel-perfect borders
- **Audio**: Procedural retro sounds, consistent volume controls
- **Controls**: Intuitive, documented on pause screen
- **Scoring**: High score leaderboards for all games

---

## 🎯 Success Metrics

### Technical

- [ ] All 4 games playable start-to-finish
- [ ] <100ms input latency
- [ ] 60 FPS stable performance
- [ ] High scores persist across sessions
- [ ] Audio settings apply to all games
- [ ] No console errors

### User Experience

- [ ] Clear controls (documented in-game)
- [ ] Immediate restart capability
- [ ] Satisfying audio/visual feedback
- [ ] Fair difficulty progression
- [ ] Addictive "one more try" quality

### Code Quality

- [ ] 70%+ code reuse from framework
- [ ] Consistent file structure across games
- [ ] Reusable components clearly separated
- [ ] No duplication of audio/scoring/input logic
- [ ] Clean separation: game logic vs rendering

---

## 🚀 Phase 10 Deliverables

By end of Phase 10, the arcade will have:

1. ✅ **Asteroid** - 6DOF space shooter (COMPLETE)
2. 🔄 **FPS** - Terrain-based 3D shooter (IN PROGRESS)
3. 🧱 **Breakout** - 2D brick-breaker (TO BUILD)
4. 👾 **Space Invaders** - 2D formation shooter (TO BUILD)
5. 🐦 **Flappy Bird** - Endless runner (TO BUILD)
6. 🏓 **Pong 3D** - AI opponent sports game (TO BUILD)

**6 unique games** showcasing 2D, 3D, different genres, rapid development capability, and reusable architecture.

---

## 📦 Homepage Updates

Add to `app/pages/index.js`:

```javascript
const games = [
  { title: 'Asteroid', icon: '🎯', description: 'Blast asteroids in space', route: '/asteroid' },
  { title: 'FPS', icon: '🎮', description: 'First-person shooter', route: '/fps' },
  { title: 'Breakout', icon: '🧱', description: 'Classic brick breaking', route: '/breakout' },
  { title: 'Space Invaders', icon: '👾', description: 'Defend Earth from aliens', route: '/space-invaders' },
  { title: 'Flappy Bird', icon: '🐦', description: 'Fly through pipes', route: '/flappy' },
  { title: 'Pong 3D', icon: '🏓', description: 'Beat the AI', route: '/pong' },
];
```

**Result**: Professional arcade portfolio with diverse gameplay styles.
