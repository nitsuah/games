const { test, expect } = require('@playwright/test');
const { startGame, trackPageErrors, canvasHasPaint, pauseAndGoHome } = require('./helpers');

test.describe('Snake start-and-play', () => {
  test('starts, renders and ends in GAME OVER after steering into a wall', async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto('/snake');
    await startGame(page);

    await expect(page.getByText('SCORE: 0')).toBeVisible();
    await expect.poll(() => canvasHasPaint(page)).toBe(true);

    // The snake starts heading right; steer down. Either way it must hit a wall.
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('heading', { name: 'GAME OVER' })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/Final Score: \d+/)).toBeVisible();

    // TRY AGAIN restarts with a fresh score.
    await page.getByRole('button', { name: 'TRY AGAIN' }).click();
    await expect(page.getByRole('heading', { name: 'GAME OVER' })).toBeHidden();
    await expect(page.getByText('SCORE: 0')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('pause menu Home control returns to the arcade', async ({ page }) => {
    await page.goto('/snake');
    await startGame(page);
    await pauseAndGoHome(page);
  });
});
