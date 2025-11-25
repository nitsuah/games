# Tech Debt & Improvements

**Last Updated**: November 25, 2025  
**Status**: 0 critical issues | 3 medium priority items

---

## Active Items

### 1. Power-Up Config Testability

**File:** `app/_components/effects/powerUpConfig.js`  
**Priority:** Medium  
**Effort:** ~2 hours

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

**Benefits:**

- Easier unit testing with dependency injection
- Clearer separation of concerns
- Better testability with fake timers

### 2. Performance Optimization

**Priority:** High  
**Effort:** ~1 week

- [ ] **Object pooling** for particles/effects - Reduce GC overhead in game loop
- [ ] **LOD system** - Reduce particle count/complexity at distance
- [ ] **Performance monitoring** - Add FPS counter and frame time tracking
- [ ] **Bundle size analysis** - Identify opportunities for code splitting

**Impact:** 10-20% FPS improvement in intensive scenes

### 3. TypeScript Migration

**Priority:** Medium  
**Effort:** Ongoing (~2-3 weeks total)

**Status:** ~60% complete

**Remaining files to convert:**

- `app/_components/effects/powerUpConfig.js` → `.ts`
- `app/lib/*/components/*.jsx` → `.tsx`
- Game-specific utilities and helpers

**Benefits:**

- Better IDE support and autocomplete
- Catch type errors at compile time
- Improved code documentation
- Easier refactoring

### 4. Code Quality Improvements

**Priority:** Low-Medium  
**Effort:** Ongoing

- [ ] **JSDoc comments** - Document all public APIs and complex functions
- [ ] **Remove console.logs** - Clean up debug logging in production code
- [ ] **Standardize error handling** - Consistent patterns across games
- [ ] **Extract magic numbers** - Named constants for all numeric literals
- [ ] **Component size audit** - Split large files (>500 lines)

---

## Completed (Recent)

### November 2025

- ✅ Moved testing notes from JSDoc to inline comments (LivesManager)
- ✅ Enhanced useEffect dependency explanations (BreakoutGame, FlappyGame)
- ✅ Extracted PADDLE_SPIN_MULTIPLIER constant (PongGame)
- ✅ Fixed TypeScript types in GameCarousel
- ✅ Removed outdated documentation files (6 planning docs)
- ✅ Consolidated TECH_DEBT.md to actionable items

---

## Future Considerations

### Architectural Improvements

1. **Game Engine Abstraction**
   - Extract common game loop logic
   - Shared systems (input, audio, scoring)
   - Plugin architecture for features

2. **State Management**
   - Consider Zustand/Jotai for complex state
   - Centralized game state management
   - Time travel debugging

3. **Asset Pipeline**
   - Automated image optimization
   - Sound file compression
   - Sprite sheet generation
   - Preloading strategy

### Developer Experience

1. **Testing Infrastructure**
   - Visual regression testing (Percy/Chromatic)
   - Performance benchmarking suite
   - Automated E2E screenshot comparison

2. **Documentation**
   - Interactive component documentation (Storybook)
   - Architecture decision records (ADRs)
   - Contribution guidelines
   - Code style guide

3. **Tooling**
   - Hot module replacement optimization
   - Build time improvements
   - Better error messages in dev mode

---

**Notes:**
- Review this document monthly
- Prioritize items that block new features
- Balance tech debt work with feature development (80/20 rule)
- Document decisions in commit messages when addressing items

---

<!--
AGENT INSTRUCTIONS:
This file tracks technical debt and improvement opportunities.

1. **Organization:**
   - Active Items: Current priorities with effort estimates
   - Completed: Recent fixes with dates
   - Future Considerations: Long-term architectural improvements

2. **Adding Items:**
   - Include file paths, priority, effort estimate
   - Provide code examples for complex issues
   - Explain benefits/impact of fixing

3. **Priority Levels:**
   - Critical: Blocking issues, security vulnerabilities
   - High: Performance issues, user-facing bugs
   - Medium: Code quality, maintainability
   - Low: Nice-to-haves, minor improvements

4. **Effort Estimates:**
   - Quick: <1 hour
   - Short: 1-4 hours
   - Medium: 1-2 days
   - Long: >1 week

5. **Maintenance:**
   - Move completed items to "Completed" section with date
   - Archive items >3 months old quarterly
   - Update "Last Updated" date when making changes
   - Review and reprioritize monthly
-->
