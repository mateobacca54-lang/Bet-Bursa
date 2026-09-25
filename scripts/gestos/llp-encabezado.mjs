export async function run(page, { profile }) {
  await page.locator('#lee-la-letra').waitFor();
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    const section = document.getElementById('lee-la-letra');
    document.documentElement.style.scrollBehavior = 'auto';
    if (section) window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY);
  });
  await page.waitForTimeout(400);

  if (profile !== 'desktop') return;
  await page.screenshot({ path: 'artifacts/lee-la-letra-encabezado/desktop-inicio.png' });
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 160);
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(800);
}
