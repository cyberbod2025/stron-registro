const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Abriendo Vercel...");
  await page.goto('https://stron-registro.vercel.app/');
  
  await page.waitForTimeout(3000); // Wait for classes to load
  await page.screenshot({ path: 'screenshot1.png' });
  console.log("Screenshot tomado: screenshot1.png");

  await browser.close();
})();
