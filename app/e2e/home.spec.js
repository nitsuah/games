const { test, expect } = require('@playwright/test');

test.describe('Home Page', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page).toHaveTitle(/Games/i);
    
    // Check main heading
    const heading = page.getByRole('heading', { name: /Game Selector/i });
    await expect(heading).toBeVisible();
    
    // Check game links exist
    const asteroidLink = page.getByRole('link', { name: /Asteroid/i });
    const fpsLink = page.getByRole('link', { name: /FPS/i });
    
    await expect(asteroidLink).toBeVisible();
    await expect(fpsLink).toBeVisible();
  });

  test('should navigate to Asteroid game', async ({ page }) => {
    await page.goto('/');
    
    // Click Asteroid link
    await page.getByRole('link', { name: /Asteroid/i }).click();
    
    // Wait for navigation
    await page.waitForURL(/\/asteroid/);
    
    // Check we're on the asteroid page
    expect(page.url()).toContain('/asteroid');
  });

  test('should navigate to FPS game', async ({ page }) => {
    await page.goto('/');
    
    // Click FPS link
    await page.getByRole('link', { name: /FPS/i }).click();
    
    // Wait for navigation
    await page.waitForURL(/\/fps/);
    
    // Check we're on the FPS page
    expect(page.url()).toContain('/fps');
  });
});
