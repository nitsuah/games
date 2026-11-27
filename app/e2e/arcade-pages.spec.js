const { test, expect } = require('@playwright/test');
const { startGame, canvasHasPaint } = require('./helpers');

for (const [width, height] of [[1024, 768], [375, 812]]) {
  test.describe(`full-height games at ${width}x${height}`, () => {
    test.use({ viewport: { width, height } });

    for (const [route, selector] of [['/flappy', 'canvas'], ['/memory-match', 'iframe'], ['/dodge-blocks', 'iframe']]) {
      test(`${route} shows a play area at least 400px tall`, async ({ page }) => {
        await page.goto(route);
        await startGame(page);
        const area = page.locator(selector).first();
        await expect(area).toBeVisible({ timeout: 15000 });
        expect((await area.boundingBox()).height).toBeGreaterThanOrEqual(400);
        await expect(page.getByText('INSERT COIN TO PLAY')).toHaveCount(0);
      });
    }
  });
}

for (const route of ['/space-invaders', '/flappy', '/dodge-blocks', '/memory-match']) {
  test(`${route} can pause and resume`, async ({ page }) => {
    await page.goto(route);
    await startGame(page);
    await page.getByRole('button', { name: 'Pause Game' }).click();
    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible();
    await page.getByRole('button', { name: 'Resume' }).click();
    await expect(page.getByRole('button', { name: 'Pause Game' })).toBeVisible();
  });
}

test('an unknown URL returns 404 with a way back', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Back to the arcade' })).toHaveAttribute('href', '/');
});

test('/flappy draws the game and starts from its button', async ({ page }) => {
  await page.goto('/flappy');
  // startGame only dismisses How to Play; Flappy's own START GAME button is still showing after it.
  await startGame(page);
  await expect.poll(() => canvasHasPaint(page)).toBe(true);
  await page.getByRole('button', { name: 'START GAME' }).click();
  await expect(page.getByRole('button', { name: 'START GAME' })).toHaveCount(0);
});
