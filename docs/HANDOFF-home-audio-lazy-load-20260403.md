# Handoff: Homepage Audio Lazy Load (2026-04-03)

## Summary
Implemented a performance-focused homepage optimization to avoid eager arcade BGM loading before the user opts in.

## What Changed
- Updated `app/_components/home/AudioController.tsx` so the `Audio` element is not created on mount.
- Added lazy creation via `getOrCreateAudio()` on first unmute interaction.
- Set `audio.preload = 'none'` to avoid prefetching the audio file during initial page load.
- Preserved mute/unmute behavior and existing error handling.

## Validation
- Docker-focused unit test:
  - `docker build --target test-unit -t games-test .`
  - `docker run --rm games-test npm run test:ci -- tests/home/AudioController.test.jsx`
- Result: 1 passed, 0 failed.

## Files
- `app/_components/home/AudioController.tsx`
- `app/tests/home/AudioController.test.jsx`
- `TASKS.md`
- `ROADMAP.md`
