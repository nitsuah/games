const { test, expect } = require('@playwright/test');

// Helper: dismiss the shared HowToPlay overlay — enforces it is always present
async function dismissHowToPlay(page) {
  const btn = page.getByRole('button', { name: /GOT IT/i });
  await expect(btn).toBeVisible({ timeout: 5000 });
  await btn.click();
}

test.describe('Mobile Landscape Optimization', () => {
  test.beforeEach(async ({ page }) => {
    // Set a common mobile landscape viewport
    await page.setViewportSize({ width: 896, height: 414 });
  });

  test('Home page layout in landscape mobile', async ({ page }) => {
    await page.goto('/');
    const heading = page.getByRole('heading', { name: /ARCADE/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('Asteroid game renders fullscreen in landscape mobile', async ({ page }) => {
    await page.goto('/asteroid');
    await dismissHowToPlay(page);
    await expect(page.locator('[data-testid="arcade-cabinet"]')).not.toBeVisible();
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 30000 });
  });

  test('FPS game renders fullscreen in landscape mobile and dismisses tutorial', async ({ page }) => {
    await page.goto('/fps');
    await dismissHowToPlay(page);
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 15000 });
  });

  test.skip('Space Invaders game renders fullscreen in landscape mobile and dismisses tutorial', async ({ page }) => {
    // Skipping due to CI canvas rendering issue
    await page.goto('/space-invaders');
  });

  test('Pong game renders fullscreen in landscape mobile and dismisses tutorial', async ({ page }) => {
    await page.goto('/pong');
    await dismissHowToPlay(page);
    await page.waitForSelector('canvas', { state: 'attached', timeout: 15000 });
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 15000 });
  });

  test.skip('Breakout game renders fullscreen in landscape mobile and starts game', async ({ page }) => {
    // Skipping due to CI canvas rendering issue
    await page.goto('/breakout');
  });

  test('Flappy game renders embedded and responsive in landscape mobile', async ({ page }) => {
    await page.goto('/flappy');
    await dismissHowToPlay(page);
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 15000 });
  });

  test('Snake game renders embedded and responsive in landscape mobile', async ({ page }) => {
    await page.goto('/snake');
    await dismissHowToPlay(page);
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 15000 });
  });

  test('Memory Match game renders embedded and responsive in landscape mobile', async ({ page }) => {
    await page.goto('/memory-match');
    const gameIframe = page.frameLocator('iframe[title="Memory Match"]');
    await expect(gameIframe.locator('body')).toBeVisible({ timeout: 15000 });
  });

  test('Dodge Blocks game renders embedded and responsive in landscape mobile', async ({ page }) => {
    await page.goto('/dodge-blocks');
    const gameIframe = page.frameLocator('iframe[title="Dodge the Blocks"]');
    await expect(gameIframe.locator('body')).toBeVisible({ timeout: 15000 });
  });
});
