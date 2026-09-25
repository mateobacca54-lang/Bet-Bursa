import assert from 'node:assert/strict';
export async function run(page, ctx) {
  const input = page.getByRole('textbox', { name: '¿Te aviso cuando salga la siguiente?' });
  await input.waitFor();
  await page.screenshot({ path: `artifacts/captura-correo/${ctx.profile}-formulario.png` });
  await input.fill('sin-arroba');
  await page.getByRole('button', { name: 'Avísame' }).click();
  await page.getByRole('alert').waitFor();
  assert.equal(await page.getByRole('alert').textContent().then(s => s.trim()), 'No parece un correo. Revísalo e intenta otra vez.');
  await page.screenshot({ path: `artifacts/captura-correo/${ctx.profile}-error.png` });
  await input.fill('persona@ejemplo.com');
  await page.getByRole('button', { name: 'Avísame' }).click();
  await page.getByRole('status').waitFor();
  assert.equal(await page.getByRole('status').textContent().then(s => s.trim()), 'Listo. Te escribo cuando esté.');
}
