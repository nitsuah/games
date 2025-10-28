---
mode: agent
---


# GitHub Copilot Instructions for Games Repository

## Environment Setup

**CRITICAL**: This project runs on Windows with native Node.js. Use PowerShell commands directly:

```powershell
cd c:\path\to\games
npm run <command>
```

Node.js and npm are installed natively on Windows.

## Development Philosophy

### 1. Test-Driven Iteration
- **NEVER** add code without testing it
- Start dev server: `npm run dev` (from app directory)
- Open browser to `http://localhost:3000`
- Manually test feature before declaring it done
- Check browser console for errors
- Verify game mechanics actually work

### 2. No Bloat - Ruthless Quality Control
**Principles:**
- Every feature must improve gameplay or developer experience
- If a feature doesn't work or fit, remove it completely (files + imports + state + props)
- Keep UI minimal and functional - only add displays that reflect real game state
- Prefer working simple features over broken complex ones
- Delete code > Comment out code

**Red Flags:**
- Adding UI components that don't reflect actual state
- Creating systems "for future use"
- Half-removing features (leaving orphaned imports/state)
- Adding multiple features without testing between them

### 3. Incremental Development with Validation

For every change:

```text
1. PLAN
   - Which files need changes?
   - What's the minimal implementation?
   - How will I test it?

2. IMPLEMENT
   - Make smallest working version
   - One logical change at a time
   - Keep changes focused

3. VALIDATE
   - Check compilation: get_errors tool
   - Start dev server in WSL
   - Test in browser
   - Check console for errors
   - Verify existing features still work

4. COMMIT (only if working)
   - Document what was tested
   - Note any known limitations
```

### 4. Proper Code Hygiene

**When Adding Features:**
- Add state in appropriate component (keep local when possible)
- Wire props systematically from parent → child
- Test each integration point
- Add console.log for critical game events (hits, damage, power-ups)
- Use `useCallback` for handlers passed as props
- Clean up timers/intervals in useEffect cleanup

**When Removing Features:**
```javascript
// Complete removal checklist:
// ✅ Delete component files (.jsx, .module.css)
// ✅ Remove imports from parent components
// ✅ Remove state declarations (useState, useRef)
// ✅ Remove prop drilling (parent → child)
// ✅ Remove handlers/callbacks
// ✅ Remove from render output
// ✅ Clean up any related useEffects
// ✅ Test that nothing breaks
```

### 5. Testing Requirements

**Manual Testing (Required for all changes):**
- Compile successfully
- Dev server starts
- Feature works in browser
- No console errors
- Game remains playable
- Restart functionality works

**Automated Testing (Implement gradually):**
- Unit tests for game logic (Jest)
- Component tests (React Testing Library)
- Integration tests for game flow
- Place test files next to source: `Game.test.jsx` beside `Game.jsx`

### 6. State Management Patterns

```javascript
// ✅ GOOD: Local state
const [combo, setCombo] = useState(0);

// ✅ GOOD: Callbacks for actions
const handleHit = useCallback(() => {
  setCombo(prev => prev + 1);
}, []);

// ⚠️ CAUTION: Passing setters
// Only when child needs full control
<Child setHealth={setHealth} />

// ✅ BETTER: Pass callback
<Child onDamage={(amount) => setHealth(h => h - amount)} />

// ✅ GOOD: Reset all state on restart
const restart = () => {
  setCombo(0);
  setMultiplier(1);
  // ... reset ALL game state
  if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
};
```

### 7. Three.js / React Three Fiber Patterns

```javascript
// ✅ Use refs for position updates (avoid re-renders)
const meshRef = useRef();
useFrame(() => {
  if (meshRef.current) {
    meshRef.current.position.x += velocity;
  }
});

// ✅ Clean up on unmount
useEffect(() => {
  return () => {
    // Dispose geometries, materials, textures
    geometry.dispose();
    material.dispose();
  };
}, []);

// ✅ Keep target counts reasonable (performance)
const MAX_TARGETS = 50;
```

### 8. File Organization

```text
app/pages/{game}/_comp/
  Game/              # Main game orchestration
    Game.jsx         # State management, coordination
    GameCanvas.jsx   # Three.js Canvas wrapper
    handleTargetHit.js
    handleMiss.js
    updateScore.js
    restartGame.js
    Game.test.jsx    # Tests next to implementation
    
  Player/            # Player-related components
    Player.jsx
    MovementControls.jsx
    
  Target/            # Enemies/targets
    Target.jsx
    CollisionDetection.jsx
    
  UI/                # HUD and overlays
    HealthBar.jsx
    ScoreDisplay.jsx
    ComboDisplay.jsx
    
  Weapons/           # Weapon systems
    ShootingSystem.jsx
    LaserBeam.jsx
```

