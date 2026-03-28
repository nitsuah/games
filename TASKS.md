# Tasks

Last Updated: 2026-03-28

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

## In Progress

## Todo

- [ ] Re-scope expansion work after platform issues are fixed.
  - Priority: P2
  - Milestone: 2026 Q3
  - Problem: feature growth should not outrun packaging, deployment, and runtime stability work.
  - Acceptance Criteria: larger feature initiatives stay sequenced behind the release-path fixes.

## Audit Notes

- Docker-first validation now succeeds locally, and CI has a dedicated Docker smoke workflow.
- Deployment model is now consistently documented as Next.js runtime on Netlify.
- The Asteroid route audio startup no longer emits repeated `Sound not found: bgm` errors after readiness gating and memoized sound controls.
