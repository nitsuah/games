# Asteroid Game

A basic 3D game where you pilot a spaceship in an asteroid field. Built with Three.js and JavaScript, the game challenges you to destroy asteroids while avoiding collisions. Featuring dynamic 3D environments, intuitive controls, and engaging mechanics, your objective is to survive as long as possible or eliminate all asteroids.

## How to Play

- Use **WASD** to move, **Space** to go up, **Shift** to go down.
- Click to shoot asteroids.
- Avoid colliding with asteroids to preserve health.
- Destroy all asteroids to win, or survive as long as possible.

## Features

- **3D Asteroid Field**: Randomly moving asteroids (targets) in a bounded 3D space.
- **Player Movement**:
  - WASD + Space/Shift for 3D movement.
  - Pointer lock for mouse look.
  - Smooth velocity-based and direct movement options.
- **Player Hitbox**:
  - Blue (or purple) square rendered under the camera.
  - Adjustable collision radius for accurate hit detection.
- **Shooting System**:
  - Click to shoot.
  - Raycast-based hit detection.
  - Sound effects for shooting, hits, and misses.
- **Asteroid Splitting**:
  - Large asteroids split into two smaller ones when hit or when colliding with each other.
  - Fragments inherit increased speed and color changes.
  - Spawn delay prevents instant chain collisions.
- **Asteroid Movement**:
  - Asteroids bounce off world boundaries.
  - Each asteroid moves independently with random direction and speed.
- **Collision Detection**:
  - Player loses health when colliding with asteroids.
  - Asteroids can collide and split.
- **Score & Stats**:
  - Score increases with hits and accuracy.
  - Tracks high score and best accuracy (saved in localStorage).
  - Health stats and game over overlay.
- **Visual Feedback**:
  - Asteroids flash white and fade out/shrink when hit.
  - Hovering over an asteroid changes its color.
- **UI**:
  - Crosshair in the center.
  - Score and stats display.
  - Game over screen with restart button.
- **Sound**:
  - Background music.
  - Thruster sound when moving.
  - Sound effects for shooting, hitting, and missing.

---
