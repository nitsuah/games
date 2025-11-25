# Space Invaders - 2D Formation Shooter

**Genre**: 2D Formation Shooter  
**Complexity**: Medium  
**Status**: ✅ COMPLETE

## Core Mechanics

### Player
- Arrow keys to move left/right (bottom of screen)
- Spacebar to shoot laser (one shot on screen at a time)
- 3 lives

### Enemies
- 5 rows × 11 columns formation
- Move left/right together, drop down at edges
- Speed increases as enemies are destroyed
- Enemies shoot back randomly

### Shields
- 4 destructible barriers between player and enemies
- Erosion system: each hit removes pixels
- Protect player from enemy fire

## Wave Progression

- **Wave 1**: Basic formation, slow movement
- **Wave 2**: Faster movement, more frequent shots
- **Wave 3**: UFO bonus enemy appears (flies across top)
- **Wave 4+**: Smaller formations, higher speed

## Implementation Plan

### Day 1
1. Create app/pages/space-invaders.jsx
2. Player ship movement and shooting
3. Enemy formation grid
4. Formation movement logic (left/right sweep, drop down)
5. Collision detection (player bullets vs enemies)

### Day 2
6. Enemy shooting system (random intervals)
7. Shield erosion system
8. UFO bonus enemy
9. Wave progression and speed scaling
10. Audio: laser, explosion, UFO sounds
11. Lives system and game over
12. High scores

## Files to Create

- app/lib/space-invaders/SpaceInvadersGame.jsx - Main game
- app/lib/space-invaders/SpaceInvadersCanvas.jsx - 2D rendering
- app/lib/space-invaders/components/PlayerShip.js - Player movement/shooting
- app/lib/space-invaders/components/EnemyFormation.js - Grid management
- app/lib/space-invaders/components/Enemy.js - Individual enemy logic
- app/lib/space-invaders/components/Shield.js - Destructible barrier
- app/lib/space-invaders/components/UFO.js - Bonus enemy
