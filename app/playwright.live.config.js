// @ts-check
// Nightly crawl of the deployed arcade (no local server). Run by
// .github/workflows/live-crawl.yml; locally: BASE_URL=https://arcade.nitsuah.io npx playwright test -c playwright.live.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e-live',
  // Root-level test-results/ is what the shared harness uploads on failure.
  outputDir: '../test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  // The JSON report feeds the shared bot:journey issue reporter (repo root).
  reporter: process.env.CI
    ? [['list'], ['json', { outputFile: '../journeys-report/report.json' }]]
    : 'list',
  use: {
    baseURL: process.env.BASE_URL || 'https://arcade.nitsuah.io',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
