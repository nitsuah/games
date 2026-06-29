const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/space-invaders');
  // Wait a bit for potential loading
  await page.waitForTimeout(5000);
  const canvasCount = await page.locator('canvas').count();
  console.log('Canvas count:', canvasCount);
  await browser.close();
})();
