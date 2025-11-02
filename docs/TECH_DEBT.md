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
  - Identify code that may not be used or things we can remove (comments, dead code, unused assets, etc) but be predudent to understand what it is first and how it might be used or referenced before removing it.