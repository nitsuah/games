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

  test('should handle pointer lock flow', async ({ page, context }) => {
    // Grant permissions for pointer lock
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.goto('/asteroid');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait longer for 3D assets to load
    await page.waitForTimeout(2000);
    
    // Wait for canvas with extended timeout
    await page.waitForSelector('canvas', { timeout: 30000 });
    
    // Get canvas and verify it's visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    
    // Click canvas to attempt pointer lock (won't actually lock in headless)
    await canvas.click();
    
    // Wait to ensure no crashes
    await page.waitForTimeout(1000);
    
    // Verify canvas is still visible (game didn't crash)
    await expect(canvas).toBeVisible();
  });

  test('should cycle trail quality with T key', async ({ page }) => {
    await page.goto('/asteroid');
    
    // Wait for canvas and ensure page is fully loaded with all event listeners
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    
    // Additional wait to ensure React components and event listeners are fully mounted
    await page.waitForTimeout(1500);
    
    // Set initial trail quality to ensure consistent test
    await page.evaluate(() => {
      localStorage.setItem('trailQuality', 'high');
    });
    
    // Reload to pick up localStorage change
    await page.reload();
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    
    // Get fresh canvas locator after reload and click to ensure focus
    const canvas = page.locator('canvas');
    await canvas.click();
    await page.waitForTimeout(1000);
    
    // Get initial trail quality from localStorage
    const initialQuality = await page.evaluate(() => {
      return localStorage.getItem('trailQuality') || 'high';
    });
    
    console.log('Initial quality:', initialQuality);
    
    // Press 'T' key to cycle trail quality - use page.keyboard instead of canvas
    await page.keyboard.press('t');
    
    // Wait longer for localStorage to update and React state to sync
    await page.waitForTimeout(1000);
    
    // Verify localStorage was updated
    const newQuality = await page.evaluate(() => {
      return localStorage.getItem('trailQuality');
    });
    
    console.log('New quality after T press:', newQuality);
    
    // Quality should have cycled: high -> off, off -> low, low -> high
    const expectedCycle = {
      'high': 'off',
      'off': 'low',
      'low': 'high'
    };
    
    expect(newQuality).toBe(expectedCycle[initialQuality]);
  });
});

test.describe('Breakout Game', () => {
  test('should load Breakout game page', async ({ page }) => {
    await page.goto('/breakout');
    
    // Wait for page to load completely
    await page.waitForLoadState('domcontentloaded');
    
    // Click START GAME button to launch the game
    const startButton = page.getByRole('button', { name: /START GAME/i });
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
    const startButton = page.getByRole('button', { name: /START GAME/i });
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
