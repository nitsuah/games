const { test, expect } = require('@playwright/test');
const { startGame, trackPageErrors, canvasHasPaint, pauseAndGoHome } = require('./helpers');

test.describe('Breakout start-and-play', { tag: '@feature:breakout' }, () => {
  test('starts, renders, reacts to input and scores or loses a life', async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto('/breakout');
    await startGame(page);

    const hud = page.getByTestId('game-container');
    await expect(hud.getByText('SCORE: 0')).toBeVisible();
    await expect(hud.getByText('LIVES: 3')).toBeVisible();
    await expect.poll(() => canvasHasPaint(page)).toBe(true);

    // The ball launches by itself; steer the paddle with a real key press.
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(200);
    await page.keyboard.up('ArrowRight');

    // Outcome, not timing: the ball either breaks a brick (score up) or drops (a life lost).
    await expect
      .poll(
        async () =>
          /SCORE: [1-9]/.test(await hud.innerText()) ||
          /LIVES: [0-2]\b/.test(await hud.innerText()),
        {
          timeout: 20000,
        }
      )
      .toBe(true);
    expect(errors).toEqual([]);
  });

  test('pause menu Home control returns to the arcade', async ({ page }) => {
    await page.goto('/breakout');
    await startGame(page);
    await pauseAndGoHome(page);
  });

  test('resuming after a pause keeps the game running', async ({ page }) => {
    await page.goto('/breakout');
    await startGame(page);
    await page.getByRole('button', { name: 'Pause Game' }).click();
    await page.getByRole('button', { name: 'Resume' }).click();
    await expect(page.getByRole('button', { name: 'Pause Game' })).toBeVisible();
    const hud = page.getByTestId('game-container');
    await expect
      .poll(
        async () =>
          /SCORE: [1-9]/.test(await hud.innerText()) ||
          /LIVES: [0-2]\b/.test(await hud.innerText()),
        {
          timeout: 20000,
        }
      )
      .toBe(true);
  });
});
