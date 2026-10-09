const { test, expect } = require('@playwright/test');

// Standalone vanilla-JS canvas game served from /public; the arcade page hosts it in an iframe.
const GAME_URL = '/games/dodge-blocks/index.html';

// Reads the game's top-level `player` binding.
const playerX = (page) => page.evaluate('player.x');

test.describe('Dodge Blocks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(GAME_URL);
  });

  test('renders the canvas with a player at the start position', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dodge the Blocks' })).toBeVisible();
    await expect(page.locator('canvas#game')).toHaveAttribute('width', '320');
    expect(await playerX(page)).toBe(140);
  });

  test('arrow keys move the player left and right', async ({ page }) => {
    await page.keyboard.press('ArrowLeft');
    expect(await playerX(page)).toBe(116);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    expect(await playerX(page)).toBe(164);
  });

  test('player is clamped inside the canvas', async ({ page }) => {
    for (let i = 0; i < 15; i++) await page.keyboard.press('ArrowLeft');
    expect(await playerX(page)).toBe(0);
    for (let i = 0; i < 20; i++) await page.keyboard.press('ArrowRight');
    expect(await playerX(page)).toBe(280); // 320 - player width (40)
  });

  test('restart resets the score and running state', async ({ page }) => {
    await page.waitForFunction('score > 0');
    // A known high score: only a real reset can bring it back under 10 (score keeps ticking after restart)
    await page.evaluate('score = 500; running = false');
    await page.getByRole('button', { name: 'Restart' }).click();
    expect(await page.evaluate('running')).toBe(true);
    expect(await page.evaluate('score')).toBeLessThan(10);
  });
});
