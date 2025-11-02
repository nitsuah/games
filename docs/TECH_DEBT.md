# Tech Debt & Improvements

**Last Updated**: November 1, 2025 (Phase 9)  
**Status**: 0 critical issues

---

## 🔴 Critical Issues

_No critical issues at this time._

---

## 🟡 Medium Priority

### 1. Power-Up Config Testability

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

**Priority:** Medium - Would improve testability but current tests work

---

### 2. Target Velocity State Refactoring

**Files:** `lib/asteroid/_comp/Target/`, `lib/asteroid/_comp/Game/Game.jsx`  
**Severity:** Medium - Architecture  
**Phase 9 Blocker:** Required for target-target collision physics

**Issue:**
Targets currently only have `speed` (scalar) and `direction` (Vector3) properties. To implement full collision physics between targets, we need proper velocity state.

**Proposed Changes:**

```javascript
// Current target state
{
  speed: 0.02,           // Scalar
  direction: Vector3,    // Direction only
}

// Needed for Phase 9
{
  velocity: Vector3,     // Full velocity vector (speed + direction combined)
  mass: size,           // For collision calculations
  angularVelocity: 0,   // For rotation effects
}
```

**Impact:**
- Enables target-target collision physics
- Allows proper momentum transfer
- Required for Phase 9 Sprint 1

**Priority:** High - Blocks Phase 9 collision work

---

## 🟢 Low Priority

### 3. R3F Component Casing Warnings

**Files:** `LaserBeam.test.jsx`, `PlayerLogicInternalRef.test.jsx`  
**Severity:** Low - Console noise  

Test console shows warnings about incorrect casing for R3F primitives. Current approach: suppress in `jest.setup.js` (acceptable for R3F testing).

### 4. Markdown Linting

**Files:** Various docs  
**Severity:** Low - Formatting  

Minor markdown linting issues (MD022, MD032, MD040). Don't affect functionality.

---

## 📊 Code Quality Standards

### Current Good Practices ✅

1. **Error Handling** - Try-catch with console.warn, graceful degradation
2. **SSR Safety** - All browser APIs wrapped in typeof checks
3. **Constants** - Centralized in config files
4. **State Management** - Proper use of updater functions and refs
5. **Testing** - 169/169 tests passing, 17.31% coverage (realistic for R3F)

### Improvement Opportunities 💡

1. **JSDoc Comments** - Add type documentation for better IDE support
2. **TypeScript Migration** - Consider gradual migration for type safety
3. **Test Utilities** - Shared helpers for common mocks
4. **Performance Monitoring** - Add metrics for critical game loop paths

---

## 🚀 Phase 9 Considerations

### Immediate Needs
- **Target velocity refactoring** (Sprint 1 blocker)
- **Object pooling** for particles/effects (performance)
- **Spatial partitioning** for collision detection (optimization)

### Nice to Have
- Visual regression testing (Percy/Chromatic)
- Expanded E2E coverage (gameplay scenarios)
- Performance benchmarks (target generation, raycasting)
- API documentation (game logic functions)

---

## Priority Order

1. 🔥 **Target velocity state refactoring** - Required for Phase 9 Sprint 1
2. 🟡 **Power-up config testability** - Improve code quality
3. 🟡 **JSDoc comments** - Better developer experience
4. 🟢 **E2E test expansion** - More comprehensive testing
5. 🟢 **Performance monitoring** - Optimize bottlenecks

---

**Phase 8 Completion**: All critical tech debt resolved ✅  
**Next Focus**: Architectural changes for Phase 9 collision system
