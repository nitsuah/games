const { expect } = require('@playwright/test');

// Dismiss the shared HowToPlay overlay to start the game.
async function startGame(page) {
  const btn = page.getByRole('button', { name: /GOT IT/i });
  await expect(btn).toBeVisible({ timeout: 10000 });
  await btn.click();
  await expect(btn).toBeHidden();
}

// Collect uncaught page errors so tests can assert the game never throws.
function trackPageErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

// True once the canvas has at least one non-transparent/non-black pixel painted.
function canvasHasPaint(page) {
  return page.evaluate(() => {
    const c = document.querySelector('canvas');
    if (!c) return false;
    const { data } = c.getContext('2d').getImageData(0, 0, c.width, c.height);
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] || data[i + 1] || data[i + 2]) return true;
    }
    return false;
  });
}

// Pause via the top bar, then use the Home control and expect to land on the arcade.
async function pauseAndGoHome(page) {
  await page.getByRole('button', { name: 'Pause Game' }).click();
  await page.getByRole('button', { name: 'Home' }).click();
  await expect(page).toHaveURL(/\/$/);
}

module.exports = { startGame, trackPageErrors, canvasHasPaint, pauseAndGoHome };
