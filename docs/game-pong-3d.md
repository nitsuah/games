# Pong 3D - AI Opponent Sports Game

**Genre**: Sports/Arcade  
**Complexity**: Low  
**Status**: ✅ COMPLETE

## Core Mechanics

### Player Paddle (Right side)
- Mouse Y-axis or Arrow Up/Down
- Constrained to table bounds

### AI Paddle (Left side)
- Tracks ball Y position with slight lag
- Difficulty: reaction time delay (easy=slow, hard=fast)
- Small random offset for imperfect prediction

### Ball
- 3D physics: velocity in X/Y/Z
- Paddle collision: reflect X velocity, add spin based on paddle movement
- Top/bottom wall bounce
- Score point when ball passes paddle

### 3D Presentation
- Isometric/perspective camera view
- Glowing neon paddles and ball
- Table with grid lines
- Score display above table

## Implementation Plan

### Single Day
1. Create app/pages/pong.jsx
2. Three.js scene setup (table, paddles, ball)
3. Player paddle control (mouse Y-axis)
4. AI paddle logic (track ball with delay)
5. Ball physics (velocity, bouncing)
6. Paddle collision with spin mechanics
7. Scoring system (first to 11 wins)
8. Audio: paddle hit, wall bounce, score sounds
9. AI difficulty selector (Easy/Medium/Hard)

## Files to Create

- app/lib/pong/PongGame.jsx - Main game
- app/lib/pong/PongScene.jsx - Three.js 3D rendering
- app/lib/pong/components/PlayerPaddle.jsx - Player control
- app/lib/pong/components/AIPaddle.js - AI logic
- app/lib/pong/components/Ball.jsx - Ball physics
- app/lib/pong/components/Table.jsx - 3D table model

## AI Difficulty Levels

- **Easy**: 400ms reaction delay, large random offset
- **Medium**: 200ms delay, small offset
- **Hard**: 50ms delay, minimal offset (nearly perfect)
