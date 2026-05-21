# Tasks

Last Updated: 2026-04-03

## Done

- [x] Validate the deployed arcade homepage and a playable route.
  - Completed: 2026-03-27
- [x] Confirm governance files exist for standard contribution and PR flow.
  - Completed: 2026-03-27
- [x] Fix the Docker production build path.
  - Completed: 2026-03-27
  - Evidence: `docker build -t games-devops-check .` now completes with Node 22 and install scripts disabled in-container.
- [x] Add CI Docker smoke coverage for build and runtime startup.
  - Completed: 2026-03-27
  - Evidence: `.github/workflows/docker-smoke.yml` now builds the image, starts the container, and verifies HTTP readiness.
- [x] Re-baseline release planning against observed deployment and runtime behavior.
  - Completed: 2026-03-27
  - Evidence: TASKS and ROADMAP now separate Docker-path completion from remaining deployment-model and runtime issues.
- [x] Refresh `METRICS.md` with measured values or explicit `TBD` markers.
  - Completed: 2026-03-27
  - Evidence: estimated metrics were replaced with explicit `TBD` placeholders and source-note guidance in `METRICS.md`.
- [x] Align deployment documentation with the actual hosting model.
  - Completed: 2026-03-27
  - Evidence: docs now consistently describe Netlify runtime deployment, and the stale GitHub Pages static-export CI deploy path was removed.
- [x] Resolve the live audio initialization failure on deployed game routes.
  - Completed: 2026-03-28
  - Evidence: `useSound` now exposes readiness and memoized handlers, and Asteroid BGM startup is gated on readiness to avoid startup race logs.
  - Validation: Docker image `games-audio-fix:local` was run and `/asteroid` was exercised without `Sound not found: bgm` console output.
- [x] Add dedicated architecture and interface documentation.
  - Completed: 2026-03-28
  - Evidence: added `ARCHITECTURE.md` and `API.md` and linked both from `README.md`.
- [x] Enable Docker-based test/coverage workflow (see README and METRICS.md)
- [x] Enable Docker-based E2E test workflow (see README and METRICS.md)
- [x] Defer homepage arcade audio asset loading until explicit user interaction.
  - Completed: 2026-04-03
  - Evidence: `app/_components/home/AudioController.tsx` now lazy-creates the audio element on unmute and sets `preload='none'`; verified by `app/tests/home/AudioController.test.jsx`.

## In Progress

- [ ] **[BLOCKED] Global client-side exception debugging** — All games fail to load in Docker due to a client-side ReferenceError. Last step: capture browser console logs from Dockerized app, diagnose, and fix. See docs/INSTRUCTIONS.md for handoff.

## Todo

- [ ] **[Q2] Performance audit and asset optimization** — identify and fix the largest asset/load-time bottlenecks across game routes.
  - Priority: P1
  - Problem: audio, sprites, and backgrounds are loaded eagerly on some routes; this hurts time-to-first-playable especially on mobile.
  - Acceptance Criteria: each game route loads its primary interactive surface within 3s on a simulated mid-tier mobile connection; large assets are lazy-loaded; METRICS.md updated with measured values.

- [ ] **[Q2] Mobile responsiveness and touch input** — verify all game routes work on phone/tablet viewports with touch input.
  - Priority: P1
  - Problem: games were built and tested primarily on desktop; touch controls and layout breakpoints have not been verified on real devices.
  - Acceptance Criteria: Asteroid and at least two other games are fully playable on iOS Safari and Android Chrome; no layout overflow or control dead zones; documented in METRICS.md.

- [ ] **[Q2] Accessibility pass** — resolve core a11y issues across game routes and the arcade homepage.
  - Priority: P2
  - Problem: game UI (HUD, scoreboard, menus) lacks ARIA labels, keyboard navigation, and sufficient color contrast in several spots.
  - Acceptance Criteria: no critical or serious a11y violations per axe-core; game control descriptions are accessible; color contrast meets WCAG AA.

- [ ] **[Q2] UX verification pass** — walk through all live game routes as a first-time user and document any friction or broken states found.
  - Priority: P2
  - Problem: no structured first-run walkthrough has been performed; hidden friction points and broken states may exist across routes that aren't caught by automated checks.
  - Acceptance Criteria: all live game routes exercised end-to-end; any friction or broken states logged as follow-up issues; findings summarized in METRICS.md or a dedicated audit note.

- [ ] Re-scope expansion work after platform issues are fixed.
  - Priority: P2
  - Milestone: 2026 Q3
  - Problem: feature growth should not outrun packaging, deployment, and runtime stability work.
  - Acceptance Criteria: larger feature initiatives stay sequenced behind the release-path fixes.

- [ ] Fix game selection UI to allow programmatic and keyboard navigation for accessibility and automated testing. [ui-improvements][high]

## Audit Notes

- Docker-first validation now succeeds locally, and CI has a dedicated Docker smoke workflow.
- Deployment model is now consistently documented as Next.js runtime on Netlify.
- The Asteroid route audio startup no longer emits repeated `Sound not found: bgm` errors after readiness gating and memoized sound controls.
