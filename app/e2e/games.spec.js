const { test, expect } = require('@playwright/test');

test.describe('Asteroid Game', () => {
  test('should load asteroid game page', async ({ page }) => {
    await page.goto('/asteroid');
    
    // Give canvas time to initialize
    await page.waitForTimeout(2000);
    
    // Check canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should handle pointer lock flow', async ({ page, context }) => {
    // Grant permissions for pointer lock
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.goto('/asteroid');
    await page.waitForTimeout(2000);
    
    // Click canvas to attempt pointer lock (won't actually lock in headless)
    const canvas = page.locator('canvas');
    await canvas.click();
    
    // In headless mode, pointer lock won't work, but we verify no errors
    // Check that game didn't crash
    await expect(canvas).toBeVisible();
  });
});

test.describe('FPS Game', () => {
  test('should load FPS game page', async ({ page }) => {
    await page.goto('/fps');
    
    // Give canvas time to initialize
    await page.waitForTimeout(2000);
    
    // Check canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should display game UI elements', async ({ page }) => {
    await page.goto('/fps');
    await page.waitForTimeout(2000);
    
    // Canvas should be present
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Basic smoke test - page loads without crashing
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
