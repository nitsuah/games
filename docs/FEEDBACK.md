# FEEDBACK

Dev server running at [http://localhost:3000](http://localhost:3000)
Time to playtest! Go through this checklist for the Asteroid game:

## Health System - works

- Take damage from collisions (small/large targets) - works! but bigger targets should do more damage (didnt notice if they did)
- Health bar updates correctly - nit: move health bar down a bit, move reload, and ammo counter from center to below health bar (tl;dr: group all UI elements together)
- Red screen flash on damage - works!
- when health hits zero game over triggers - works! but game does not pause, targets keep moving. should pause game loop too.

## Power-ups (6 types)

- Shield (blue) - absorbs 3 hits, visual barrier - works! but is distracting. we should pick a pattern instead of polygons/wireframe/random noise. Also the shield hit counter is hard to see, maybe bigger font and different color? and organize in ui - also if we pickup another shield it should add to the total counters left (ie: if 3 and pickup new shield, go to 6, if 2 left and pickup new shield go to 5, etc.) but otherwise works well. it stops hits as expected and depletes correctly.
- Invincibility (yellow) - prevents damage 10s, yellow flash - this works really well! - maybe the yellow flash could be a bit more subtle? or add a glow effect instead of full flash
- Health restore (green) - +25 HP - also works well! we'll come back to this later - probably have it restore ammo as well in future
- Rapid fire (red) - near-instant cooldown 10s - i didnt see this powerup located anywhere? maybe give blocks/enemies a chance to drop it on destruction?
- Slow motion (purple) - targets slower 10s - this works really well!!!! im impressed!
- Speed boost (orange) - player faster 10s - this doesnt seem to work very well? i barely notice any speed increase. maybe double the speed increase amount? or scale the player speed significantly by 2.5x instead of 1.2x?

## Weapons

- Keys 1/2/3 switch weapons (spread/laser/explosive) - works well!
- Ammo depletes, 'R' reloads - but doesnt always seem to fill the max? cant tell if because out of ammo or something else? ex: explosive only reloads 5 at a time? maybe we intended to reload it slowly? like 3 clips or something. might be cool/different.
- Cooldowns display correctly - but should be re-organized in UI below health bar with ammo and reload

## Game Flow

- Game over triggers at health=0 - this works! but game loop should pause too
- Pause/Escape releases pointer lock - does not work, does not pause game or release pointer lock
- Restart (R) resets all state
- Scores persist to localStorage - seems to work although the stats for accuracy and high score seem broken (always 100%, so may not be picking up "misses" correctly) low priority though

## OTHER IDEAS

## BUGS

Report any bugs you find!
