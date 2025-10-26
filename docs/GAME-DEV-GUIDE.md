# Development Guidelines for Games Repository

## Core Principles

### 1. **Always Use WSL for Development**

- All terminal commands MUST run through WSL: `wsl bash -c "cd /mnt/c/path/to/games && <command>"`
- Verify environment before making changes
- Check Node.js version and dependencies are correct

### 2. **Test Before You Commit**

- **NEVER** add features without testing them first
- Start dev server and manually verify changes in browser
- Check browser console for errors
- Validate game mechanics actually work as intended

### 3. **No Bloat - Quality Over Quantity**

- Don't add features "just because" - every feature must serve the gameplay
- If adding UI components, ensure they're actually needed and functional
- Remove features cleanly if they don't fit (delete files, remove imports, update state)
- Keep codebase lean and maintainable

### 4. **Incremental Development with Validation**

```txt
For every feature:
1. Plan the change (what files, what logic)
2. Implement minimally (smallest working version)
3. Test immediately (run dev server, play the game)
4. Verify no regressions (check existing features still work)
5. Document if needed
6. Commit only if working
```

### 5. **Proper Code Hygiene**

- When removing features:
  - Delete all files (component + styles)
  - Remove all imports
  - Remove all state references
  - Remove all prop passing
  - Check for orphaned functions/handlers
  - Verify no console errors

- When adding features:
  - Add state in one place
  - Wire through props systematically
  - Test each connection point
  - Add error handling
  - Log critical paths for debugging

### 6. **Testing Strategy**

- **Manual testing is required** for all gameplay changes
- Eventually add automated tests:
  - Jest for unit tests (utility functions, game logic)
  - React Testing Library for component tests
  - Playwright for E2E gameplay tests
- Keep test files next to source files: `Game.test.jsx` beside `Game.jsx`

### 7. **File Organization**

```text
app/pages/{game}/_comp/
  Game/           # Main game logic and orchestration
  Player/         # Player-related components
  Target/         # Target/enemy components  
  UI/             # UI overlays and displays
  Weapons/        # Weapon systems
```

### 8. **State Management Patterns**

- Keep state as local as possible
- Pass callbacks down, not state setters (unless necessary)
- Use `useCallback` for handlers passed as props
- Document complex state dependencies
- Reset ALL state properly on game restart

### 9. **Error Handling**

- Check for errors after file edits: `get_errors`
- Add console.log for critical game events (hits, damage, power-ups)
- Handle edge cases (division by zero, null refs, etc.)
- Gracefully degrade if features fail

### 10. **Performance Considerations**

- Monitor FPS (we have FPSCounter now)
- Avoid creating objects in render loops
- Use refs for Three.js mesh positions
- Throttle expensive calculations
- Keep target counts reasonable

## Workflow Checklist

Before declaring a feature "done":

- [ ] Code compiles without errors
- [ ] Dev server starts successfully
- [ ] Feature works in browser
- [ ] No console errors
- [ ] No visual glitches
- [ ] Game still playable
- [ ] Restart works correctly
- [ ] All files properly cleaned up (no orphaned code)
- [ ] Dependencies are wired correctly
- [ ] Performance is acceptable

## Anti-Patterns to Avoid

❌ Adding features without testing them
❌ Leaving commented-out code
❌ Partial feature removals (leaving imports/state)
❌ Guessing at implementation without checking dependencies
❌ Adding UI that doesn't reflect actual game state
❌ Creating features that don't impact gameplay
❌ Forgetting to use WSL
❌ Not checking for compilation errors
❌ Adding multiple features simultaneously without testing between

## Example: Adding a New Power-Up

```javascript
// 1. Define in powerUpConfig.js
export const POWER_UP_TYPES = {
  // ... existing
  timeFreeze: {
    name: 'Time Freeze',
    color: '#4a90e2',
    duration: 5000,
  }
};

// 2. Add state in usePowerUps.js
const [timeFreezeActive, setTimeFreezeActive] = useState(false);

// 3. Add handler
const handleTimeFreezeActivation = useCallback(() => {
  setTimeFreezeActive(true);
  setTimeout(() => setTimeFreezeActive(false), 5000);
}, []);

// 4. Test in isolation
// - Start dev server
// - Trigger power-up manually
// - Verify state changes
// - Check visual feedback

// 5. Integrate with game logic
// - Pass to GameCanvas
// - Apply time scaling to targets
// - Add UI indicator
// - Test in actual gameplay

// 6. Verify no regressions
// - Check other power-ups still work
// - Check restart clears state
// - Check performance is good
```

## Git Workflow

```bash
# Always work in WSL
wsl bash -c "cd /mnt/c/path/to/games && git status"

# Before committing
wsl bash -c "cd /mnt/c/path/to/games/app && npm run dev"
# Test in browser
# Check for errors

# Commit only working code
wsl bash -c "cd /mnt/c/path/to/games && git add . && git commit -m 'feat: add time freeze power-up with full testing'"
```

## Communication

When reporting progress:

- ✅ "Added combo system: tested in browser, combo chains work, multiplier applies to score, resets on miss"
- ❌ "Added combo system" (untested, unknown state)

Be specific about what was verified and what still needs testing.

## Priority Order

1. **Correctness** - Does it work?
2. **Performance** - Is it fast enough?
3. **User Experience** - Is it fun?
4. **Code Quality** - Is it maintainable?
5. **Features** - What else can we add?

Never sacrifice 1-3 for 4-5.
