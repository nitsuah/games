const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');

test.describe('Accessibility Audit', () => {
  const routes = ['/', '/asteroid', '/fps', '/space-invaders', '/pong', '/breakout', '/flappy', '/snake', '/memory-match', '/dodge-blocks'];

  for (const route of routes) {
    test(`Accessibility check for ${route}`, async ({ page }) => {
      await page.goto(route);
      await injectAxe(page);
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });
  }
});
