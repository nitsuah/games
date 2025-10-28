# Docs consolidation summary

This file explains what was consolidated and where the canonical documentation now lives.

Canonical docs:

- `docs/DEVELOPMENT_SETUP.md` — environment, install, build, run, debug tips
- `docs/COPILOT_ROADMAP.md` — multi-phase roadmap and Copilot prompts
- `docs/PHASE-3` — consolidated remaining todos, playtest checklist, and Lighthouse plan

Files merged/retired:

- `TODO.md` → now points to `docs/PHASE-3`
- `SESSION_IMPROVEMENTS.md` → contents merged into `PHASE-3` and `COPILOT_ROADMAP.md` as appropriate
- `HEALTH_SYSTEM_FIX.md` → preserved in `docs/` (consider archiving into `docs/changes/`)

Suggested next steps:

1. Run the playtest checklist in `docs/PHASE-3` and record outcomes beneath each checklist item (pass/fail, notes).
2. Run Lighthouse locally; if impossible, run via CI after approval to push branch.
3. Move historical one-off notes into `docs/archives/` for cleanup if you want a minimal docs set.

If you'd like, I can create `docs/archives/` and move the retired notes there.
