# Flappy Bird - Endless Runner

**Genre**: Endless Runner  
**Complexity**: Low  
**Estimated Time**: 1 day

## Core Mechanics

### Bird
- Constant forward movement
- Spacebar/Click to flap (upward velocity)
- Gravity pulls down continuously
- Rotation based on velocity (nose up when flapping, down when falling)

### Pipes
- Procedural generation (spawn off-screen right)
- Random gap position (min/max height constraints)
- Scroll left at constant speed
- Collision detection (bird hits pipe or ground = death)

### Scoring
- +1 point for each pipe successfully passed
- High score persistence
- Optional: Medals (bronze/silver/gold) based on score thresholds

## Implementation Plan

### Single Day
1. Create app/pages/flappy.jsx
2. Bird physics: flap velocity, gravity, rotation
3. Pipe generation system (random gaps)
4. Scrolling background (parallax clouds/ground)
5. Collision detection (bird vs pipes/ground)
6. Score display and high score
7. Audio: flap, score, hit, death sounds
8. Game over screen with restart button

## Files to Create

- app/lib/flappy/FlappyGame.jsx - Main game
- app/lib/flappy/FlappyCanvas.jsx - 2D rendering
- app/lib/flappy/components/Bird.js - Physics and rendering
- app/lib/flappy/components/PipeManager.js - Pipe generation/scrolling
- app/lib/flappy/components/Background.js - Parallax scrolling

## Difficulty Progression

- **Easy Mode**: Larger pipe gaps
- **Normal Mode**: Standard gaps
- **Hard Mode**: Smaller gaps, faster scroll speed
