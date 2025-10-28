## FEEDBACK V2

- Game Selector - arcade home still has the whiteborder thing. like an app within an app or bad css or something. also lets jazz this up so it feels more like an arcade machine lobby

- speed boost still doesnt really work. really fucking crank it up so we know its working or not.

- shield is better, but should fade out and in. i actually liked the wireframe more. maybe do both? wireframe + fade occasionally so it feels like a shield.
- the ship movement is a bit too absolute. it should have some inertia. like if you let go of w, it should slowly decelerate instead of stopping immediately. same for turning.
- the sound effects are good, but could use some more variety. like different explosion sounds for different sizes of asteroids, or different hit sounds
- the power-up icons are good, but could use some more polish. like a glow effect or a pulsing animation to make them stand out more
- UI - the ui elements seem overlapped with each other. tidy stuff up. flat text stuff goes to the bottom right. the top should be FPS, then WAVE, then health, then "ammo selector" and ammo counter/bar. all the text can go to the bottom right. but any text on the bars or panels on the top right is fine. tl;dr its cluttered and should be better organized til we find permanent homes for stuff.
- the explosive weapon still only reloads to 5 instead of 10. the reload should just take longer compared to other weapons. add a reload bar animation i guess or something or increment it slowly after reload is pressed (but keep other logic like no shooting while reloading/etc.)
- the laser weapon is much better.
- rapid fire is still not working. it should feel like getting FULL AUTO on a gun. like hold down mouse button and it just sprays bullets nonstop until you run out of ammo. it should be a LOT faster rate of fire than the default weapon. like 5x or something.
- spread shot is good. but maybe make the spread a bit wider? also the projectiles should be a bit faster. it feels slow compared to other weapons. and the shots themselves should trail off so they aren't just solid spheres. maybe a small particle trail or something.
- for health spheres. make them also reload all weapons and ammo. but if we are full on health and ammo then do nothing. so they are like a "full restore" pickup always or they stick around for others.
- waves - this seems to work a bit but the loop/end/pause logic might need work there? it goes into game over instead of starting the next wave. also add a brief pause between waves with a "wave X starting in 3...2...1..." countdown overlay in the center of the screen might help.
