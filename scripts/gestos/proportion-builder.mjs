import assert from 'node:assert/strict';

export async function run(page, ctx) {
  const ahorro = page.getByRole('slider', { name: 'Ahorro' });
  await ahorro.waitFor();
  await page.waitForTimeout(1000);
  const assertTotal = async () => {
    const values = await page.getByRole('slider').evaluateAll((nodes) => nodes.map((n) => Number(n.getAttribute('aria-valuenow'))));
    assert.equal(values.reduce((a, b) => a + b, 0), 100);
    return values;
  };
  await page.getByRole('button', { name: 'Confirmar reparto' }).click();
  await page.getByRole('status').waitFor();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Intentar de nuevo' }).click();
  assert.equal(await ahorro.getAttribute('aria-valuenow'), '5');
  const box = await ahorro.boundingBox();
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  if (ctx.profile === 'mobile-390') {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
    for (let step = 1; step <= 20; step++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + box.width * 0.2 * step / 20, y: start.y }] });
      await page.waitForTimeout(40);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
  } else {
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    for (let step = 1; step <= 20; step++) {
      await page.mouse.move(start.x + box.width * 0.2 * step / 20, start.y);
      await page.waitForTimeout(40);
    }
    await page.mouse.up();
  }
  const moved = await assertTotal();
  assert(moved[2] > 5, 'El arrastre debe aumentar ahorro');
  assert(moved[0] < 60 && moved[1] < 35, 'El arrastre debe reducir las otras categorías');
  assert.equal(await page.getByRole('status').count(), 0, 'Soltar no confirma');
  await page.waitForTimeout(700);
  await ahorro.focus();
  await page.keyboard.press('ArrowRight');
  await assertTotal();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Confirmar reparto' }).click();
  await page.getByRole('button', { name: 'Reparto confirmado' }).waitFor();
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
}
