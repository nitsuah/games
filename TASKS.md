# Tasks

Last Updated: 2026-03-27

## Done

- [x] Validate the deployed arcade homepage and one playable route.
  - Priority: P1
  - Type: Feature
  - Confidence: High
  - Evidence: `https://nitsuah-arcade.netlify.app/` loads successfully and the Asteroid route resolves at `/asteroid`.
  - Completed: 2026-03-27
  - Acceptance Criteria Met: homepage renders, game selection is visible, and an in-game HUD loads on a playable route.

- [x] Confirm governance files exist for standard contribution and PR flow.
  - Priority: P2
  - Type: Docs
  - Confidence: High
  - Evidence: `.github/pull_request_template.md` and `.github/ISSUE_TEMPLATE/bug_report.md` are present.
  - Completed: 2026-03-27
  - Acceptance Criteria Met: required GitHub workflow docs verified in repo.

## In Progress

- [ ] Re-baseline production-readiness planning against observed deployment and packaging behavior.
  - Priority: P0
  - Type: Docs
  - Confidence: High
  - Milestone: 2026 Q1
  - Problem Statement: current backlog is broad and generic, while audit evidence surfaced concrete release blockers not captured in active planning.
  - Why It Matters: planning needs to focus on the highest-risk issues affecting deployability and live gameplay quality.
  - Acceptance Criteria:
    - `TASKS.md` uses PMO quality fields and parser-safe sections.
    - `ROADMAP.md` reflects current live product state and release blockers.
    - stale or unsupported planning items are deprioritized or removed.
  - Dependencies: none.

## Todo

- [ ] Fix the Docker production build path.
  - Priority: P0
  - Type: Bug
  - Confidence: High
  - Milestone: 2026 Q1
  - Problem Statement: `docker build -t games-pmo-audit .` fails because the Dockerfile uses Node 20 while dependencies require Node 22+, production install runs the `prepare` script where `husky` is unavailable, and the repo has no `.dockerignore`.
  - Why It Matters: Docker-first validation is currently broken, so the documented production path cannot be trusted.
  - Acceptance Criteria:
    - Docker base image updated to a supported Node version.
    - dependency install no longer fails on `prepare` during image build.
    - `.dockerignore` added for `node_modules`, logs, test artifacts, and other local outputs.
    - `docker build` completes successfully from repo root.
  - Dependencies: none.

- [ ] Resolve the live audio initialization failure on deployed game routes.
  - Priority: P0
  - Type: Bug
  - Confidence: High
  - Milestone: 2026 Q1
  - Problem Statement: the deployed Asteroid route logs repeated `Sound not found: bgm` errors during load despite sound assets existing in `app/public/sounds/`.
  - Why It Matters: noisy runtime errors degrade confidence in live game quality and may hide real asset or initialization failures.
  - Acceptance Criteria:
    - reproduce and fix the `bgm` initialization race or registration gap.
    - verify no repeated audio errors on first load of a game route.
    - keep mute/blocked autoplay behavior graceful and silent in production.
  - Dependencies: local Node/browser debugging environment.

- [ ] Align deployment documentation with the actual hosting model.
  - Priority: P0
  - Type: Docs
  - Confidence: High
  - Milestone: 2026 Q1
  - Problem Statement: `README.md` describes static HTML export hosting, but `netlify.toml` uses `@netlify/plugin-nextjs`, `app/package.json` uses `next start`, and the Dockerfile runs a server-rendered Next.js build.
  - Why It Matters: contradictory deployment guidance creates release mistakes and weakens roadmap credibility.
  - Acceptance Criteria:
    - choose and document the canonical production model (static export vs Next.js runtime).
    - update `README.md`, deployment notes, and Docker guidance to match that model.
    - remove or explicitly mark unsupported deployment instructions.
  - Dependencies: none.

- [ ] Refresh `METRICS.md` with measured values or explicit `TBD` markers.
  - Priority: P1
  - Type: Docs
  - Confidence: High
  - Milestone: 2026 Q1
  - Problem Statement: current metrics include self-ratings and unverified values such as open PR count, health score, bundle size, Lighthouse score, and build time.
  - Why It Matters: PMO decisions should rely on observed evidence, not optimistic placeholders.
  - Acceptance Criteria:
    - replace estimates and self-ratings with measured data from CI or local runs.
    - mark blocked or unmeasured values as `TBD` with source notes.
    - update `Last Updated` when metrics are refreshed.
  - Dependencies: working Node toolchain or CI artifact access.

- [ ] Add dedicated architecture and interface documentation.
  - Priority: P1
  - Type: Docs
  - Confidence: Medium
  - Milestone: 2026 Q2
  - Problem Statement: architecture details exist inside `CONTRIBUTING.md`, but `ARCHITECTURE.md` and `API.md` are missing as standalone references.
  - Why It Matters: contributor onboarding and future expansion work need a canonical description of shared systems, page routing, and any external interfaces.
  - Acceptance Criteria:
    - create `ARCHITECTURE.md` for game/app/shared-system boundaries.
    - create `API.md` or an explicit “no external API” decision record.
    - cross-link both from `README.md`.
  - Dependencies: deployment model alignment.

- [ ] Re-scope expansion work after release-path issues are fixed.
  - Priority: P2
  - Type: Feature
  - Confidence: Medium
  - Milestone: 2026 Q3
  - Problem Statement: roadmap items such as new games, leaderboards, authentication, and multiplayer are currently planned ahead of basic packaging and live-runtime quality fixes.
  - Why It Matters: feature growth should not outpace release reliability and documentation accuracy.
  - Acceptance Criteria:
    - prioritize new feature work only after Docker/build/deployment/runtime tasks are closed or deliberately deferred.
    - sequence large initiatives behind clear platform readiness criteria.
  - Dependencies: Docker fix, audio fix, deployment docs alignment.

## Audit Notes

- Docker-first validation failed during image build.
- Node/npm are not available in the current shell, and the repo’s own setup script confirms the local toolchain is missing from PATH.
- The deployed arcade homepage loads and the Asteroid route is reachable, but the route emits repeated audio-related console errors during load.

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
