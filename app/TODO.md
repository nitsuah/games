# Action Plan for Game Improvements

## Player Hit System

- Investigate why the player is not losing health on collision with targets.
- Check collision detection and event dispatching (likely a custom event or physics callback).
- Ensure `handleHealthDepletionFn` and `handlePlayerHitFn` are called correctly and health state updates.
- Add/verify visual/audio feedback for player hits.
- Write/expand tests for hit detection and health reduction.

## Power-Up Effects

- Review power-up collision logic: ensure effect functions (e.g., shield, rapid fire) are triggered on collect.
- Implement missing effect logic and ensure state updates (e.g., `shieldActive`, `rapidFireActive`).
- Add/adjust transparency and bobbing animation for power-ups (CSS or Three.js).
- Improve logging for power-up activation/deactivation.
- Add shield status to UI if not present.

## Game Over Logic

- Add checks for `health <= 0` and all targets destroyed.
- On game over, display overlay/message and stop all game actions (input, timers, sounds).
- Ensure restart logic resets all relevant state.
- Test edge cases (e.g., simultaneous last target and health loss).

## General Guidance

- Cross-check README features with code; update README if features are added/removed.
- Ensure all planned features in README are tracked in TODO/IDEAS.
- Add/expand unit and integration tests for all critical systems (health, power-ups, game over).
- Refactor duplicated logic and add comments for complex logic.
