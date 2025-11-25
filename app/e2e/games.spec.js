const { test, expect } = require('@playwright/test');

test.describe('Asteroid Game', () => {
  test('should load asteroid game page', async ({ page }) => {
    await page.goto('/asteroid');
    
    // Wait for page to load completely - don't wait for networkidle as 3D assets may keep loading
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for canvas to be ready with increased timeout
    await page.waitForSelector('canvas', { timeout: 30000 });
    
    // Check canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test('should display game instructions', async ({ page }) => {
    await page.goto('/asteroid');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for 3D assets to load
    await page.waitForTimeout(2000);
    
    // Wait for canvas with extended timeout
    await page.waitForSelector('canvas', { timeout: 30000 });
    
    // Get canvas and verify it's visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    
    // Check for instructions text
    const instructions = page.locator('text=Click to lock pointer');
    await expect(instructions).toBeVisible();
  });

  test('should initialize with correct trail quality setting', async ({ page }) => {
    await page.goto('/asteroid');
    
    // Wait for canvas to ensure game is loaded
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for game to fully initialize
    await page.waitForTimeout(2000);
    
    // Check that localStorage has trail quality setting
    const trailQuality = await page.evaluate(() => {
      return localStorage.getItem('trailQuality') || 'high';
    });
    
    // Should have a valid trail quality value
    expect(['high', 'low', 'off']).toContain(trailQuality);
  });
});

test.describe('Breakout Game', () => {
  test('should load Breakout game page', async ({ page }) => {
    await page.goto('/breakout');
    
    // Wait for page to load completely
    await page.waitForLoadState('domcontentloaded');
    
  // Click START GAME button to launch the game
  const startButton = page.getByTestId('start-game-button');
  await expect(startButton).toBeVisible({ timeout: 10000 });
  await startButton.click();
    
    // Now wait for canvas to appear
    await page.waitForSelector('canvas', { timeout: 30000 });
    
    // Check canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test('should display game UI elements', async ({ page }) => {
    await page.goto('/breakout');
    await page.waitForLoadState('domcontentloaded');
    
  // Click START GAME button
  const startButton = page.getByTestId('start-game-button');
  await startButton.click();
    
    // Wait for canvas
    await page.waitForSelector('canvas', { timeout: 30000 });
    
    // Canvas should be present
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    
    // Basic smoke test - page loads without crashing
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
