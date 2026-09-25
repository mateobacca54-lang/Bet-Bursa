export async function run(page, ctx) {
  await page.locator('#como-aprendes').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  if (ctx.profile === 'desktop') {
    await page.mouse.wheel(0, 480);
    await page.waitForTimeout(900);
    await page.mouse.wheel(0, 480);
    await page.waitForTimeout(900);
  } else {
    await page.getByRole('button', { name: 'Inviertes' }).click();
    await page.waitForTimeout(900);
    await page.getByRole('button', { name: 'Suben los precios' }).click();
    await page.waitForTimeout(900);
  }
  await page.locator('#lee-la-letra .llp-escena-track').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.waitForTimeout(900);
}
