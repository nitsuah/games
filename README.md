# Games Collection

A collection of 3D web games built with Next.js, Three.js, and React Three Fiber.

## Asteroid

A first-person space target shooting game where you pilot a ship through space and shoot moving targets.

### Features
- Full 6-degrees-of-freedom movement (forward/back, left/right, up/down)
- Physics-based ship controls with inertia and thrust
- Mouse-look controls with pointer lock for immersive gameplay
- Moving targets that bounce within boundaries
- Dynamic scoring system:
  - Base score of 100 points per target hit
  - Accuracy multiplier that can double your score
  - Misses affect your accuracy and reduce score multiplier
- Persistent high scores and best accuracy tracking
- Visual feedback:
  - Green targets that turn orange when aimed at
  - Targets turn red and semi-transparent when hit
  - Crosshair for precise aiming
  - Score and stats display

### Controls
- WASD: Thrust controls for forward/back and strafing left/right
- Space: Thrust up
- X: Thrust down
- Mouse: Look/aim direction
- Click: Shoot
- ESC: Release mouse pointer

### Technologies Used
- Next.js for the application framework
- Three.js and React Three Fiber for 3D rendering
- Styled Components for UI styling
- Local Storage for persistent high scores

## fps

- Controls the camera with WASD and mouse.
- Players object for managing hitboxes and health.
- Scene object to manage the setting and objects within it.
