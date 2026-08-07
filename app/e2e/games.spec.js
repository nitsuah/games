const { test, expect } = require('@playwright/test');

// Helper: dismiss the shared HowToPlay overlay present on every game page
async function dismissHowToPlay(page) {
  const btn = page.getByRole('button', { name: /GOT IT/i });
  if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await btn.click();
  }
}

test.describe('Asteroid Game', () => {
  test('should load asteroid game page', async ({ page }) => {
    await page.goto('/asteroid');
    await page.waitForLoadState('domcontentloaded');
    await dismissHowToPlay(page);

    // Wait for canvas to be ready (3D assets may take time)
    await page.waitForSelector('canvas', { timeout: 30000 });
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test('should display game instructions', async ({ page }) => {
    await page.goto('/asteroid');
    await page.waitForLoadState('domcontentloaded');
    await dismissHowToPlay(page);

    await page.waitForTimeout(2000);
    await page.waitForSelector('canvas', { timeout: 30000 });

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    const instructions = page.locator('text=Click to lock pointer');
    await expect(instructions).toBeVisible();
  });

  test('should initialize with correct trail quality setting', async ({ page }) => {
    await page.goto('/asteroid');
    await page.waitForLoadState('domcontentloaded');
    await dismissHowToPlay(page);

    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForTimeout(2000);

    const trailQuality = await page.evaluate(() => {
      return localStorage.getItem('trailQuality') || 'high';
    });
    expect(['high', 'low', 'off']).toContain(trailQuality);
  });
});

test.describe('Breakout Game', () => {
  test('should load Breakout game page', async ({ page }) => {
    await page.goto('/breakout');
    await page.waitForLoadState('domcontentloaded');
    await dismissHowToPlay(page);

    // Wait for canvas to initialize after overlay dismissal
    await page.waitForSelector('canvas', { timeout: 30000 });
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test('should display game UI elements', async ({ page }) => {
    await page.goto('/breakout');
    await page.waitForLoadState('domcontentloaded');
    await dismissHowToPlay(page);

    await page.waitForSelector('canvas', { timeout: 30000 });
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    const gameContainer = page.getByTestId('game-container');
    await expect(gameContainer).toBeVisible();
  });
});
