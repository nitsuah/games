# Documentation Consolidation Guide

**Last Updated**: October 28, 2025

This guide describes the canonical documentation structure for the Games repository. All documentation has been consolidated to avoid duplication and confusion.

---

## 📚 Canonical Documentation Structure

### Primary Documents (Single Source of Truth)

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **`PHASE-3.md`** | Current sprint tasks, playtest checklist, backlog | Daily task tracking, bug tracking, feature planning |
| **`DEVELOPMENT_SETUP.md`** | Setup instructions, architecture, debugging | Onboarding new devs, troubleshooting issues |
| **`COPILOT_ROADMAP.md`** | Long-term vision, phased improvement plan | Strategic planning, quarterly reviews |
| **`PHASE-4.md`** | Current phase goals (Stabilize & Consolidate) | Phase 4 objectives and acceptance criteria |

### Supporting Documents

| Document | Purpose | Status |
|----------|---------|--------|
| **`IDEAS.md`** | Feature brainstorming, future concepts | Active - ideas migrate to PHASE-3.md when prioritized |
| **`FEEDBACK.md`** | User feedback collection | Placeholder - to be populated |
| **`README.md`** | Overview of games and features | Active - high-level summary |
| **`TODO.md`** | **DEPRECATED** - Redirects to PHASE-3.md | Redirects only |

---

## 🔄 Workflow: From Idea to Implementation

```
1. Brainstorm → Add to IDEAS.md
2. Prioritize → Move to PHASE-3.md backlog
3. Sprint Planning → Move to PHASE-3.md "Current Sprint"
4. Implementation → Update DEVELOPMENT_SETUP.md if setup changes
5. Complete → Mark done in PHASE-3.md, update README.md if user-facing
```

---

## 📝 Documentation Standards

### When to Update Each Document

#### Update `PHASE-3.md` when:
- Starting a new task
- Completing a task
- Finding a bug
- Adding to backlog
- Updating playtest results

#### Update `DEVELOPMENT_SETUP.md` when:
- Adding dependencies
- Changing dev workflow
- Fixing setup issues
- Updating architecture
- Adding debugging tips

#### Update `COPILOT_ROADMAP.md` when:
- Completing a major phase
- Changing strategic direction
- Quarterly planning
- Major architecture changes

#### Update `README.md` when:
- Releasing new features
- Changing how to play
- Major version updates

---

## 🗂️ File Organization

```
docs/
├── PHASE-3.md              ← MAIN TODO LIST (daily use)
├── DEVELOPMENT_SETUP.md    ← Setup & architecture
├── COPILOT_ROADMAP.md      ← Long-term vision
├── PHASE-4.md              ← Current phase goals
├── IDEAS.md                ← Feature ideas
├── FEEDBACK.md             ← User feedback
├── README.md               ← Project overview
├── TODO.md                 ← DEPRECATED (redirects)
└── DOCS_CONSOLIDATION.md   ← This file

app/
└── (application code)
```

---

## ✅ Consolidation Checklist

- [x] Created `PHASE-3.md` as single source of truth for tasks
- [x] Updated `TODO.md` to redirect to `PHASE-3.md`
- [x] Created `DOCS_CONSOLIDATION.md` (this file)
- [x] Verified `DEVELOPMENT_SETUP.md` is up to date
- [x] Verified `COPILOT_ROADMAP.md` reflects Phase 1-3 completion
- [ ] Archive or remove old session notes (if any exist)

---

## 🎯 Quick Reference

**Need to:** | **Go to:**
-------------|------------
See current tasks | `PHASE-3.md`
Set up development environment | `DEVELOPMENT_SETUP.md`
Understand project vision | `COPILOT_ROADMAP.md`
Propose new feature | `IDEAS.md` → then `PHASE-3.md` backlog
Report bug | `PHASE-3.md` Known Issues section
Check Phase 4 goals | `PHASE-4.md`

---

## 📋 Maintenance

- Review `PHASE-3.md` daily during active development
- Review all docs monthly for accuracy
- Archive completed phase documents (PHASE-1, PHASE-2, etc.) when no longer needed
- Update this consolidation guide when adding new canonical docs

---

**Remember**: When in doubt, `PHASE-3.md` is the single source of truth for what needs to be done!
