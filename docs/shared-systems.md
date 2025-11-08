# Shared System Improvements

These enhancements apply to **all games** and should be built as reusable modules.

## 1. Enemy Shooting System

**Location**: app/lib/shared/ai/EnemyShootingSystem.js

**Features**:
- Configurable fire rate (min/max intervals)
- Difficulty scaling (more aggressive at higher waves)
- Bullet pooling for performance
- Collision detection with player/shields
- Audio integration

**Usage**: Space Invaders, future games with enemy AI

## 2. Shield Erosion System

**Location**: app/lib/shared/physics/ShieldErosion.js

**Features**:
- Pixel-perfect hit detection
- Progressive damage visualization
- Canvas manipulation for erosion effect
- Configurable durability levels
- Repairable shields (power-up)

**Usage**: Space Invaders, Breakout (brick destruction), FPS (cover system)

## 3. UFO Bonus Enemy

**Location**: app/lib/shared/enemies/UFOEnemy.js

**Features**:
- Random spawn timing (every 15-30 seconds)
- Flies across screen at fixed Y position
- High point value (50-300 points)
- Unique audio cue
- Mystery score (revealed on hit)

**Usage**: Space Invaders, Asteroid (as rare target variant)

## 4. Wave Progression System

**Location**: app/lib/shared/progression/WaveManager.js

**Features**:
- Speed scaling per wave
- Enemy count adjustments
- Difficulty curve configuration
- Wave transition effects
- Inter-wave pause with countdown

**Usage**: All arcade games with level progression

## 5. Enhanced Audio System

**Location**: Extend app/lib/shared/audio/SoundManager.js

**New Sounds**:
- Laser fire (pitched based on weapon type)
- Explosion varieties (small/medium/large)
- UFO engine hum (looping while visible)
- Shield impact (different from regular hit)
- Lives lost warning sound

## 6. Lives System

**Location**: app/lib/shared/ui/LivesIndicator.jsx

**Features**:
- Visual icon display (hearts, ships, etc.)
- Animated loss effect (fade/shake)
- Invincibility period after hit (2 seconds)
- Visual feedback (flashing player)
- Game over trigger integration

**Usage**: All games except Flappy Bird (instant death)

## 7. Game Over Flow

**Location**: app/lib/shared/ui/GameOverScreen.jsx

**Features**:
- Score summary display
- High score comparison ("New Record!" badge)
- Name entry for leaderboard (top 10 only)
- Statistics (accuracy, time played, kills)
- Restart button (R key shortcut)
- Return to menu button

## 8. High Score Enhancements

**Location**: Extend app/lib/shared/scoring/HighScoreManager.js

**New Features**:
- Per-game leaderboards
- Global "Arcade Champion" (total score across all games)
- Score sharing (copy to clipboard)
- Date/time stamps for records
- Clear leaderboard option (with confirmation)
