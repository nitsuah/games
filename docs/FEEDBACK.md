## GAME FEEDBACK V4

## Game Testing Feedback

- [ ] Silence the react-three primitive casing warnings inside the new test (small change). if you havent already.
- [ ] Improve HUD styling further (move control into a small pill or icon menu). 
- [ ] Add an integration E2E test (Playwright) to exercise the keyboard shortcut in a headless browser (heavier but more realistic).
- [ ] Add a small unit test to check that toggling 'T' updates localStorage via a focused test of Game.jsx (requires mocking window.localStorage which is already available).
- [ ] ui - the health bar should move to the top right but below the wave indicator. the text/and other gui indicators (not bars) should be on the lower right. (debug text) ex: weapon ammo count, position coords. just unbusy and re-organize it to make sense given the debug (lower right) vs user informative (top right)
- [ ] explosion is great, can speed up the decay of the beam slightly. decrease the size of the explosion and again slow it down so it sticks around more but is smaller.
- [ ] the laser is still offset weirdly. it should start lower down the center of the screen.
- [ ] shotgun still needs tighter grouping. make the spread angle smaller so its more of a tight cluster. make the projectiles even smaller visually too.
- [ ] fix the inertia on the movement controls. when you let go of a movement key, the ship should NOT stop immediately, it should coast to a stop. This is a space game after all.
- [ ] rapid fire still doesnt work but lowest priority. 