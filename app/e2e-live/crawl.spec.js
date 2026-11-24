const { test, expect } = require('@playwright/test');

// Every public route of the deployed arcade must answer 200 and load without
// console errors or uncaught page errors; an unknown path must 404.
const ROUTES = [
  '/',
  '/asteroid',
  '/fps',
  '/breakout',
  '/space-invaders',
  '/flappy',
  '/snake',
  '/pong',
  '/memory-match',
  '/dodge-blocks',
];

for (const route of ROUTES) {
  test(`live crawl: ${route} loads clean`, async ({ page }) => {
    const problems = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') problems.push(`console: ${msg.text()}`);
    });
    page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

    await test.step('responds 200', async () => {
      const response = await page.goto(route, { waitUntil: 'load' });
      expect(response?.status()).toBe(200);
    });
    await test.step('no console or page errors', async () => {
      // Let late client-side errors (hydration, asset loads) surface.
      await page.waitForLoadState('networkidle').catch(() => {});
      expect(problems).toEqual([]);
    });
  });
}

test('live crawl: unknown path is a 404', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist-crawl', { waitUntil: 'load' });
  expect(response?.status()).toBe(404);
});
