const { test, expect } = require('@playwright/test');

test.describe('Asteroid Game', () => {
  test('should load asteroid game page', async ({ page }) => {
    await page.goto('/asteroid');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for canvas to be ready with increased timeout
    await page.waitForSelector('canvas', { timeout: 30000 });
    
    // Check canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should handle pointer lock flow', async ({ page, context }) => {
    // Grant permissions for pointer lock
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.goto('/asteroid');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('canvas', { timeout: 30000 });
    
    // Click canvas to attempt pointer lock (won't actually lock in headless)
    const canvas = page.locator('canvas');
    await canvas.click();
    
    // In headless mode, pointer lock won't work, but we verify no errors
    // Check that game didn't crash
    await expect(canvas).toBeVisible();
  });

  test('should cycle trail quality with T key', async ({ page }) => {
    await page.goto('/asteroid');
    
    // Wait for canvas and ensure page is fully loaded with all event listeners
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Additional wait to ensure React components and event listeners are fully mounted
    await page.waitForTimeout(500);
    
    // Click on the page body to ensure focus (not just canvas)
    await page.click('body');
    
    // Get initial trail quality from localStorage
    const initialQuality = await page.evaluate(() => {
      return localStorage.getItem('trailQuality') || 'high';
    });
    
    // Press 'T' key to cycle trail quality
    await page.keyboard.press('KeyT');
    
    // Wait for localStorage to update and React state to sync
    await page.waitForTimeout(300);
    
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
    await page.keyboard.press('KeyT');
    await page.waitForTimeout(300);
    
    const thirdQuality = await page.evaluate(() => {
      return localStorage.getItem('trailQuality');
    });
    
    expect(thirdQuality).toBe(expectedCycle[newQuality]);
  });
});

test.describe('FPS Game', () => {
  test('should load FPS game page', async ({ page }) => {
    await page.goto('/fps');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for canvas to be ready with increased timeout
    await page.waitForSelector('canvas', { timeout: 30000 });
    
    // Check canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should display game UI elements', async ({ page }) => {
    await page.goto('/fps');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('canvas', { timeout: 30000 });
    
    // Canvas should be present
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Basic smoke test - page loads without crashing
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
