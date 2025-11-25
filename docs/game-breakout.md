# Breakout - 2D Brick-Breaking Game

**Genre**: 2D Brick-Breaking  
**Complexity**: Low  
**Status**: ✅ COMPLETE

## Core Mechanics

### Paddle
- Arrow keys / Mouse to move horizontally
- Screen-width constrained
- Collision detection with ball

### Ball
- Physics: velocity, bounce angle based on paddle hit position
- Speed increases slightly each bounce
- Death condition: falls below paddle

### Bricks
- 8 rows × 10 columns grid
- Color-coded by row (different point values)
- Some bricks require multiple hits
- Power-ups drop from destroyed bricks

## Power-Ups (Reuse from Asteroid)

- **Multi-ball**: Spawn 2 additional balls
- **Expand Paddle**: Paddle width × 1.5 for 10 seconds
- **Slow Ball**: Ball speed × 0.6 for 8 seconds
- **Laser Paddle**: Shoot bricks directly (5 shots)

## Implementation Plan

### Day 1
1. Create app/pages/breakout.jsx and app/lib/breakout/BreakoutGame.jsx
2. 2D Canvas setup (800×600)
3. Paddle movement (keyboard + mouse)
4. Ball physics (velocity, bounce, wall collision)
5. Basic brick grid rendering

### Day 2
6. Paddle-ball collision with angle calculation
7. Brick-ball collision and brick destruction
8. Power-up drops and collection
9. Score integration with ScoreManager
10. Audio: paddle hit, brick break, power-up sounds
11. Game over/win conditions
12. High score leaderboard

## Files to Create

- app/lib/breakout/BreakoutGame.jsx - Main game component
- app/lib/breakout/BreakoutCanvas.jsx - 2D rendering
- app/lib/breakout/components/Paddle.js - Paddle physics/rendering
- app/lib/breakout/components/Ball.js - Ball physics/rendering
- app/lib/breakout/components/BrickGrid.js - Brick layout and collision
- app/lib/breakout/components/PowerUpDrop.js - Power-up spawning/collection

## Reused Components

- ScoreManager, HighScoreManager from lib/shared/scoring/
- SoundManager for bounce/break sounds
- KeyboardManager for arrow keys
- Pause menu, game over overlay patterns
