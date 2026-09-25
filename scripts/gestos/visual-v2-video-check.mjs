import { chromium } from 'playwright';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const browser = await chromium.launch({ headless: true });
try {
  for (const name of ['desktop', 'mobile-390', 'reduced-motion']) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(pathToFileURL(path.resolve(`artifacts/visual-v2-gesture/${name}.webm`)).href);
    await page.locator('video').waitFor();
    await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
    const duration = await page.locator('video').evaluate(async video => {
      video.pause();
      video.currentTime = Math.min(1, video.duration / 2);
      await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));
      return video.duration;
    });
    await page.locator('video').screenshot({ path: path.resolve(`artifacts/visual-v2/video-${name}.png`) });
    console.log({ name, duration });
    await page.close();
  }
} finally { await browser.close(); }
