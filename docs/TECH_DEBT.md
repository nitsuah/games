# Tech Debt & Improvements

**Last Updated**: November 2, 2025 (Phase 10)  
**Status**: 0 critical issues

---

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

- **Object pooling** for particles/effects - Reduce GC overhead
- **Spatial partitioning** for target-target collision - O(n) → O(n log n)
- **LOD system** - Reduce particle count at distance

### 3. Code Quality Improvements

**Priority:** Medium

- **JSDoc comments** - Better IDE support and documentation
- **TypeScript migration** - Consider gradual adoption for type safety
- **Performance monitoring** - Add metrics for game loop bottlenecks

---

## Resolved Items

### Target Velocity State Refactoring ✅

**Resolved**: Phase 9 (November 2, 2025)

- Converted from `speed` (scalar) to `vx, vy, vz` (velocity vectors)
- Added `mass` property for collision physics
- 32 tests updated and passing
- Enabled collision detection foundation
