# Tasks

## Done

## In Progress

### Production Ready

- [ ] Performance optimization - Object pooling for particles/effects
- [ ] TypeScript migration - Convert remaining JavaScript files
- [ ] Mobile support - Touch controls and responsive layouts

## Todo

### High Priority

- [ ] Add JSDoc comments to all public APIs
- [ ] Implement global leaderboard system
- [ ] Add game difficulty settings (Easy/Normal/Hard)
- [ ] Performance monitoring dashboard

### Medium Priority

- [ ] Improve health power-up visual feedback
- [ ] Refactor restart logic across games
- [ ] Add service worker for offline support
- [ ] Implement achievement system
- [ ] Add replay/spectator mode

### Low Priority

- [ ] Add more sound effects and music tracks
- [ ] Create custom game skins/themes
- [ ] Add tutorial/help screens for each game
- [ ] Implement seasonal events system

### Tech Debt - Performance

- [ ] Object pooling for particles/effects - Reduce GC overhead
- [ ] LOD system - Reduce particle count at distance
- [ ] Performance monitoring - Add metrics for game loop bottlenecks

### Tech Debt - Code Quality

- [ ] JSDoc comments for shared systems
- [ ] Extract CSS from JSX files into separate stylesheets
- [ ] Improve test coverage for game logic (target 75%+)
- [ ] Standardize coding style with ESLint/Prettier
- [ ] Review and update dependencies

### Tech Debt - Refactoring

- [ ] Power-Up config testability - Extract setTimeout logic
- [ ] Identify high LOC files for potential splitting
- [ ] Modularize shared UI components further
- [ ] Remove dead code and unused assets
- [ ] Optimize asset loading (lazy loading, preloading)
- [ ] Minify large assets for faster load times

### Blocked

- [ ] Multiplayer support (waiting on backend architecture decision)
- [ ] User authentication (use Neon extension powers Netlify DB for serverless Postgres in one command.)

---

**Last Updated**: November 27, 2025

<!--
AGENT INSTRUCTIONS:
This file tracks specific actionable tasks organized by priority and status.
1. Categorize tasks into "In Progress", "Todo" (with priority), "Blocked", and "Done".
2. Add new tasks identified during code analysis, PRs, or planning sessions.
3. Mark tasks as [x] when verified as complete, move to "Done" section with date.
4. Keep task descriptions concise but actionable with clear acceptance criteria.
5. For "Blocked" tasks, note the blocker reason.
6. Review and prune "Done" section quarterly, archive very old items.
7. Update "Last Updated" date when making significant changes.
-->
