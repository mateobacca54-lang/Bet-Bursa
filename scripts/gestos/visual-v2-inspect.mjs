import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const out = path.resolve('artifacts/visual-v2');
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:6006/iframe.html?id=illus-estampa--todas&viewMode=story');
  await page.locator('svg.estampa').first().waitFor();
  await page.screenshot({ path: path.join(out, 'antes-estampas.png'), fullPage: true });
  await page.goto('http://localhost:3100');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(out, 'antes-landing.png'), fullPage: true });
  console.log((await page.locator('button').allTextContents()).join('\n'));
} finally { await browser.close(); }