### 9. Error Handling & Debugging

```javascript
// ✅ Add debugging logs for critical paths
console.log('Player hit! Health:', newHealth, 'Shield:', shieldActive);

// ✅ Handle edge cases
const accuracy = hits / (hits + misses || 1); // Prevent division by zero

// ✅ Validate refs before using
if (meshRef.current && meshRef.current.position) {
  meshRef.current.position.copy(newPosition);
}

// ✅ Check for errors after edits
// Use get_errors tool in conversation
```

### 10. Performance Considerations

```javascript
// ✅ Avoid object creation in render loop
// BAD:
useFrame(() => {
  const velocity = { x: 1, y: 0, z: 0 }; // New object every frame!
});

// GOOD:
const velocity = useRef({ x: 1, y: 0, z: 0 });
useFrame(() => {
  meshRef.current.position.x += velocity.current.x;
});

// ✅ Use FPSCounter component to monitor performance
// ✅ Throttle expensive calculations
// ✅ Batch state updates when possible
```

## Workflow Example: Adding a Feature

```javascript
// Example: Adding double score power-up

// STEP 1: PLAN
// Files to modify:
// - powerUpConfig.js (add config)
// - usePowerUps.js (add state + handler)
// - GameCanvas.jsx (pass prop)
// - PowerUpIndicator.jsx (add UI)
// - updateScore.js (apply multiplier)

// STEP 2: IMPLEMENT (one file at a time)

// powerUpConfig.js
export const POWER_UP_TYPES = {
  doubleScore: {
    name: 'Double Score',
    color: '#ffd700',
    duration: 10000,
  }
};

// Test: Check config loads without errors

// usePowerUps.js
const [doubleScoreActive, setDoubleScoreActive] = useState(false);

const handleDoubleScoreActivation = useCallback(() => {
  setDoubleScoreActive(true);
  setTimeout(() => setDoubleScoreActive(false), 10000);
}, []);

// Test: Manually call activation, verify state changes

// STEP 3: VALIDATE
// - Start dev server in WSL
// - Collect power-up in game
// - Verify UI shows active
// - Verify score doubles
// - Verify effect expires after 10s
// - Check console for errors

// STEP 4: COMMIT
// "feat: add double score power-up
// - Tested activation/deactivation
// - Verified score multiplier applies
// - Checked UI indicator displays correctly"
```

## Anti-Patterns to Avoid

❌ Adding features without testing them  
❌ Using PowerShell for npm commands (use WSL!)  
❌ Leaving commented-out code  
❌ Partial feature removals  
❌ Creating UI that doesn't reflect state  
❌ Adding multiple features simultaneously  
❌ Forgetting to check compilation errors  
❌ Not cleaning up timers/refs  
❌ Passing too much state down prop chains  

## Communication Style

When reporting progress:

✅ **Good**: "Added combo system. Tested in browser: combos chain correctly, multiplier applies to score, resets on miss/timeout. ComboDisplay shows at 2+ combo with pulsing animation."

❌ **Bad**: "Added combo system" (What was tested? Does it work?)

✅ **Good**: "Found issue: combo not resetting on game restart. Need to add combo state to restartGame.js."

❌ **Bad**: "Combo might not work" (Be specific about the problem)

## Priority Framework

1. **Correctness** - Does the code compile and run without errors?
2. **Functionality** - Does the feature work as intended?
3. **User Experience** - Is the gameplay improved?
4. **Performance** - Is it fast enough (60 FPS target)?
5. **Code Quality** - Is it maintainable and well-organized?
6. **Additional Features** - What else can we add?

Never sacrifice 1-4 for 5-6.

## Quick Reference Commands

```bash
# Start dev server
### Example Workflow
1. **Planning**: Review task requirements
2. **Implementation**: Write code with proper structure
3. **Testing**: Start dev server and verify functionality
4. **Validation**: Check console, test edge cases
5. **Cleanup**: Remove unused code, update imports

# Install packages
wsl bash -c "cd /mnt/c/path/to/games/app && npm install <package>"

# Run tests (when implemented)
wsl bash -c "cd /mnt/c/path/to/games/app && npm test"

# Check git status
wsl bash -c "cd /mnt/c/path/to/games && git status"

# Find files
wsl bash -c "cd /mnt/c/path/to/games && find app -name '*Component*'"
```

## Summary

The key to success in this repository:
1. **Always use WSL** for commands
2. **Test everything** before declaring it done
3. **Keep it lean** - no bloat, no broken features
4. **Iterate carefully** - small changes, frequent validation
5. **Clean up properly** - remove features completely or not at all
