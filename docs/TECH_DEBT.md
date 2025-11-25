# Tech Debt & Improvements

**Last Updated**: November 2, 2025 (Phase 10)  
**Status**: 0 critical issues

---

## PR Feedback

for games/ repo --- app/_components/effects/ShellCasing.jsx
  // Calculate ejection velocity (to the right of firing direction)
  const initialState = useMemo(() => {
    const right = new THREE.Vector3();
    if (!direction) return { velocity: new THREE.Vector3(), angularVelocity: new THREE.Vector3(), rotation: new THREE.Euler() };
Copilot AI
yesterday
The early return creates inconsistent state by returning objects that don't match the expected structure. The function should ensure consistent initialization. Consider restructuring to handle the null case more safely, such as using a default direction vector or throwing an error if direction is required. .github/workflows/ci-cd.yml
Comment on lines 39 to 42
        echo "-- Print tested command --"
        echo "npm run test:ci --if-present"
        echo "-- Print environment vars relevant to Node/NPM --"
        env | grep -E "NODE|NPM|PATH" || true
    - name: Run type checking
Copilot AI
yesterday
The YAML structure is broken with commands from the 'Install Playwright' step (lines 33-41) appearing after the step definition ended at line 32, followed by a new step definition at line 42 without proper indentation. This creates invalid YAML that will fail CI parsing.   app/_components/home/GameCarousel.tsx

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayMode]);
Copilot AI
20 hours ago
Missing dependency 'games.length' in useEffect dependencies array. The effect uses games.length in the keydown handler but doesn't include it in the dependency array, which could lead to stale closure issues.

Suggested change
  }, [displayMode]);
  }, [displayMode, games.length]);
Copilot uses AI. Check for mistakes.
@nitsuah	Reply...
app/lib/breakout/BreakoutGame.tsx
                timeoutRef.current = null;
            }
        };
    }, []);
Copilot AI
20 hours ago
The useEffect has an empty dependency array but uses 'setScore', 'setLives', 'setLevel', 'setGameOver', and 'setHighScore' from useState. While React guarantees these are stable, the component also relies on the 'gameState' ref which could be problematic. Consider adding these dependencies or documenting why they're intentionally omitted.

Copilot uses AI. Check for mistakes.
@nitsuah	Reply...
app/lib/flappy/FlappyGame.tsx
      window.removeEventListener('mousedown', handleInput);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);
Copilot AI
20 hours ago
The useEffect depends on 'gameState' which is a ref object. This dependency will never trigger a re-run because refs don't cause re-renders when their values change. Consider depending on the actual state values that should trigger effect re-runs, or remove this dependency.

Copilot uses AI. Check for mistakes.
@nitsuah	Reply...
app/lib/space-invaders/SpaceInvadersGame.tsx
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
Copilot AI
20 hours ago
The useEffect has an empty dependency array but uses 'setScore', 'setLives', 'setLevel', 'setGameOver', and 'setHighScore' from useState. While these are stable, the game loop closure captures these functions. Consider documenting why the empty dependency array is intentional.

Copilot uses AI. Check for mistakes.
@nitsuah	Reply...
app/lib/snake/SnakeGame.tsx
            state.isRunning = false;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
Copilot AI
20 hours ago
The useEffect has an empty dependency array but uses 'setScore', 'setHighScore', and 'setGameOver' from useState. While these are stable, consider documenting why the empty dependency array is intentional for clarity.

Copilot uses AI. Check for mistakes.
@nitsuah	Reply...
app/lib/pong/PongGame.tsx
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);
Copilot AI
20 hours ago
The useEffect has an empty dependency array but uses 'setPlayerScore', 'setAiScore', 'setGameOver', and 'setWinner' from useState. While these are stable, consider documenting why the empty dependency array is intentional.


## Active Items

### 1. Power-Up Config Testability

**File:** `_components/effects/powerUpConfig.js`  
**Priority:** Medium  

Complex setTimeout logic makes testing difficult. Consider extracting duration management:

```javascript
// Current: Mixed concerns
effect: ({ setSpeedBoostActive, showFlash }) => {
  setSpeedBoostActive(true);
  showFlash('orange', 100);
  setTimeout(() => setSpeedBoostActive(false), 10000);
}

// Refactor: Separated concerns
effect: (context) => {
  activateSpeedBoost(context);
  scheduleDeactivation(context, 10000);
}
```

### 2. Performance Optimization

**Priority:** High (Phase 10)

- [ ] **Object pooling** for particles/effects - Reduce GC overhead
- [ ] **LOD system** - Reduce particle count at distance

### 3. Code Quality Improvements

**Priority:** Medium

- **JSDoc comments** - Better IDE support and documentation
- **TypeScript migration** - Consider gradual adoption for type safety
- **Performance monitoring** - Add metrics for game loop bottlenecks

### Cleanup and Refactoring

- Go through every single file and folder with a fine tooth comb. identify the areas of improvement such as:
  - Identify high line of code files for potential splitting
  - Remove any css from jsx files and place in separate standard css files
  - Modularize shared UI components or commonly used functions or utilities
  - Improve test coverage for critical game logic functions
  - Standardize coding style with ESLint/Prettier configurations
  - Review and update dependencies to latest stable versions
  - Validate our CI checks for code quality and test coverage
  - Document architecture decisions in `docs/ARCHITECTURE.md`
  - Minify any large assets (images/sounds) for faster load times
  - Optimize asset loading with lazy loading or preloading strategies
  - Implement caching strategies for frequently used data or assets
  - Identify code that may not be used or things we can remove (comments, dead code, unused assets, etc) but be prudent to understand what it is first and how it might be used or referenced before removing it.
