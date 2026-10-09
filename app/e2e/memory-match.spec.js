const { test, expect } = require('@playwright/test');

// Standalone vanilla-JS game served from /public; the arcade page hosts it in an iframe.
const GAME_URL = '/games/memory-match/index.html';

// Reads the deck from the game's top-level `cards` binding (symbols by index).
const readSymbols = (page) => page.evaluate('cards.map((c) => c.symbol)');

test.describe('Memory Match', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(GAME_URL);
  });

  test('renders a 16-card face-down board', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Memory Match' })).toBeVisible();
    await expect(page.locator('#game .card')).toHaveCount(16);
    await expect(page.getByLabel('Hidden card')).toHaveCount(16);
  });

  test('a matching pair stays revealed after two flips', async ({ page }) => {
    const symbols = await readSymbols(page);
    const second = symbols.indexOf(symbols[0], 1);
    const cardsEl = page.locator('#game .card');

    await cardsEl.nth(0).click();
    await cardsEl.nth(second).click();

    await expect(page.locator('#game .card.matched')).toHaveCount(2, { timeout: 3000 });
    await expect(page.getByLabel('Hidden card')).toHaveCount(14);
  });

  test('a mismatched pair flips back face-down', async ({ page }) => {
    const symbols = await readSymbols(page);
    const other = symbols.findIndex((s) => s !== symbols[0]);
    const cardsEl = page.locator('#game .card');

    await cardsEl.nth(0).click();
    await cardsEl.nth(other).click();
    await expect(page.locator('#game .card.flipped')).toHaveCount(2);

    await expect(page.locator('#game .card.flipped')).toHaveCount(0, { timeout: 3000 });
    await expect(page.locator('#game .card.matched')).toHaveCount(0);
  });

  test('restart reshuffles and clears progress', async ({ page }) => {
    await page.locator('#game .card').first().click();
    await expect(page.locator('#game .card.flipped')).toHaveCount(1);

    await page.getByRole('button', { name: 'Restart' }).click();

    await expect(page.locator('#game .card.flipped')).toHaveCount(0);
    await expect(page.getByLabel('Hidden card')).toHaveCount(16);
  });
});
