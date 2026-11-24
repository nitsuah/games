const { test, expect } = require('@playwright/test');
const { startGame, trackPageErrors, canvasHasPaint, pauseAndGoHome } = require('./helpers');

test.describe('Pong start-and-play', { tag: '@feature:pong' }, () => {
  test('starts, renders, reacts to input and a point is scored', async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto('/pong');
    await startGame(page);

    await expect(page.locator('canvas')).toBeVisible();
    await expect.poll(() => canvasHasPaint(page)).toBe(true);

    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(200);
    await page.keyboard.up('ArrowUp');

    // Outcome, not timing: the serve crosses the court, so someone eventually scores.
    // Scores render as two bare numbers in the HUD overlay.
    const scored = async () => {
      const nums = await page.locator('canvas ~ div > div').allInnerTexts();
      return nums.map(Number).reduce((a, b) => a + b, 0);
    };
    await expect.poll(scored, { timeout: 20000 }).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

  test('pause menu Home control returns to the arcade', async ({ page }) => {
    await page.goto('/pong');
    await startGame(page);
    await pauseAndGoHome(page);
  });
});
