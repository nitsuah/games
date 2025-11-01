# Tech Debt & Improvements

## 🔴 Critical Issues

### 1. Shotgun Hit Detection Too Generous
**File:** `lib/asteroid/_comp/Weapons/weaponHandler.js`  
**Line:** ~30 (TODO comment in spread weapon logic)  
**Severity:** High - Affects game balance  

**Issue:**
```javascript
// TODO: Shotgun hit detection is too generous - hitting everything
```

The spread weapon (shotgun) is currently hitting targets outside its intended cone. This makes the weapon overpowered and reduces game difficulty.

**Root Cause:**
The spread weapon uses a buckshot pattern with convergence logic:
```javascript
case 'spread':
  const buckshot = 8;
  for (let i = 0; i < buckshot; i++) {
    const spread = (i - buckshot / 2) * 0.08;
    const convergence = 0.95;
    const angle = Math.atan(spread) * convergence;
    
    const spreadDir = new THREE.Vector3(
      direction.x + Math.sin(angle),
      direction.y,
      direction.z + Math.cos(angle)
    );
    // Raycasting logic...
  }
```

**Potential Issues:**
1. Angle calculation may be too wide (spread * 0.08 * convergence)
2. Raycast intersection logic might not check cone boundaries
3. Distance check might be too lenient
4. Spread direction vector calculation may be incorrect

**Suggested Fixes:**
1. **Reduce spread multiplier:** Change `0.08` to `0.04` or `0.05`
2. **Tighten convergence:** Change `0.95` to `0.85` or `0.9`
3. **Add angle validation:** Only register hits within intended cone angle
4. **Add distance falloff:** Reduce hit registration probability at longer distances

**Testing Approach:**
To properly test this, we would need:
- THREE.js test environment with raycasting
- Mock 3D scene with positioned targets
- Assertions on hit/miss patterns at various angles/distances

This is currently difficult because weaponHandler.js has 0% test coverage due to THREE.js dependencies.

**Refactoring Suggestion:**
Extract hit detection math into pure functions:
```javascript
// Pure functions (testable without THREE.js)
export const calculateSpreadAngle = (pelletIndex, totalPellets, spreadFactor, convergence) => {
  const spread = (pelletIndex - totalPellets / 2) * spreadFactor;
  return Math.atan(spread) * convergence;
};

export const isWithinCone = (angle, maxConeAngle) => {
  return Math.abs(angle) <= maxConeAngle;
};

export const calculateHitProbability = (distance, maxDistance) => {
  return Math.max(0, 1 - (distance / maxDistance));
};

// weaponHandler.js uses these functions
```

This would allow testing the math without mocking THREE.js.

---

## 🟡 Medium Priority

### 2. Power-Up Config Testability
**File:** `_components/effects/powerUpConfig.js`  
**Severity:** Medium - Code quality  

**Issue:**
Complex side effects with setTimeout logic make testing difficult. Each power-up effect directly manipulates state and calls setTimeout, making unit testing require heavy mocking.

**Suggested Refactoring:**
Extract duration management and state updates into separate functions:
```javascript
// Before: Mixed concerns
effect: ({ setSpeedBoostActive, showFlash }) => {
  setSpeedBoostActive(true);
  showFlash('orange', 100);
  setTimeout(() => {
    setSpeedBoostActive(false);
    showFlash('orange', 0);
  }, 10000);
}

// After: Separated concerns
effect: (context) => {
  activateSpeedBoost(context);
  scheduleDeactivation(context, 10000);
}
```

### 3. Test Mock Consistency
**Status:** ✅ FIXED  
**Files:** `handleTargetHit.test.js`, `loadSavedScores.test.js`  

Fixed issues:
- Spawn time consistency (milliseconds vs seconds)
- Mock setup in beforeEach blocks
- localStorage mocking pattern with Object.defineProperty

---

## 🟢 Low Priority

### 4. R3F Component Casing Warnings
**Files:** LaserBeam.test.jsx, PlayerLogicInternalRef.test.jsx  
**Severity:** Low - Console noise  

Test console shows warnings:
```
<spriteMaterial /> is using incorrect casing
<boxGeometry /> is using incorrect casing
<meshStandardMaterial /> is using incorrect casing
```

**Options:**
1. Suppress warnings in jest.setup.js (current approach)
2. Mock R3F components properly (not recommended - see TESTING_COVERAGE_REPORT.md)
3. Ignore - these are expected when testing R3F without proper mocking

### 5. Markdown Linting
**File:** `docs/TESTING_COVERAGE_REPORT.md`  
**Severity:** Low - Formatting  

Minor markdown linting issues:
- MD022: Missing blank lines around headings
- MD032: Missing blank lines around lists
- MD040: Missing language tags on code fences

These don't affect functionality but could be cleaned up for consistency.

---

## 📊 Code Quality Observations

### Good Practices Found ✅

1. **Consistent Error Handling**
   - Try-catch blocks with console.warn in development mode
   - Graceful degradation for localStorage failures
   - Pointer lock release error handling

2. **SSR Safety**
   - All browser API usage wrapped in typeof checks
   - `typeof window !== 'undefined'` before localStorage
   - `typeof document !== 'undefined'` before pointer lock

3. **Constants Organization**
   - Centralized config in `lib/asteroid/_comp/config.js`
   - Named exports for easy testing
   - Clear documentation of timing constants (MIN_ALIVE_TIME, etc.)

4. **State Management**
   - Consistent use of updater functions for setters
   - Proper ref usage for combo timers
   - No direct state mutations

### Potential Improvements 💡

1. **JSDoc Comments**
   - Add JSDoc to exported functions for better IDE support
   - Document parameter types and return values
   - Especially useful for game logic functions

2. **TypeScript Migration**
   - Consider gradual migration to TypeScript
   - Would catch type errors at compile time
   - Particularly valuable for complex game state

3. **Test Utilities**
   - Create shared test helpers for common mocks
   - Centralize localStorage mock setup
   - Shared factory functions for test data

4. **Performance Monitoring**
   - Add performance.mark/measure for critical paths
   - Track frame rates during power-up effects
   - Monitor target generation performance on high waves

---

## 🚀 Future Enhancements

### Visual Regression Testing
Tools like Percy or Chromatic could catch 3D rendering issues without heavy mocking. This would complement unit tests by verifying actual visual output.

### Expand E2E Coverage
Current Playwright tests (8 tests) cover basic navigation. Could add:
- Full game playthrough scenarios
- Power-up collection and effects
- Weapon switching and ammo management
- Game over and restart flows

### Performance Profiling
Add benchmarks for:
- Target generation at high wave counts
- Raycasting performance with many targets
- Power-up effect overhead
- Combo system calculations

---

## 📝 Documentation Needs

### API Documentation
- Document all exported game logic functions
- Create architecture diagram showing data flow
- Document state management patterns

### Game Design Documentation
- Weapon balance specifications
- Power-up effect durations and values
- Wave progression formulas
- Scoring and combo system rules

---

## Priority Order

1. 🔴 **Fix shotgun hit detection** - Impacts gameplay balance
2. 🟡 **Refactor weaponHandler for testability** - Enables better testing
3. 🟡 **Add JSDoc comments** - Improves maintainability
4. 🟢 **Clean up test console warnings** - Quality of life
5. 🟢 **Fix markdown linting** - Optional polish

---

**Last Updated:** Phase 7 Testing Sprint  
**Status:** 1 critical issue identified, testing infrastructure complete
