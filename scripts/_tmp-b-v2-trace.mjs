import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
page.on('console', (m) => console.log('[console]', m.text()));
await page.goto('http://localhost:3100/', { waitUntil: 'load' });
await page.locator('#lee-la-letra').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);

async function estado(label) {
  const info = await page.evaluate(() => {
    const track = document.querySelector('.llp-escena-track');
    const nota = document.querySelector('.llp-nota-paso');
    return {
      scrollY: window.scrollY,
      trackHeight: track ? track.getBoundingClientRect().height : null,
      trackTop: track ? track.getBoundingClientRect().top + window.scrollY : null,
      notaPaso: nota ? nota.textContent : null,
      innerWidth: window.innerWidth,
    };
  });
  console.log(label, info);
}

await estado('inicial');

await page.getByRole('button', { name: 'Siguiente' }).first().click();
await page.waitForTimeout(1200);
await estado('tras 1er Siguiente (+1200ms)');

await page.getByRole('button', { name: 'Siguiente' }).first().click();
await page.waitForTimeout(1200);
await estado('tras 2do Siguiente (+1200ms)');

const cifra = await page.evaluate(() => {
  const caja = [...document.querySelectorAll('.llp-contador')].find((c) => c.getBoundingClientRect().width > 0);
  return caja ? caja.querySelector('.llp-contador-cifra')?.textContent : 'NO ENCONTRADO';
});
console.log('cifra:', cifra);

await browser.close();
