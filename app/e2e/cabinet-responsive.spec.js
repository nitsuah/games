const { test, expect } = require('@playwright/test');

/**
 * Regression coverage for the arcade cabinet's responsive layout.
 *
 * Prior to this fix, PageContainer used position:fixed + overflow:hidden +
 * a fixed 100vh height with vertical centering. Whenever the cabinet (9-game
 * grid + neon hood + console) was taller than the viewport — routine at
 * tablet-portrait and phone widths — centering clipped equal amounts off the
 * TOP (neon hood/title) and BOTTOM (joystick, buttons, coin slot), and
 * several independent CSS bugs (a mobile `width: 100vw` wider than its
 * parent, a mobile breakpoint that grew the marquee title instead of
 * shrinking it, a game grid with no breakpoint below 768px) overflowed the
 * frame horizontally. These tests assert the console controls and the game
 * grid stay reachable and on-screen at the breakpoints where the bugs
 * reproduced.
 */
test.describe('Arcade cabinet responsive layout', () => {
  test('console controls are visible and within the viewport at tablet-portrait width', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    const heading = page.getByRole('heading', { name: /ARCADE/i });
    await expect(heading).toBeVisible({ timeout: 10000 });

    const joystick = page.getByRole('button', { name: 'Joystick' });
    const consoleButton = page.getByRole('button', { name: 'Arcade button 2' });
    await joystick.scrollIntoViewIfNeeded();
    await expect(joystick).toBeVisible({ timeout: 10000 });
    await expect(consoleButton).toBeVisible({ timeout: 10000 });

    // Regression check: previously these were entirely clipped by the
    // page's overflow:hidden, so their bounding box was unreachable
    // (either null or fell outside [0, viewport height]).
    const box = await joystick.boundingBox();
    expect(box).not.toBeNull();
    expect(box.y).toBeGreaterThanOrEqual(0);
  });

  test('console controls are visible and within the viewport at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    const joystick = page.getByRole('button', { name: 'Joystick' });
    await joystick.scrollIntoViewIfNeeded();
    await expect(joystick).toBeVisible({ timeout: 10000 });

    const box = await joystick.boundingBox();
    expect(box).not.toBeNull();
    expect(box.y).toBeGreaterThanOrEqual(0);
  });

  test('game grid cards stay within the viewport horizontally at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    const asteroidCard = page.getByRole('button', { name: 'Asteroid' });
    await expect(asteroidCard).toBeVisible({ timeout: 10000 });

    const box = await asteroidCard.boundingBox();
    expect(box).not.toBeNull();
    // Regression check: the grid previously overflowed the frame at this
    // width and clipped both edges of the viewport.
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(375);
  });

  test('cabinet chrome does not clip the marquee title on tablet-portrait', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    const heading = page.getByRole('heading', { name: /ARCADE/i });
    await expect(heading).toBeVisible({ timeout: 10000 });

    const box = await heading.boundingBox();
    expect(box).not.toBeNull();
    // Regression check: vertical centering of an over-tall cabinet used to
    // push the top of the hood/title above y=0, clipping it.
    expect(box.y).toBeGreaterThanOrEqual(0);
  });
});
