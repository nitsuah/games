# Games Collection

A collection of 3D web games built with Next.js, Three.js, and React Three Fiber.

## FPS Tank Game

A first-person tank game where players control a tank, shoot targets, and survive against enemies. Built with Three.js and React Three Fiber, the game offers immersive gameplay with dynamic environments and challenging mechanics.

### How to Play

- Use **WASD** to move the tank forward/backward and rotate left/right.
- Use the **Mouse** to aim and click to shoot.
- Destroy targets to earn points and avoid hazards to survive.
- Collect power-ups to gain temporary advantages.
- Use **Shift** to boost/sprint for a short speed increase (with cooldown).

### Features (Implemented)

1. **Crosshairs**: A visual aid for precise aiming.
2. **Dynamic Terrain**: The tank's position dynamically adjusts based on the terrain height.
3. **EXR Heightmap Support**: Terrain can be generated from EXR heightmap files.
4. **Bell Curve Terrain**: Default Terrain heights follow a bell curve for natural elevation.
5. **Height-Based Shading**: Terrain color shades from dark to light green based on height.
6. **Targets**: Destructible targets that "explode" when hit.
7. **Score System**: Tracks and displays the player's score.
8. **Decals**: Bullet impact decals that fade out over time.
9. **Bullet Physics**: Bullets with realistic physics and automatic cleanup after a few seconds.
10. **Dynamic Lighting**: Lighting effects for explosions and events.
11. **Game Over Screen**: Displays when health reaches zero, with an option to restart.
12. **Persistent Stats**: Save high scores and stats using local storage.
13. **Power-Ups**: Collectible items like health restore, rapid fire, speed boost, and (foundation for) ammo. (Note: shield power-up logic is not fully implemented)
14. **Player Health System**: Tracks and displays player health.
15. **Speed Boost and Rapid Fire**: Temporary power-ups that affect movement and shooting.
16. **Reload Bar**: Visual indicator for weapon cooldown.
17. **Ammo System**: Limited ammo, with pickups to replenish. (Foundation present, but full depletion/disable logic may not be complete)

# App README (moved)

This file has been moved to `docs/app-README.md` to make repository documentation canonical in `docs/`.

See `../docs/app-README.md` for the full app-level documentation.
