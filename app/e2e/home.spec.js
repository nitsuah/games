const { test, expect } = require('@playwright/test');

test.describe('Home Page', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page).toHaveTitle(/Games/i);
    
    // Check main arcade heading
    const heading = page.getByRole('heading', { name: /ARCADE/i });
    await expect(heading).toBeVisible();
    
    // Check game buttons exist (using ArcadeCard components which render as buttons)
    const asteroidButton = page.getByRole('button', { name: /Asteroid/i });
    const fpsButton = page.getByRole('button', { name: /FPS/i });
    
    await expect(asteroidButton).toBeVisible();
    await expect(fpsButton).toBeVisible();
  });

  test('should navigate to Asteroid game', async ({ page }) => {
    await page.goto('/');
    
    // Click Asteroid button
    await page.getByRole('button', { name: /Asteroid/i }).click();
    
    // Wait for navigation
    await page.waitForURL(/\/asteroid/);
    
    // Check we're on the asteroid page
    expect(page.url()).toContain('/asteroid');
  });

  test('should navigate to FPS game', async ({ page }) => {
    await page.goto('/');
    
    // Click FPS button
    await page.getByRole('button', { name: /FPS/i }).click();
    
    // Wait for navigation
    await page.waitForURL(/\/fps/);
    
    // Check we're on the FPS page
    expect(page.url()).toContain('/fps');
  });
});
