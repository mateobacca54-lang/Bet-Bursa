import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const out = path.resolve('artifacts/visual-v2');
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const [name, width, reducedMotion] of [['desktop', 1280, 'no-preference'], ['mobile-390', 390, 'no-preference'], ['mobile-360', 360, 'no-preference'], ['reduced-motion', 1280, 'reduce']]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [label, url, selector, expected] of [
      ['estampas', 'http://localhost:6006/iframe.html?id=illus-estampa--todas&viewMode=story', 'svg.estampa', 13],
      ['objetos', 'http://localhost:6006/iframe.html?id=illus-objetos--todos&viewMode=story', 'svg.objeto', 9],
      ['landing', 'http://localhost:3100', 'svg.estampa', null],
    ]) {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.locator(`${selector}:visible`).first().waitFor();
      await page.waitForTimeout(1000);
      const measurement = await page.evaluate(async ({ selector }) => {
        const nodes = [...document.querySelectorAll(selector)];
        const images = await Promise.all([...document.querySelectorAll('svg image')].map(async el => {
          const url = el.getAttribute('href');
          const image = new Image();
          image.src = url;
          try { await image.decode(); return { url, loaded: true }; }
          catch { return { url, loaded: false }; }
        }));
        return {
          count: nodes.length,
          overflow: document.documentElement.scrollWidth > innerWidth,
          images,
          clipped: nodes.flatMap(node => {
            const box = node.getBBox();
            const vb = node.viewBox.baseVal;
            return box.x < 0 || box.y < 0 || box.x + box.width > vb.width || box.y + box.height > vb.height ? [node.dataset.escena || node.dataset.objeto] : [];
          }),
        };
      }, { selector });
      await page.screenshot({ path: path.join(out, `${label}-${name}.png`), fullPage: true });
      results.push({ profile: name, page: label, ...measurement, errors: [...errors] });
      if (measurement.overflow || measurement.images.some(i => !i.loaded) || measurement.clipped.length || (expected && expected !== measurement.count)) process.exitCode = 1;
    }
    await page.getByRole('button', { name: /Por qué tu plata vale menos/ }).first().focus();
    await page.keyboard.press('Enter');
    await page.getByRole('dialog').waitFor();
    await page.screenshot({ path: path.join(out, `panel-${name}.png`) });
    await page.keyboard.press('Escape');
    if (await page.getByRole('dialog').count()) await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await page.goto('http://localhost:6006/iframe.html?id=widgets-consequenceslider--default&viewMode=story', { waitUntil: 'domcontentloaded', timeout: 60000 });
    const slider = page.getByRole('slider');
    await slider.focus();
    await page.keyboard.press('End');
    await page.waitForTimeout(1000);
    const chart = await page.locator('svg[role="img"]').evaluate(svg => {
      const vb = svg.viewBox.baseVal;
      return [...svg.querySelectorAll('text')].filter(t => {
        const b = t.getBBox();
        return b.x < 0 || b.y < 0 || b.x + b.width > vb.width || b.y + b.height > vb.height;
      }).map(t => t.textContent);
    });
    await page.screenshot({ path: path.join(out, `simulador-${name}.png`), fullPage: true });
    results.push({ profile: name, page: 'simulador', clippedLabels: chart, keyboardValue: await slider.getAttribute('aria-valuenow') });
    if (chart.length) process.exitCode = 1;
    if (errors.length) process.exitCode = 1;
    await page.close();
  }
} finally {
  await fs.writeFile(path.join(out, 'verification.json'), JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify(results, null, 2));
