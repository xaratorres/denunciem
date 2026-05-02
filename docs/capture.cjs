// Playwright capture — Denunciem mobile screenshots
const { chromium, devices } = require('playwright');
const path = require('path');

// Reusem la instal·lació de playwright + http-server de Transitem
const URL = 'http://localhost:3004/'; // Claude Preview ho assigna
const OUT = path.join(__dirname, 'screenshots');

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
async function shot(p, n) { await p.screenshot({ path: path.join(OUT, n) }); console.log('  ✓', n); }

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'], locale: 'ca-ES' });
  const page = await ctx.newPage();

  // Reset
  await page.goto(URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch(_){} });
  await page.goto(URL);

  await wait(900);
  await shot(page, '01-splash.png');

  // Splash → onboarding
  await page.evaluate(() => document.getElementById('splash')?.click());
  await wait(900);
  await shot(page, '02-onboarding.png');

  await page.click('#btn-entesos');
  await wait(700);
  await shot(page, '03-llista.png');

  await page.evaluate(() => window.scrollTo(0, 600));
  await wait(400);
  await shot(page, '04-llista-scroll.png');
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(300);

  // Ajuda'm
  await page.click('#btn-ajudam');
  await wait(700);
  await shot(page, '05-ajudam.png');
  await page.evaluate(() => document.querySelector('#overlay-ajudam .modal-close')?.click());
  await wait(500);

  // Fitxa: clic primera entitat
  await page.evaluate(() => {
    const card = document.querySelector('[data-id]') || document.querySelector('.entitat-item, .card, article');
    if (card) card.click();
  });
  await wait(800);
  await shot(page, '06-fitxa.png');
  await page.evaluate(() => {
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
  });
  await wait(500);

  // Sobre
  await page.click('#btn-sobre');
  await wait(700);
  await shot(page, '07-sobre.png');

  await browser.close();
  console.log('Done. Screenshots at:', OUT);
})().catch(e => { console.error(e); process.exit(1); });
