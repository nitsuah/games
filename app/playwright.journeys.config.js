// @ts-check
// Nightly "AI user" journeys: the start-and-play specs in e2e/ (Breakout, Pong,
// Snake), run against the production build. Run by .github/workflows/journeys.yml
// through the shared nitsuah/.github harness, which files/dedups/closes
// `bot:journey` issues from the JSON report (contract: journeys/STANDARD.md).
//
// No screenshot baselines: the games draw to animated, randomised canvases that
// are not pixel-stable, so each journey asserts outcomes instead (score up, life
// lost, pause menu works). Locally: npx playwright test -c playwright.journeys.config.js
const { defineConfig, devices } = require('@playwright/test');

const PORT = 3100;

module.exports = defineConfig({
  testDir: './e2e',
  testMatch: /(breakout|pong|snake)\.spec\.js/,
  // Root-level test-results/ is what the shared harness uploads on failure.
  outputDir: '../test-results',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // pass-on-retry = flaky, not an issue
  // The JSON report feeds the shared bot:journey issue reporter (repo root).
  reporter: [['list'], ['json', { outputFile: '../journeys-report/report.json' }]],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    timeout: 480000,
    env: { NEXT_TELEMETRY_DISABLED: '1' },
  },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
