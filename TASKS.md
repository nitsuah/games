# Tasks

Last Updated: 2026-03-27

## Done

- [x] Validate the deployed arcade homepage and a playable route.
  - Completed: 2026-03-27
- [x] Confirm governance files exist for standard contribution and PR flow.
  - Completed: 2026-03-27

## In Progress

- [ ] Re-baseline release planning against observed deployment and runtime behavior.
  - Priority: P0
  - Problem: the backlog had drifted away from the concrete blockers surfaced by the audit.
  - Acceptance Criteria: TASKS.md and ROADMAP.md stay focused on release-path reliability and live runtime quality.

## Todo

- [ ] Fix the Docker production build path.
  - Priority: P0
  - Milestone: 2026 Q1
  - Problem: the current Docker build path breaks on Node version mismatch, the `prepare` script, and missing ignore rules.
  - Acceptance Criteria: the image builds cleanly from repo root with a supported Node version and a valid `.dockerignore`.

- [ ] Resolve the live audio initialization failure on deployed game routes.
  - Priority: P0
  - Milestone: 2026 Q1
  - Problem: the live Asteroid route emits repeated `Sound not found: bgm` errors during load.
  - Acceptance Criteria: the audio initialization issue is fixed and route load is quiet in production.

- [ ] Align deployment documentation with the actual hosting model.
  - Priority: P0
  - Milestone: 2026 Q1
  - Problem: README, Netlify, and Docker docs still disagree on whether the app is a static export or a Next.js runtime deployment.
  - Acceptance Criteria: one production model is documented consistently across README and deployment notes.

- [ ] Refresh `METRICS.md` with measured values or explicit `TBD` markers.
  - Priority: P1
  - Milestone: 2026 Q1
  - Problem: current metrics still include estimates and self-reported values.
  - Acceptance Criteria: metrics are measured from CI or local runs, or blocked values are marked `TBD` with source notes.

- [ ] Add dedicated architecture and interface documentation.
  - Priority: P1
  - Milestone: 2026 Q2
  - Problem: architecture details are scattered instead of being available as a focused reference.
  - Acceptance Criteria: `ARCHITECTURE.md` and `API.md` or a no-external-API decision record are added and linked from README.md.

- [ ] Re-scope expansion work after platform issues are fixed.
  - Priority: P2
  - Milestone: 2026 Q3
  - Problem: feature growth should not outrun packaging, deployment, and runtime stability work.
  - Acceptance Criteria: larger feature initiatives stay sequenced behind the release-path fixes.

## Audit Notes

- Docker-first validation failed during image build.
- The live arcade home page loads, but the Asteroid route still shows repeated audio-related console errors during startup.
