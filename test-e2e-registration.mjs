import { chromium } from 'playwright';

const URL = 'http://localhost:3000';

async function runTests() {
  console.log("Starting browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  try {
    const days = ['Martes', 'Jueves', 'Domingo'];
    for (const day of days) {
      await page.goto(URL);
      console.log(`Waiting for ${day}...`);
      await page.waitForSelector(`text=${day}`);
      await page.waitForTimeout(1000); // Wait for animations
      
      console.log(`Clicking ${day}...`);
      // Find the card containing the text and click it
      const element = page.locator(`.class-card:has-text("${day}")`);
      await element.click();
      
      await page.waitForSelector('input[type="text"]');
      await page.fill('input[type="text"]', `Test ${day} User`);
      await page.fill('input[type="email"]', `${day.toLowerCase()}@test.com`);
      
      console.log(`Submitting for ${day}...`);
      await page.click('text=CONFIRMAR ASISTENCIA');
      await page.waitForSelector('text=¡Registro exitoso!');
      console.log(`${day} registered successfully.`);
    }
  } catch (error) {
    console.error("Test failed:", error);
    await page.screenshot({ path: 'error.png' });
  } finally {
    await browser.close();
    console.log("Done.");
  }
}

runTests();
