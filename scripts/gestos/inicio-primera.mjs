// Gesto de /inicio, primera visita: Monedita entra, el usuario apuesta y ella reacciona.
// Sin progreso guardado (contexto nuevo de Playwright = localStorage vacío).
export async function run(page) {
  await page.getByRole('button', { name: /Hoy vale más/ }).waitFor();
  await page.waitForTimeout(1600); // la entrada completa, a velocidad real
  await page.getByRole('button', { name: /Hoy vale más/ }).click();
  await page.waitForTimeout(1600); // salto de Monedita + revelación
}
