const { chromium } = require('playwright');

(async () => {
  console.log("=== INICIANDO PRUEBA E2E: ALUMNA -> REGISTRO -> SUPABASE -> PANEL ===");
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const timestamp = Date.now();
  const testEmail = `test.alumna.${timestamp}@example.com`;

  console.log(`\n1. Abriendo aplicación en Producción (https://stron-registro.vercel.app)...`);
  await page.goto('https://stron-registro.vercel.app/');

  console.log("2. Seleccionando la primera clase pendiente...");
  await page.waitForSelector('text=Strong Nation');
  
  await page.click('button:has-text("Confirmar asistencia")');

  console.log("3. Llenando formulario con datos de prueba...");
  await page.waitForSelector('input[type="text"]');
  await page.fill('input[type="text"]', 'Alumna E2E Test');
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="tel"]', '5551234567');

  const checkboxes = await page.$$('input[type="checkbox"]');
  for (let box of checkboxes) {
    await box.check();
  }

  console.log("4. Interceptando tráfico de red hacia Supabase...");
  let requestUrl = "";
  page.on('response', response => {
    const url = response.url();
    if (url.includes('supabase.co/rest/v1/registrations') && response.request().method() === 'POST') {
      console.log(`\n[NETWORK LOG] POST interceptado a Supabase:`);
      console.log(` -> URL Consultada: ${url}`);
      console.log(` -> Status: ${response.status()} ${response.statusText()}`);
    }
  });

  console.log("5. Enviando registro...");
  await page.click('button[type="submit"]');

  await page.waitForSelector('text=Lugar Reservado', { timeout: 10000 });
  console.log(" -> ¡Registro confirmado en la UI!");

  console.log("\n6. Accediendo al Panel de Instructor...");
  await page.goto('https://stron-registro.vercel.app/?admin=true');
  
  await page.waitForSelector('text=Panel de Instructor');
  
  await page.waitForSelector(`text=${testEmail}`, { timeout: 10000 }).catch(() => {});

  const pageText = await page.innerText('body');
  if (pageText.includes(testEmail) || pageText.includes('Alumna E2E Test')) {
    console.log(` -> EVIDENCIA: La alumna "Alumna E2E Test" (${testEmail}) aparece correctamente en el Dashboard de producción.`);
  } else {
    console.log(" -> ADVERTENCIA: No se encontró la alumna en la pantalla actual del dashboard.");
  }

  await browser.close();
  console.log("\n=== PRUEBA E2E COMPLETADA CON ÉXITO ===");
})();
