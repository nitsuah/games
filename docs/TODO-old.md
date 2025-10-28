# TODO.md - AGENT_INSTRUCTIONS — games (JS game experiments)

## Repo purpose
Small JavaScript game experiments — likely browser-based prototypes. Goal: make at least one demo runnable locally and on GitHub Pages.

## Goals (priority)

1. Identify the best game demo and make it one-click runnable in `index.html`.
2. Add `README.md` with play instructions and keyboard mappings.
3. Add a small GH Pages workflow or `vercel.json` for deployment.
4. Add a minimal test: smoke test to ensure build works (if using bundler).

## Quick checks

- Look for `index.html`, `package.json`, `src/`, `dist/`.
- Try `open index.html` in browser or `npm run start`.

## Concrete tasks

### A. README

- TL;DR + how to play + controls + screenshot or animated GIF (or link to deployed demo).

### B. Make demo runnable

- If plain static files: add `index.html` at repo root that loads the game.
- If uses bundler (parcel/webpack): add `scripts` in `package.json`:
  ```json
  "scripts": {
    "start": "parcel index.html",
    "build": "parcel build index.html"
  }
Add .nojekyll for GH Pages root deployment if needed.

C. Deploy
Add .github/workflows/pages.yml for GitHub Pages (or a vercel.json).

The workflow should actions/checkout, setup-node, npm ci, npm run build, peaceiris/actions-gh-pages to push dist/.

E. Lighthouse CI + GitHub Actions troubleshooting
------------------------------------------------

If you run the `treosh/lighthouse-ci-action@v10` action and see errors during artifact upload like:

  Error: Create Artifact Container failed: The artifact name lighthouse-results is not valid

then the CI run is failing at the artifact upload step. Common fixes and mitigations:

- Use a shorter/simple artifact name and avoid characters that some artifact APIs reject. Example safe names:
  - `lhci-results`
  - `lh-results-${{ github.run_id }}`

- Ensure the action input uses that name, for example in your workflow step:

  - name: Run Lighthouse CI
    uses: treosh/lighthouse-ci-action@v10
    with:
      urls: |
        https://example.com
      artifact_name: "lhci-results-${{ github.run_id }}"

- Make the upload non-blocking (optional): you can wrap the upload in a try/continue step or pass `continue-on-error: true` for the artifact upload step to avoid blocking the overall build while you debug.

- If your runner environment is behind a proxy or a restricted network (corporate runners, self-hosted), ensure `actions/upload-artifact` is permitted and that artifact size is within limits.

- For immediate CI stability, disable artifact upload temporarily and re-enable once the name and environment are validated.

Action items to resolve this repo's immediate problem:

1. Change the Lighthouse action config to use a short artifact name (e.g., `lhci-results-${{ github.run_id }}`) and re-run the workflow.
2. If the artifact step still fails, add `continue-on-error: true` to the artifact upload step to avoid blocking other CI steps while we investigate.
3. Add this troubleshooting note to the repo `TODO.md` (done) and create a tracked todo item so we fix the workflow properly (CI caching, artifact name, and optional artifact retries).

If you'd like, I can draft the exact GitHub Actions workflow patch (no push) and validate it locally using `act` or by running a test run in a disposable branch—say the word and I'll create the draft.


D. Small polish
Add controls.md or controls section in README.

Create examples/ with screenshots.

Files to create
README.md

.github/workflows/pages.yml

package.json scripts updated (if needed)

### Commands for agent

```bash
# if node project
npm ci
npm run start
# build
npm run build
Acceptance
Demo loads from index.html locally and from deployed GH Pages link.
```
