const { test, expect } = require('@playwright/test');
const { startGame } = require('./helpers');

test('Snake accepts WASD without errors and keeps running', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/snake');
  await startGame(page);
  await page.keyboard.press('s');
  // Turning down avoids the right wall, so the run is still alive a moment later.
  await page.waitForTimeout(800);
  await expect(page.getByText('GAME OVER')).toHaveCount(0);
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
