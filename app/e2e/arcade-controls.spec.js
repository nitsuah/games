const { test, expect } = require('@playwright/test');
const { startGame } = require('./helpers');

test('Snake turns with WASD', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/snake');
  await startGame(page);
  await page.keyboard.press('w');
  // Heading up from row 10 reaches the top wall in about 1.1s. Without the turn the
  // snake keeps going right, and on a 1280px board that wall is over 4s away.
  await expect(page.getByText('GAME OVER')).toBeVisible({ timeout: 3000 });
  expect(errors).toEqual([]);
});

test('Pong paddle follows the mouse', async ({ page }) => {
  await page.goto('/pong');
  await startGame(page);
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  // The player paddle sits at x=750..765 of an 800x600 canvas.
  const lit = (y) => page.evaluate((row) => document.querySelector('canvas').getContext('2d').getImageData(757, row, 1, 1).data[0] > 200, y);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.9);
  await expect.poll(() => lit(540)).toBe(true);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.1);
  await expect.poll(() => lit(60)).toBe(true);
});
