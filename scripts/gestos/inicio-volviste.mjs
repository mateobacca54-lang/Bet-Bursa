// Gesto de /inicio, "volviste": progreso sembrado en localStorage (2 de 10, con nombre).
export async function run(page) {
  await page.evaluate(() => {
    const d = new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    localStorage.setItem(
      'bursa:progress:v1:modulo-1',
      JSON.stringify({
        moduleId: 'modulo-1',
        completedLessons: [1, 2],
        lastVisitedLesson: 2,
        streakDays: 2,
        lastActiveDate: key,
        userName: 'Mateo',
        namePrompted: true,
        reviewedConcepts: [],
      })
    );
  });
  await page.reload({ waitUntil: 'load' });
  await page.getByRole('heading', { name: /Tus módulos/ }).waitFor();
  await page.waitForTimeout(2200);
}
