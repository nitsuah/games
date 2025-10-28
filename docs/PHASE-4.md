# Phase 4 — Stabilize, Playtest & Consolidate

This phase collects remaining work required to stabilize the repository, finish manual validation/playtests, and consolidate documentation so the project has a single source of truth.

Goals:
- Produce a canonical Lighthouse report locally and in CI.
- Manual playtest and validation for all critical gameplay flows.
- Consolidate docs and remove duplicates; make `docs/PHASE-3` the single remaining TODO list.

High-level tasks:

1) Lighthouse & Local Debugging
- Run Lighthouse locally using native Node.js and Chrome.
- Run Lighthouse (desktop) and save JSON report to `app/lighthouse-report.json`.
- If local run fails, push branch to remote (with approval) to run CI Lighthouse and fetch the report.

2) Playtest & Validation (manual)
- Health system: confirm damage on collision, UI updates, red flash, sound.
- Shield: collect shield power-up, confirm 3-hit absorption, visual barrier, indicator counter.
- Power-ups: validate all types (health, rapid-fire, slow motion, invincibility, speed boost), durations and indicators.
- Weapons: verify spread/laser/explosive behavior, ammo/cooldown and switching.
- Game-over & Restart: confirm game stops, pointer lock released, restart resets state and scores.
- Audio: confirm collision, shield, power-up and game-over sounds where configured.
- Accessibility: run `app/scripts/contrast-check.js` and verify no remaining low-contrast flags.

3) Tests & CI
- Add quick smoke E2E (Playwright or Puppeteer) to check main pages load and pointer-lock basic flow.
- Add the contrast-check script to CI as a non-blocking step initially.

4) Docs Consolidation
- Merge remaining TODOs and ad-hoc notes into `docs/PHASE-3` and remove or redirect the older `TODO.md`, `SESSION_IMPROVEMENTS.md`, and scattered notes.
- Create `docs/DOCS_CONSOLIDATION.md` describing where canonical docs live: `docs/DEVELOPMENT_SETUP.md`, `docs/COPILOT_ROADMAP.md`, `docs/PHASE-3`.

Acceptance criteria:
- `app/lighthouse-report.json` exists (local or CI) and is parsed for selectors to fix.
- Manual playtest checklist items marked as PASS/FAIL with any bugs filed as issues or TODO entries in `docs/PHASE-3`.
- CI includes the contrast-check script and passes or reports issues clearly.

Estimated time: 2-4 hours for local Lighthouse debug + 1-2 hours playtesting.

---

Playtest checklist (copyable):
- Start dev server: `npm run dev` (from app directory)
- Open http://localhost:3000/asteroid and test the following:
	- Health decreases on collisions (small/large targets)
	- Shield absorbs exactly 3 hits and shows visual indicator
	- Invincibility prevents damage for duration
	- Power-ups appear in top-right indicator with correct durations
	- Weapons switch and fire correctly; ammo/cooldowns function
	- Game over triggers and restart resets state
	- No low-contrast color pairs from `app/scripts/contrast-check.js`
