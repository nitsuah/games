# Roadmap

Last Updated: 2026-03-27

> Games Collection is live as a browser arcade with multiple playable routes, but the next planning phase should prioritize release reliability and documentation accuracy before further expansion.

## 2025 Q4 (Status: Completed)

- [x] Ship a live multi-game arcade foundation.
  - Shipped: homepage carousel, seven playable routes, CI/CD, Netlify deployment, and shared game systems.

- [x] Establish broad test and quality infrastructure.
  - Shipped: unit tests, E2E coverage, linting, formatting, and accessibility-focused work.

## 2026 Q1 (Status: In Progress)

- [ ] Release Path Reliability (Committed)
  - Objective: fix the broken Docker build path and document the true production hosting model.
  - Why Now: audit found the current Docker image does not build and deployment docs contradict actual runtime configuration.
  - Exit Criteria: Docker build succeeds, hosting model is unambiguous, and production instructions match reality.

- [ ] Live Runtime Stability (Committed)
  - Objective: remove audio initialization failures and other noisy runtime errors on deployed game routes.
  - Why Now: the live Asteroid route emits repeated `Sound not found: bgm` errors during first load.
  - Exit Criteria: no repeated production console errors during route load and gameplay start.

- [ ] Metrics Integrity Reset (Committed)
  - Objective: replace estimated/self-reported metrics with measured values or explicit blockers.
  - Why Now: current metrics contain unverifiable scores and optimistic placeholders.
  - Exit Criteria: core metrics are evidence-backed and dated.

## 2026 Q2 (Status: Planned)

- [ ] Platform Documentation Maturity (Committed)
  - Objective: add dedicated architecture and interface documentation for the arcade platform.
  - Scope: shared systems, route model, asset pipeline, deployment shape, and any external interfaces.
  - Exit Criteria: `ARCHITECTURE.md` and `API.md` or equivalent decision records are in place.

- [ ] Performance And Responsiveness Pass (Committed)
  - Objective: revisit object pooling, LOD, mobile responsiveness, and large-asset loading once build and runtime issues are stabilized.
  - Scope: game-loop performance, responsive layouts, and asset delivery quality.
  - Exit Criteria: platform-level performance goals are measured rather than assumed.

- [ ] Accessibility And UX Verification (Exploratory)
  - Objective: verify accessibility claims and game usability with current live routes.
  - Exit Criteria: a validated accessibility baseline and prioritized follow-up list.

## 2026 Q3 (Status: Planned)

- [ ] Feature Expansion After Platform Readiness (Committed)
  - Objective: only then prioritize leaderboards, difficulty settings, save data, achievements, and related progression features.
  - Sequencing Rationale: platform reliability and deployment clarity should precede player-data features.
  - Exit Criteria: one wave of progression features ships on top of a stable release path.

- [ ] New Game Evaluation (Exploratory)
  - Objective: assess whether additional arcade titles meaningfully improve the collection after core issues are addressed.
  - Exit Criteria: new-game work is backed by quality capacity and usage evidence, not just backlog ambition.

## 2026 Q4 (Status: Exploratory)

- [ ] Social / Multiplayer Layer
  - Objective: revisit multiplayer, authentication, and shared persistence only after the single-player arcade platform is operationally solid.
  - Exit Criteria: architecture decision and readiness checklist exist before implementation starts.

- [ ] Distribution Expansion
  - Objective: evaluate offline/PWA, desktop packaging, and other platform expansion options once deployment/runtime quality is stable.
  - Exit Criteria: a supported distribution strategy is chosen based on measured maintenance cost and user value.

<!--
AGENT INSTRUCTIONS:
This file tracks the project's high-level goals and future direction.
1. Organize items by Quarter (Q1, Q2, etc.) or time period.
2. Mark items as [x] when completed, move to appropriate section.
3. Add new strategic goals as they emerge from user requests or project needs.
4. Keep items high-level (features, milestones) not individual bug fixes.
5. Update "Last Updated" date when making significant changes.
6. Focus on realistic, achievable goals based on project velocity.
-->
