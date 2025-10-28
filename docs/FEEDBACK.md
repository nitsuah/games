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


app/tests/asteroid/_comp/Game/generateTargets.test.js
  });

  test('generates targets at different positions', () => {
    const targets = generateInitialTargets(4);
Copilot AI
32 minutes ago
This test call is missing the second parameter wave which is now required according to the updated function signature. Should be generateInitialTargets(4, 1) to test with wave 1.

Copilot uses AI. Check for mistakes.
@nitsuah	Reply...
app/pages/asteroid/_comp/Game/Game.jsx
Outdated
        setShowWaveTransition(false);
      }, 2000);
    }
  }, [targets, gameOver, paused, currentWave, highestWave, setHighestWave, setCurrentWave, setShowWaveTransition, setTargets]);
Copilot AI
32 minutes ago
The dependency array includes setter functions from useState which are stable and don't need to be included. Remove setHighestWave, setCurrentWave, setShowWaveTransition, and setTargets from the dependency array to prevent unnecessary re-renders.

Suggested change
  }, [targets, gameOver, paused, currentWave, highestWave, setHighestWave, setCurrentWave, setShowWaveTransition, setTargets]);
  }, [targets, gameOver, paused, currentWave, highestWave]);
Copilot uses AI. Check for mistakes.
@nitsuah	Reply...
app/pages/asteroid/_comp/Game/Game.jsx
    if (saved) {
      setHighestWave(parseInt(saved, 10));
    }
  }, [setHighestWave]);
Copilot AI
32 minutes ago
The dependency array includes a setter function from useState which is stable and doesn't need to be included. Remove setHighestWave from the dependency array.

Suggested change
  }, [setHighestWave]);
  }, []);
Copilot uses AI. Check for mistakes.
@nitsuah	Reply...
nitsuah added 2 commits 30 minutes ago
@nitsuah
fix: address V2 feedback batch 1 - wave loop, countdown, rapid fire, … 
6154b99
@nitsuah
fix: update import path for WEAPON_TYPES in powerUpConfig.js
7805840
@nitsuah nitsuah requested a review from Copilot 3 minutes ago
Copilot AI reviewed 2 minutes ago
Copilot AI left a comment
Pull Request Overview
Copilot reviewed 16 out of 16 changed files in this pull request and generated 3 comments.

💡 Add Copilot custom instructions for smarter, more guided reviews. Learn how to get started.

app/pages/asteroid/_comp/Game/Game.jsx
    const activeTargets = targets.filter((t) => !t.isHit);

    // When all targets destroyed, start next wave (but not on initial render when targets is empty)
    if (activeTargets.length === 0 && currentWave >= 1) {
Copilot AI
2 minutes ago
The condition currentWave >= 1 will always be true since currentWave starts at 1 and only increases. This could cause the wave transition to trigger on initial render when targets array is empty. Consider checking if targets.length > 0 initially or use a different condition to prevent false triggers.

Copilot uses AI. Check for mistakes.
@nitsuah	Reply...
app/lib/asteroid/_comp/Game/generateTargets.js
Comment on lines +73 to +75
  const baseCount = 10;
  const increment = Math.floor((wave - 1) / 2) * 2;
  return Math.min(baseCount + increment, 15);
Copilot AI
2 minutes ago
The magic numbers 10, 2, and 15 should be extracted as named constants for better maintainability. Consider defining TARGET_COUNT_BASE = 10, TARGET_COUNT_INCREMENT = 2, and TARGET_COUNT_MAX = 15.

Copilot uses AI. Check for mistakes.
@nitsuah	Reply...
app/_components/effects/powerUpConfig.js
Comment on lines +22 to +25
          const needsAmmo = Object.keys(prev).some((key) => {
            const maxAmmo = WEAPON_TYPES.find((w) => w.key === key)?.maxAmmo || 0;
            return prev[key] < maxAmmo;
          });
Copilot AI
2 minutes ago
The WEAPON_TYPES.find() call inside the loop is inefficient. Consider creating a lookup map once outside the function or caching the maxAmmo values to avoid repeated array searches.

Copilot uses AI. Check for mistakes.