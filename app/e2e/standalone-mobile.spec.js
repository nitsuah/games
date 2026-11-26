const { test, expect, devices } = require('@playwright/test');

// Emulated viewport, user agent and touch on Chromium. This is not a real-device check.
for (const name of ['iPhone 13', 'Pixel 7']) {
  const { defaultBrowserType: _unused, ...device } = devices[name];
  test.describe(`standalone games on an emulated ${name}`, () => {
    test.use(device);

    test('Dodge Blocks: tapping the right half of the board moves the player right', async ({ page }) => {
      await page.goto('/games/dodge-blocks/index.html');
      const canvas = page.locator('canvas#game');
      await expect(canvas).toBeVisible();
      const box = await canvas.boundingBox();
      await canvas.tap({ position: { x: box.width * 0.75, y: box.height / 2 } });
      expect(await page.evaluate('player.x')).toBe(164);
    });

    test('Memory Match: tapping a card flips it', async ({ page }) => {
      await page.goto('/games/memory-match/index.html');
      const card = page.locator('.card').first();
      await card.tap();
      await expect(card).toHaveClass(/flipped/);
    });
  });
}
