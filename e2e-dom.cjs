const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://stron-registro.vercel.app/');
  await page.waitForTimeout(3000); 
  const content = await page.content();
  console.log(content);
  await browser.close();
})();
