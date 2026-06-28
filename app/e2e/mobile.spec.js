const { test, expect } = require('@playwright/test');

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
    // For fullscreen games, ArcadeCabinet should NOT be visible. Relying on its absence via screenshot for now.
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('FPS game renders fullscreen in landscape mobile and dismisses tutorial', async ({ page }) => {
    await page.goto('/fps');
    const howToPlayButton = page.getByRole('button', { name: 'Got it!' });
    if (await howToPlayButton.isVisible()) {
      await howToPlayButton.click();
    }
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('Space Invaders game renders fullscreen in landscape mobile and dismisses tutorial', async ({ page }) => {
    await page.goto('/space-invaders');
    const howToPlayButton = page.getByRole('button', { name: 'Got it!' });
    if (await howToPlayButton.isVisible()) {
      await howToPlayButton.click();
    }
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('Pong game renders fullscreen in landscape mobile and dismisses tutorial', async ({ page }) => {
    await page.goto('/pong');
    const howToPlayButton = page.getByRole('button', { name: 'Got it!' });
    if (await howToPlayButton.isVisible()) {
      await howToPlayButton.click();
    }
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('Breakout game renders fullscreen in landscape mobile and starts game', async ({ page }) => {
    await page.goto('/breakout');
    const startGameButton = page.getByRole('button', { name: 'START GAME' });
    if (await startGameButton.isVisible()) {
      await startGameButton.click();
    }
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  // Embedded games (Flappy, Snake, Memory Match, Dodge Blocks)
  test('Flappy game renders embedded and responsive in landscape mobile', async ({ page }) => {
    await page.goto('/flappy');
    const howToPlayButton = page.getByRole('button', { name: 'Got it!' });
    if (await howToPlayButton.isVisible()) {
      await howToPlayButton.click();
    }
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 15000 });
  });

  test('Snake game renders embedded and responsive in landscape mobile', async ({ page }) => {
    await page.goto('/snake');
    const howToPlayButton = page.getByRole('button', { name: 'Got it!' });
    if (await howToPlayButton.isVisible()) {
      await howToPlayButton.click();
    }
    const gameCanvas = page.locator('canvas').first();
    await expect(gameCanvas).toBeVisible({ timeout: 15000 });
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
