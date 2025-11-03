const { test, expect } = require('@playwright/test');

test.describe('Home Page', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded with increased timeout
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Check title
    await expect(page).toHaveTitle(/Games/i);
    
    // Check main arcade heading with timeout
    const heading = page.getByRole('heading', { name: /ARCADE/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
    
    // Check game buttons exist (using ArcadeCard components which render as buttons)
    const asteroidButton = page.getByRole('button').filter({ hasText: /Asteroid/ });
    const fpsButton = page.getByRole('button').filter({ hasText: /FPS/ });
    
    await expect(asteroidButton).toBeVisible({ timeout: 10000 });
    await expect(fpsButton).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to Asteroid game', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded with increased timeout
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Click Asteroid button - ArcadeCard renders a button containing the text
    const asteroidButton = page.getByRole('button').filter({ hasText: /Asteroid/ });
    await expect(asteroidButton).toBeVisible({ timeout: 10000 });
    await asteroidButton.click();
    
    // Wait for navigation with increased timeout
    await page.waitForURL(/\/asteroid/, { timeout: 30000 });
    
    // Check we're on the asteroid page
    expect(page.url()).toContain('/asteroid');
  });

  test('should navigate to FPS game', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded with increased timeout
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Click FPS button - ArcadeCard renders a button containing the text
    const fpsButton = page.getByRole('button').filter({ hasText: /FPS/ });
    await expect(fpsButton).toBeVisible({ timeout: 10000 });
    await fpsButton.click();
    
    // Wait for navigation with increased timeout
    await page.waitForURL(/\/fps/, { timeout: 30000 });
    
    // Check we're on the FPS page
    expect(page.url()).toContain('/fps');
  });
});
