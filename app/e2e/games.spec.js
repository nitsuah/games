const { test, expect } = require('@playwright/test');

test.describe('Asteroid Game', () => {
  test('should load asteroid game page', async ({ page }) => {
    await page.goto('/asteroid');
    
    // Wait for canvas to be ready instead of arbitrary timeout
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Check canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should handle pointer lock flow', async ({ page, context }) => {
    // Grant permissions for pointer lock
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.goto('/asteroid');
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Click canvas to attempt pointer lock (won't actually lock in headless)
    const canvas = page.locator('canvas');
    await canvas.click();
    
    // In headless mode, pointer lock won't work, but we verify no errors
    // Check that game didn't crash
    await expect(canvas).toBeVisible();
  });

  test('should cycle trail quality with T key', async ({ page }) => {
    await page.goto('/asteroid');
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Click canvas to focus the game
    const canvas = page.locator('canvas');
    await canvas.click();
    
    // Get initial trail quality from localStorage
    const initialQuality = await page.evaluate(() => {
      return localStorage.getItem('trailQuality') || 'high';
    });
    
    // Press 'T' key to cycle trail quality
    await page.keyboard.press('t');
    
    // Wait a bit for localStorage to update
    await page.waitForTimeout(100);
    
    // Verify localStorage was updated
    const newQuality = await page.evaluate(() => {
      return localStorage.getItem('trailQuality');
    });
    
    // Quality should have cycled: high -> off, off -> low, low -> high
    const expectedCycle = {
      'high': 'off',
      'off': 'low',
      'low': 'high'
    };
    
    expect(newQuality).toBe(expectedCycle[initialQuality]);
    
    // Press 'T' again to verify full cycle
    await page.keyboard.press('t');
    await page.waitForTimeout(100);
    
    const thirdQuality = await page.evaluate(() => {
      return localStorage.getItem('trailQuality');
    });
    
    expect(thirdQuality).toBe(expectedCycle[newQuality]);
  });
});

test.describe('FPS Game', () => {
  test('should load FPS game page', async ({ page }) => {
    await page.goto('/fps');
    
    // Wait for canvas to be ready instead of arbitrary timeout
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Check canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should display game UI elements', async ({ page }) => {
    await page.goto('/fps');
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Canvas should be present
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Basic smoke test - page loads without crashing
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
