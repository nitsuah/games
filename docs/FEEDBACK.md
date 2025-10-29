# GAME FEEDBACK for next PHASE/PATCH

If feedback is too complex, added next relative `PHASE.md` or if can be completed then add as a patch/commit to the current branch of work.

## Game Testing Feedback

This is feedback from recently play tests (the last phase so check other MD files ot confirm if fixes or feedback was already received). We can implement this during the next phase we work on.

- [ ] we can still "Shoot" and move between waves (the menu is up but we can shoot behind it still)
- [ ] The "inertia" space ship movement sucks. we just come to a halt instead of having some "drift" like asteroid should have. needs to feel more floaty and slippery.
- [ ] make the pickups slightly picker and spread them out more. they spawn too close together and are hard to grab the right one sometimes.
- [ ] i like the new shield! give it some pizzazz like invincibility but keep it "blue" themed.
- [ ] similarly invincibility needs some more pizazz. make it more like the shield but keep the random color theme.
- [ ] the speed boost is kind of useless since we have inertia movement. maybe make it increase acceleration and max speed more significantly to fix it?
- [ ] the shotgun is now "triple shot all of the time. should only do that when rapid fire is active. the spread is STILL too wide. SOUP CAN WIDE. needs to be much tighter spread.
- [ ] rapid fire is still kind of broken. for shotgun it fires the 3 then just stops (which seems to just be its default  behavior). it should loop until out of ammo or button released or timer for rapid fire ends. rapid fire still doesn't work as expected for the basic laser. but does work as expected for the explosion (control test to see if we should adjust some weapons that way.) tl;dr guns should really just go "FULL AUTO" until out of ammo or timer ends or button released.
- [ ] the explosion is still a bit too big. should be smaller and affect less targets similarly (so the radius should just change).
- [ ] score and accuracy still seem bugged out or not tracking/persisting properly.
- [ ] Pause menu appears but music/sound toggles don't work. music and sounds should stop when paused.
- [ ] Pause menu should have a restart button, but make it "confirm" style to avoid accidental restarts. similarly the quit button should have a confirm style prompt and redirect you back up a level to the main menu/home screen.
- [ ] keep ui elements consistent. the pause menu uses different fonts and styles than the rest of the game. should be uniform. also reorganize the hud elements to be more clear. move the power-up indicators to the top right corner near the ammo/health so all status indicators are in one area. move score to top left corner with wave indicator so all game progress info is in one area. health should in the top right corner with ammo and power-ups.
- [ ] slow motion should give a influenced effect to the player that time is slowed. maybe a purple tint or slight blur around the edges or something? tough as the entire background is black so not much to work with there. think on this
- [ ] when power ups are active they overlap the wave info so make sure all ui elements have enough space and don't overlap.
- [ ] the "reload" rate should show as a progress bar or something on the ammo indicator so we can see when we will be reloaded and ready to fire again - some weapons are "bolt-action" and have a visible reload time like explosion, vs laser is instant reload, vs. shotgun is in between those two extremes so we can see the reload time visually but config in their config and ensure we are moving in this direction more or less - especially during FULL AUTO rapid fire mode, the shotgun should fire 3 shots then have a visible reload time before it can fire again normally. but under rapid it should blast continuously until out of ammo or timer ends or button released. for explosion it can function as it does now both as it currently defaults and under rapid fire where reload is 0 but have a visible reload bar so we can see when it will be ready to fire again and the remaining ammo. but this way we can play around with ammo and reload differently to get different feels for each weapon. as well as different visual affects that affect the gameplay differently so we can easily tweak and toggle and add new gun varieties based on some basic core concepts and extrapolate/combine from there.
- [ ] 