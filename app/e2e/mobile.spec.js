const { test, expect } = require('@playwright/test');

test.describe('Mobile Landscape Optimization', () => {
  test.beforeEach(async ({ page }) => {
    // Set a common mobile landscape viewport
    await page.setViewportSize({ width: 896, height: 414 });
  });

  test('Home page layout in landscape mobile', async ({ page }) => {
    await page.goto('/');

    // Check main arcade heading visibility (should be visible but resized)
    const heading = page.getByRole('heading', { name: /ARCADE/i });
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Visual regression test for the home page
    await expect(page).toHaveScreenshot('home-landscape-mobile.png');
  });

  test('Asteroid game renders fullscreen in landscape mobile', async ({ page }) => {
    await page.goto('/asteroid');

    // Verify ArcadeLayout elements are NOT visible
    const arcadeCabinet = page.locator('[data-testid="arcade-cabinet"]');
    await expect(arcadeCabinet).not.toBeVisible();

    // Verify game elements are visible (using first to avoid strict mode violations)
    await expect(page.locator('canvas').first()).toBeVisible();
    await expect(page.getByText('Click to lock pointer as camera')).toBeVisible();

    // Visual regression test for Asteroid game
    await expect(page).toHaveScreenshot('asteroid-fullscreen-landscape-mobile.png');
  });

  test('FPS game renders fullscreen in landscape mobile and dismisses tutorial', async ({ page }) => {
    await page.goto('/fps');

    // Dismiss "How to Play" overlay if present
    const howToPlayButton = page.getByRole('button', { name: 'Got it!' });
    if (await howToPlayButton.isVisible()) {
      await howToPlayButton.click();
      await expect(howToPlayButton).not.toBeVisible();
    }

    // Verify ArcadeLayout elements are NOT visible
    const arcadeCabinet = page.locator('[data-testid="arcade-cabinet"]');
    await expect(arcadeCabinet).not.toBeVisible();

    // Verify game elements are visible
    await expect(page.locator('canvas').first()).toBeVisible();

    // Visual regression test for FPS game
    await expect(page).toHaveScreenshot('fps-fullscreen-landscape-mobile.png');
  });

  // Add tests for other fullscreen games (Space Invaders, Pong, Breakout)
  test('Space Invaders game renders fullscreen in landscape mobile and dismisses tutorial', async ({ page }) => {
    await page.goto('/space-invaders');

    const howToPlayButton = page.getByRole('button', { name: 'Got it!' });
    if (await howToPlayButton.isVisible()) {
      await howToPlayButton.click();
      await expect(howToPlayButton).not.toBeVisible();
    }

    const arcadeCabinet = page.locator('[data-testid="arcade-cabinet"]');
    await expect(arcadeCabinet).not.toBeVisible();
    await expect(page.locator('canvas').first()).toBeVisible(); // Assuming SpaceInvadersGame uses a canvas

    await expect(page).toHaveScreenshot('space-invaders-fullscreen-landscape-mobile.png');
  });

  test('Pong game renders fullscreen in landscape mobile and dismisses tutorial', async ({ page }) => {
    await page.goto('/pong');

    const howToPlayButton = page.getByRole('button', { name: 'Got it!' });
    if (await howToPlayButton.isVisible()) {
      await howToPlayButton.click();
      await expect(howToPlayButton).not.toBeVisible();
    }

    const arcadeCabinet = page.locator('[data-testid="arcade-cabinet"]');
    await expect(arcadeCabinet).not.toBeVisible();
    await expect(page.locator('canvas').first()).toBeVisible();

    await expect(page).toHaveScreenshot('pong-fullscreen-landscape-mobile.png');
  });

  test('Breakout game renders fullscreen in landscape mobile and starts game', async ({ page }) => {
    await page.goto('/breakout');

    const startGameButton = page.getByRole('button', { name: 'START GAME' });
    if (await startGameButton.isVisible()) {
      await startGameButton.click();
      await expect(startGameButton).not.toBeVisible();
    }

    const arcadeCabinet = page.locator('[data-testid="arcade-cabinet"]');
    await expect(arcadeCabinet).not.toBeVisible();
    await expect(page.locator('canvas').first()).toBeVisible();

    await expect(page).toHaveScreenshot('breakout-fullscreen-landscape-mobile.png');
  });

  // Add tests for embedded games (Flappy, Snake, Memory Match, Dodge Blocks)
  test('Flappy game renders embedded and responsive in landscape mobile', async ({ page }) => {
    await page.goto('/flappy');

    const howToPlayButton = page.getByRole('button', { name: 'Got it!' });
    if (await howToPlayButton.isVisible()) {
      await howToPlayButton.click();
      await expect(howToPlayButton).not.toBeVisible();
    }

    // Verify ArcadeLayout elements are visible
    const arcadeCabinet = page.locator('[data-testid="arcade-cabinet"]');
    await expect(arcadeCabinet).toBeVisible();

    // Verify game canvas is within the arcade frame (adjust selector if needed)
    const gameCanvas = page.locator('canvas').first();
    await expect(gameCanvas).toBeVisible();
    await expect(page).toHaveScreenshot('flappy-embedded-landscape-mobile.png');
  });

  test('Snake game renders embedded and responsive in landscape mobile', async ({ page }) => {
    await page.goto('/snake');

    const howToPlayButton = page.getByRole('button', { name: 'Got it!' });
    if (await howToPlayButton.isVisible()) {
      await howToPlayButton.click();
      await expect(howToPlayButton).not.toBeVisible();
    }

    const arcadeCabinet = page.locator('[data-testid="arcade-cabinet"]');
    await expect(arcadeCabinet).toBeVisible();
    const gameCanvas = page.locator('canvas').first();
    await expect(gameCanvas).toBeVisible();
    await expect(page).toHaveScreenshot('snake-embedded-landscape-mobile.png');
  });

  test('Memory Match game renders embedded and responsive in landscape mobile', async ({ page }) => {
    await page.goto('/memory-match');

    const arcadeCabinet = page.locator('[data-testid="arcade-cabinet"]');
    await expect(arcadeCabinet).toBeVisible();
    const gameIframe = page.frameLocator('iframe[title="Memory Match"]');
    await expect(gameIframe.locator('body')).toBeVisible(); // Check inside iframe
    await expect(page).toHaveScreenshot('memory-match-embedded-landscape-mobile.png');
  });

  test('Dodge Blocks game renders embedded and responsive in landscape mobile', async ({ page }) => {
    await page.goto('/dodge-blocks');

    const arcadeCabinet = page.locator('[data-testid="arcade-cabinet"]');
    await expect(arcadeCabinet).toBeVisible();
    const gameIframe = page.frameLocator('iframe[title="Dodge the Blocks"]');
    await expect(gameIframe.locator('body')).toBeVisible(); // Check inside iframe
    await expect(page).toHaveScreenshot('dodge-blocks-embedded-landscape-mobile.png');
  });
});
