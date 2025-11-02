# Tech Debt & Improvements

**Last Updated**: November 1, 2025 (Phase 9)  
**Status**: 0 critical issues

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

### 2. Target Velocity State Refactoring ✅ COMPLETED

**Files:** `lib/asteroid/_comp/Target/`, `lib/asteroid/_comp/Game/generateTargets.js`, `lib/asteroid/_comp/Target/splitTarget.js`  
**Status:** ✅ Resolved in Phase 9  
**Resolution Date:** November 2, 2025

**Changes Made:**

- Converted all targets from `speed` (scalar) to `vx, vy, vz` (velocity components)
- Added `mass` property (equals target size)
- Updated Target.jsx to use velocity vectors
- Refactored splitTarget.js for velocity-based split mechanics
- Updated generateTargets.js to create targets with velocity components
- All 32 related tests updated and passing

**Result:**

- Foundation for target-target collision physics complete
- Elastic collision system implemented in `lib/shared/physics/CollisionDetection.js`
- Momentum transfer calculations working correctly
- 15 collision physics tests passing

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

## 🚀 Phase 10 Considerations

### Performance Optimization

- **Object pooling** for particles/effects - Reduce garbage collection overhead
- **Spatial partitioning** for target-target collision - O(n) instead of O(n²)
- **LOD system** - Reduce particle count at distance

### Code Quality

- **JSDoc comments** - Better IDE autocomplete and documentation
- **Power-up config testability** - Extract timeout logic for easier testing
- **TypeScript migration** - Consider gradual migration for type safety

### Testing & Validation

- Visual regression testing (Percy/Chromatic)
- Expanded E2E coverage (gameplay scenarios, power-ups, weapons)
- Performance benchmarks (target generation, raycasting, collision detection)
- Manual QA session with FEEDBACK.md checklist

---

## Priority Order for Phase 10

1. 🟡 **Power-up config testability** - Improve code quality
2. 🟡 **JSDoc comments** - Better developer experience
3. 🟡 **Object pooling** - Performance optimization
4. 🟢 **E2E test expansion** - More comprehensive testing
5. 🟢 **Performance monitoring** - Identify bottlenecks

---

**Phase 9 Completion**: All tech debt items addressed or deferred ✅  
**Next Focus**: Performance optimization and polish for Phase 10
