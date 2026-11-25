# Tasks

> 🧭 [games](../README.md) · [Features](./FEATURES.md) · [Roadmap](./ROADMAP.md) · **Tasks** · [Changelog](./CHANGELOG.md) · [Metrics](./METRICS.md) <!-- nav -->

Last Updated: 2026-11-24

## In Progress

_None._

## Todo

_The 2026 Q2 platform-reliability items (performance/asset audit, accessibility
pass, UX verification pass) and the 2026 Q3 coverage restoration are complete —
see `docs/FEATURES.md` / `docs/CHANGELOG.md`.
Mobile responsiveness work shipped, but `docs/METRICS.md`'s browser
compatibility table still lists Mobile Safari/Mobile Chrome as
partial/untested (⚠️) rather than confirmed — re-verify and update that table
before treating mobile as fully validated. The client-side exception (`ReferenceError: Cannot access 'ev' before
initialization`) that once blocked Docker loads is also resolved — Docker-first
validation now succeeds locally and in CI (see Audit Notes below); the old
handoff describing it as still in-progress was archived to
`docs/archive/INSTRUCTIONS.md`._

- [ ] Revisit the eslint 10 bump (#333, closed-unmerged #331) once `eslint-plugin-react` supports it.
  - Priority: P3
  - Type: Tech Debt · Confidence: High
  - Problem: `npm ci` fails with ERESOLVE because `eslint-plugin-react@7.37.5`, the latest release, peers on `eslint@^3 … ^9.7`. Re-checked 2026-10-01 with `npm view`: still 7.37.5, still no eslint 10 in the peer range. The issue was open but not tracked here.
  - Acceptance Criteria: once a plugin release accepts eslint 10, bump eslint, `npm run lint` passes in Docker, the eslint major-version `ignore` rule in `.github/dependabot.yml` is removed, and #333 is closed.
  - Status: Dependabot now ignores eslint major bumps for `/app` so it stops reopening a failing eslint 10 PR; #333 was closed as not planned (2026-11-18) and the watch moved to nitsuah/vigil#212, the canonical tracker.

- [x] Re-scope expansion work after platform issues are fixed.
  - Done 2026-11-24: the platform items are closed (see the Todo preamble: Q2 reliability, Q3 coverage and the Docker initialization error), no open issues remain in nitsuah/games, CI/docker-smoke are green, and `docs/ROADMAP.md` keeps expansion work sequenced behind the committed 2027 Q1 items ("Evaluate additional game work only once the committed items above are closed").
  - Priority: P2
  - Milestone: 2027 Q1
  - Problem: feature growth should not outrun packaging, deployment, and runtime stability work.
  - Acceptance Criteria: larger feature initiatives stay sequenced behind the release-path fixes.

- [ ] **[2027-Q1]** Fix game selection UI to allow programmatic and keyboard navigation for accessibility and automated testing.
  - Priority: P1
  - Type: Bug

- [ ] **Add high-score persistence to Memory Match** — the current implementation shows a win alert but does not persist a best-time or move-count score to localStorage.
  - Priority: P3
  - Milestone: 2027 Q1

- [x] **Mobile touch controls for Dodge Blocks** — tap the left or right half of the board to steer on touch screens.
  - Done: tap-to-steer (#407); on-screen buttons tracked in #409.
  - Priority: P3
  - Milestone: 2027 Q1

## Done

- [x] **Start-and-play e2e journeys for Breakout, Pong and Snake (#401)** — only Memory Match and Dodge Blocks had dedicated specs; these three were smoke-tested at best.
  - Priority: P2
  - Done 2026-11-24: `app/e2e/{breakout,pong,snake}.spec.js` start the game, press keys, assert a score/lives/GAME OVER outcome with no page errors, and check the pause menu Home control returns to `/`. Surfaced and fixed Snake's covered pause button/collapsed canvas and Breakout's frozen resume. Follow-up: Asteroid, Tank Battle, Invaders and Flappy journeys; Breakout TRY AGAIN after game over does not restart the render loop.

- [x] **Nightly live crawl of arcade.nitsuah.io** (#399) — scheduled `.github/workflows/live-crawl.yml` runs `app/e2e-live/crawl.spec.js` against production: the 10 routes answer 200 with no console or page errors, an unknown path is a 404. Failures file deduplicated `bot:journey` issues through the shared reporter.
  - Priority: P2
  - Done 2026-11-24.

- [x] **Add unit/E2E tests for Memory Match and Dodge Blocks** — both iframe-hosted games are live and playable but lack unit-level or gameplay-level E2E automated test coverage; the existing Jest suite does not cover the standalone HTML bundles.
  - Priority: P2
  - Milestone: 2027 Q1
  - Done 2026-10-09: Playwright E2E specs `app/e2e/memory-match.spec.js` and `app/e2e/dodge-blocks.spec.js` (8 tests) load the standalone game pages and exercise card flipping and player movement; they run in the existing CI `test:e2e` step. No unit tests: the game scripts have no exports, so pure logic is not importable without refactoring.

## Audit Notes

- Docker-first validation now succeeds locally, and CI has a dedicated Docker smoke workflow.
- Deployment model is now consistently documented as Next.js runtime on Netlify.
- The Asteroid route audio startup no longer emits repeated `Sound not found: bgm` errors after readiness gating and memoized sound controls.
- 2026-08-22 audit: Arcade now has 9 live games (up from 7 documented). Memory Match and Dodge Blocks are iframe-hosted standalone vanilla JS games. Documentation corrected across README.md, FEATURES.md, ROADMAP.md, docs/API.md. Unit test count updated to 481 (35 suites). Version numbers updated to match package-lock.json.
