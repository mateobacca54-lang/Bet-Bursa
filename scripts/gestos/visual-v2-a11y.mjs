import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const browser = await chromium.launch({ headless: true });
const out = path.resolve('artifacts/visual-v2');
const results = [];
try {
  for (const story of ['illus-estampa--todas', 'illus-objetos--todos', 'widgets-consequenceslider--default']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await page.goto(`http://localhost:6006/iframe.html?id=${story}&viewMode=story`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (story.startsWith('illus-')) await page.locator(story.startsWith('illus-estampa') ? 'svg.estampa' : 'svg.objeto').first().waitFor();
    else await page.getByRole('slider').waitFor();
    await page.waitForTimeout(2500);
    await page.addScriptTag({ path: path.resolve('node_modules/axe-core/axe.min.js') });
    const report = await page.evaluate(async () => {
      const result = await window.axe.run(document.querySelector('#storybook-root'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } });
      return { violations: result.violations, incomplete: result.incomplete.map(v => ({ id: v.id, description: v.description })), passes: result.passes.length };
    });
    results.push({ story, ...report });
    if (report.violations.length) process.exitCode = 1;
    await page.close();
  }
} finally { await browser.close(); }
await fs.writeFile(path.join(out, 'a11y.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
