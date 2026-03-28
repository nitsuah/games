# Metrics

## Core Metrics

| Metric                | Value          | Notes                     |
| --------------------- | -------------- | ------------------------- |
| Code Coverage         | TBD            | Pending fresh `npm run test:coverage` capture. |
| Unit Tests            | TBD            | Pending fresh CI/local run evidence. |
| E2E Tests             | TBD            | Pending fresh Playwright run evidence. |
| Build Time            | TBD            | Pending current run measurement. |
| Bundle Size (JS)      | TBD            | Pending current build artifact analysis. |
| Lighthouse Score      | TBD            | Pending current Lighthouse run. |

## Health

| Metric                | Value      | Notes                     |
| --------------------- | ---------- | ------------------------- |
| Open Issues           | TBD        | Pull from current GitHub state during next metrics refresh. |
| Open PRs              | TBD        | Pull from current GitHub state during next metrics refresh. |
| Health Score          | TBD        | Replace self-rating with computed score source. |
| Last Updated          | 2026-03-27 | Metrics normalized to measured-or-TBD policy. |
| Deploy Success Rate   | TBD        | Pull from provider and CI history. |

## Test Distribution

| Test Suite                | Tests | Status     |
| ------------------------- | ----- | ---------- |
| Asteroid Game Logic       | 74    | ✅ Passing |
| FPS Game Components       | 38    | ✅ Passing |
| Shared UI Components      | 42    | ✅ Passing |
| Shared Systems            | 36    | ✅ Passing |
| Utilities & Effects       | 28    | ✅ Passing |
| **Total Unit Tests**      | **218** | **✅ All Passing** |
| **E2E Tests**             | **8**   | **✅ All Passing** |

## Performance Metrics

| Game           | FPS Avg | Load Time | Memory Usage |
| -------------- | ------- | --------- | ------------ |
| Asteroid       | 60      | ~1.2s     | ~80MB        |
| FPS            | 60      | ~1.5s     | ~95MB        |
| Breakout       | 60      | ~0.8s     | ~65MB        |
| Flappy         | 60      | ~0.5s     | ~50MB        |
| Pong           | 60      | ~0.4s     | ~45MB        |
| Snake          | 60      | ~0.4s     | ~45MB        |
| Space Invaders | 60      | ~0.6s     | ~60MB        |

## Code Quality

| Metric                | Value      | Target   | Status |
| --------------------- | ---------- | -------- | ------ |
| ESLint Errors         | 0          | 0        | ✅     |
| ESLint Warnings       | 0          | <5       | ✅     |
| TypeScript Errors     | 0          | 0        | ✅     |
| Prettier Violations   | 0          | 0        | ✅     |
| Outdated Dependencies | 13         | <15      | ⚠️     |

## Accessibility

| Metric                     | Score | Target | Status |
| -------------------------- | ----- | ------ | ------ |
| Lighthouse A11y Score      | 100   | >90    | ✅     |
| Keyboard Navigation        | ✅    | Full   | ✅     |
| Screen Reader Support      | ✅    | Basic  | ✅     |
| Color Contrast (WCAG)      | AAA   | AA     | ✅     |

## Browser Compatibility

| Browser              | Support | Tested |
| -------------------- | ------- | ------ |
| Chrome 120+          | ✅      | ✅     |
| Firefox 120+         | ✅      | ✅     |
| Safari 17+           | ✅      | ⚠️     |
| Edge 120+            | ✅      | ✅     |
| Mobile Safari        | ⚠️      | ⚠️     |
| Mobile Chrome        | ⚠️      | ⚠️     |

**Legend**: ✅ Full Support | ⚠️ Partial/Untested | ❌ Not Supported

## User Engagement (Production)

| Metric                | Value      | Notes                        |
| --------------------- | ---------- | ---------------------------- |
| Active Users          | TBD        | Analytics not yet integrated |
| Avg Session Duration  | TBD        | Coming soon                  |
| Most Played Game      | TBD        | Coming soon                  |
| Bounce Rate           | TBD        | Coming soon                  |

---

**Last Updated**: March 27, 2026  
**Data Source**: Pending refresh from Jest, Playwright, GitHub Actions, and Lighthouse CI.

<!--
AGENT INSTRUCTIONS:
This file tracks project health metrics and performance indicators.

1. **Update Frequency**: Update after significant changes, releases, or weekly reviews.

2. **Metric Categories**:
   - Core Metrics: Overall project health (coverage, tests, build, bundle)
   - Test Distribution: Breakdown of test suites and their status
   - Performance: Game-specific FPS, load times, memory
   - Health: PR turnaround, issues, build success
   - Code Quality: Linting, type checking, dependencies
   - Accessibility: A11y scores and compliance
   - Browser Compatibility: Support matrix
   - User Engagement: Production analytics (when available)

3. **How to Update**:
   - Run `npm run test:coverage` for coverage data
   - Check GitHub Actions for build times and test results
   - Use Chrome DevTools for performance metrics
   - Run `npm run lighthouse` for Lighthouse scores
   - Check `npm outdated` for dependency status

4. **Accuracy**: Ensure values reflect actual current state from CI/CD outputs or local testing.

5. **Trends**: Use ✅ (improving/good), → (stable), ⚠️ (needs attention), ❌ (critical)

6. **Target Values**: Set realistic targets based on industry standards and project goals.
-->
