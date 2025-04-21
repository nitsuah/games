# Games Collection

A collection of 3D web games built with Next.js, Three.js, and React Three Fiber.

## Asteroid

A fast-paced 3D space shooter where you pilot a spaceship through an asteroid field, avoiding collisions and destroying targets. Built with Three.js and React Three Fiber, the game offers immersive gameplay with dynamic environments and challenging mechanics.

### How to Play

- Use **WASD** to move forward/backward and strafe left/right.
- Use **Space** to thrust up and **Shift** to thrust down.
- Use the **Mouse** to aim and click to shoot.
- Avoid colliding with asteroids to preserve health.
- Destroy all asteroids to win, or survive as long as possible.

### Features

- **3D Asteroid Field**: Randomly moving asteroids in a bounded 3D space, creating a dynamic and unpredictable environment.
- **Full 6-Degrees-of-Freedom Movement**: Move in all directions with smooth, physics-based controls.
- **Physics-Based Ship Controls**: Realistic inertia and thrust mechanics for immersive gameplay.
- **Mouse-Look Controls**: Pointer lock for precise aiming and navigation.
- **Dynamic Scoring System**:
  - Earn 100 points per target hit.
  - Accuracy multiplier boosts your score based on precision.
  - Misses reduce your accuracy and lower the multiplier.
- **Health System**:
  - Colliding with targets reduces health based on their size.
  - Game over occurs when health reaches zero.
- **Asteroid Splitting**:
  - Large asteroids split into smaller fragments when hit.
  - Fragments move faster and inherit unique colors.
- **Persistent Stats**:
  - Tracks high scores and best accuracy across sessions using local storage.
- **Visual Feedback**:
  - Targets change color when aimed at (e.g., green to orange).
  - Targets turn red and semi-transparent when hit.
  - Crosshair for precise aiming.
  - Red flash effect when the player is hit.
- **Game Over Screen**:
  - Displays final score, accuracy, and high score.
  - Option to restart the game.

### Controls

- **WASD**: Thrust controls for forward/backward and strafing left/right.
- **Space**: Thrust up.
- **Shift**: Thrust down.
- **Mouse**: Look/aim direction.
- **Click**: Shoot.
- **ESC**: Release mouse pointer.

### Technologies Used

- **Next.js**: Application framework.
- **Three.js and React Three Fiber**: 3D rendering and scene management.
- **Styled Components**: UI styling.
- **Local Storage**: Persistent high scores and stats.

## fps

- Controls the camera with WASD and mouse.
- Players object for managing hitboxes and health.
- Scene object to manage the setting and objects within it.

### Credit
 - 