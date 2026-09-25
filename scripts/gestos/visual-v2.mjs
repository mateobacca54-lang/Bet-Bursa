export async function run(page) {
  await page.getByRole('button', { name: /Por qué tu plata vale menos/ }).first().focus();
  await page.keyboard.press('Enter');
  await page.getByRole('dialog').waitFor();
  await page.waitForTimeout(1000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}
