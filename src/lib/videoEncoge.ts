// ============================================================
// videoEncoge.ts — qué segundo de `public/landing/moneda-encoge.mp4` mostrar para que
// la moneda se vea del tamaño que de verdad tiene la plata en cada año.
//
// El video (Kling 3.0, interpolado a 96 cuadros por segundo) solo encoge la moneda; el
// pedestal no se mueve. `ESCALAS_VIDEO_ENCOGE[i]` es la altura de la moneda en el cuadro
// i dividida por la del primer cuadro, MEDIDA sobre el propio archivo (no estimada) y
// suavizada con un polinomio de grado 4 (error máximo ~1 %), para que el scroll recorra
// todos los cuadros en vez de saltar los escalones de la medición en píxeles. Si se cambia el video, se vuelve a medir.
// ============================================================

export const FPS_VIDEO_ENCOGE = 96;

export const ESCALAS_VIDEO_ENCOGE: readonly number[] = [
  1, 0.9994, 0.9988, 0.9982, 0.9976, 0.9969, 0.9963, 0.9956, 0.9949, 0.9942, 0.9935, 0.9928,
  0.9920, 0.9913, 0.9905, 0.9897, 0.9889, 0.9881, 0.9873, 0.9865, 0.9857, 0.9848, 0.9839, 0.9831,
  0.9822, 0.9813, 0.9804, 0.9795, 0.9785, 0.9776, 0.9766, 0.9757, 0.9747, 0.9737, 0.9727, 0.9717,
  0.9707, 0.9697, 0.9686, 0.9676, 0.9665, 0.9655, 0.9644, 0.9633, 0.9622, 0.9611, 0.9600, 0.9589,
  0.9578, 0.9567, 0.9555, 0.9544, 0.9532, 0.9520, 0.9508, 0.9496, 0.9484, 0.9472, 0.9460, 0.9448,
  0.9436, 0.9423, 0.9411, 0.9398, 0.9385, 0.9372, 0.9360, 0.9347, 0.9333, 0.9320, 0.9307, 0.9294,
  0.9280, 0.9267, 0.9253, 0.9239, 0.9225, 0.9211, 0.9197, 0.9183, 0.9169, 0.9155, 0.9140, 0.9126,
  0.9111, 0.9096, 0.9081, 0.9066, 0.9051, 0.9036, 0.9021, 0.9005, 0.8990, 0.8974, 0.8958, 0.8943,
  0.8927, 0.8910, 0.8894, 0.8878, 0.8861, 0.8845, 0.8828, 0.8811, 0.8794, 0.8777, 0.8759, 0.8742,
  0.8724, 0.8706, 0.8689, 0.8670, 0.8652, 0.8634, 0.8615, 0.8597, 0.8578, 0.8559, 0.8540, 0.8520,
  0.8501, 0.8481, 0.8461, 0.8441, 0.8421, 0.8401, 0.8380, 0.8359, 0.8338, 0.8317, 0.8295, 0.8274,
  0.8252, 0.8230, 0.8208, 0.8185, 0.8163, 0.8140, 0.8117, 0.8093, 0.8070, 0.8046, 0.8022, 0.7997,
  0.7973, 0.7948, 0.7923, 0.7898, 0.7872, 0.7846, 0.7820, 0.7794, 0.7767, 0.7740, 0.7713, 0.7685,
  0.7657, 0.7629, 0.7601, 0.7572, 0.7543, 0.7513, 0.7484, 0.7454, 0.7423,
];

/**
 * El segundo del video en que la moneda mide `escala` (1 = tamaño inicial). Busca el
 * primer cuadro que ya es igual o más chico; fuera del rango del video se queda en el
 * primer o el último cuadro.
 */
export function tiempoParaEscala(
  escala: number,
  escalas: readonly number[] = ESCALAS_VIDEO_ENCOGE,
  fps: number = FPS_VIDEO_ENCOGE
): number {
  if (escalas.length === 0 || !(fps > 0)) return 0;
  const i = escalas.findIndex((e) => e <= escala);
  const cuadro = i === -1 ? escalas.length - 1 : i;
  return cuadro / fps;
}
