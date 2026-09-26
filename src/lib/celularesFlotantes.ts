/**
 * Lógica pura de la escena "Así se aprende en Bursa." (sin DOM): dos celulares que
 * flotan delante de la cinta 3D y, al bajar con el scroll, se apartan cada uno hacia
 * su lado inclinándose — inspirada en la landing de Slush.
 *
 * `poseCelulares(p)` es la ÚNICA fuente de la coreografía: recibe el progreso del
 * `ScrollTrigger` anclado (0 al entrar al valle, 1 al salir) y devuelve, para el
 * celular A (almuerzo), el B (interés) y la cinta, `{ x, y, rotacion }` listos para
 * `gsap.set(el, { xPercent: x, yPercent: y, rotation })`: x e y son porcentajes del
 * propio elemento (`xPercent`/`yPercent`), no píxeles, así que la pose no depende del
 * tamaño real del celular en pantalla. También devuelve `opacidadPie`, la opacidad
 * compartida de los dos `<figcaption>`.
 *
 * Recorta `p` a [0, 1] (con NaN u otro valor no finito tratado como 0) y aplica una
 * curva de suavizado (`smoothstep`) a la posición y la rotación antes de interpolar,
 * para que el reparto no se sienta lineal. El parallax de la cinta y la aparición del
 * pie usan el `p` recortado tal cual: son más simples y no necesitan la misma curva.
 */

export interface Pose {
  /** Porcentaje del propio ancho del elemento (para `xPercent` de GSAP). */
  x: number;
  /** Porcentaje del propio alto del elemento (para `yPercent` de GSAP). */
  y: number;
  /** Grados de rotación. */
  rotacion: number;
}

export interface PoseCelulares {
  a: Pose;
  b: Pose;
  cinta: Pose;
  /** Opacidad compartida de los dos pies de foto, 0–1. */
  opacidadPie: number;
}

// ─── Centrado ───
// Los celulares se posicionan con `left: 50%; top: 50%` sobre el valle de la cinta.
// -50% (de su propio ancho/alto) los centra sobre ese punto; el resto de la pose se
// suma a partir de ahí.
const CENTRO_X = -50;
const CENTRO_Y = -50;

// ─── Separación horizontal (A a la izquierda, B a la derecha del centro) ───
// En porcentaje del propio ancho del celular. En p=0 "casi juntos"; en p=1, cada uno
// a ~0,75 anchos de celular del centro (AGENTS.md: solo transform, sin inventar tokens
// — estos son grados/fracciones de geometría, no valores de diseño).
const SEPARACION_INICIO = 5;
const SEPARACION_FIN = 75;

// ─── Rotación de cada celular ───
const ROTACION_A_INICIO = -3;
const ROTACION_A_FIN = -10;
const ROTACION_B_INICIO = 4;
const ROTACION_B_FIN = 8;

// ─── Desplazamiento vertical base (además de la flotación) ───
// A empieza casi centrado y termina un poco más arriba; B empieza un poco más abajo
// (detrás, tapado en parte) y termina más abajo todavía — nunca se cruzan con A.
const Y_A_INICIO = -2;
const Y_A_FIN = -6;
const Y_B_INICIO = 5;
const Y_B_FIN = 11;

// ─── Flotación ───
// Un término senoidal en función de `p` (no del tiempo: así no hace falta inventar
// ninguna duración de bucle). Fases y frecuencias distintas para que A y B no floten
// en sincronía perfecta, que se vería mecánico.
const FLOTE_AMPLITUD = 3;
const FLOTE_FRECUENCIA_A = 1.3;
const FLOTE_FRECUENCIA_B = 1.7;
const FLOTE_FASE_A = 0;
const FLOTE_FASE_B = Math.PI / 3;

// ─── Parallax de la cinta ───
// Se mueve más lento que los celulares: un pequeño desplazamiento en y, en porcentaje
// de su propio alto, lineal con `p` (sin curva: es fondo, no protagonista).
const CINTA_PARALLAX = 3.5;

// ─── Aparición de los pies de foto ───
// Rampa lineal entre estos dos puntos de `p`; fuera de ese rango, 0 o 1.
const PIE_INICIO = 0.55;
const PIE_FIN = 0.85;

function clamp01(valor: number): number {
  if (!Number.isFinite(valor)) return 0;
  return Math.min(1, Math.max(0, valor));
}

/** smoothstep: suaviza los extremos de una interpolación en [0, 1]. */
function suavizar(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(desde: number, hasta: number, t: number): number {
  return desde + (hasta - desde) * t;
}

export function poseCelulares(pCrudo: number): PoseCelulares {
  const p = clamp01(pCrudo);
  const t = suavizar(p);

  const separacion = lerp(SEPARACION_INICIO, SEPARACION_FIN, t);

  const a: Pose = {
    x: CENTRO_X - separacion,
    y:
      CENTRO_Y +
      lerp(Y_A_INICIO, Y_A_FIN, t) +
      FLOTE_AMPLITUD * Math.sin(p * FLOTE_FRECUENCIA_A * Math.PI * 2 + FLOTE_FASE_A),
    rotacion: lerp(ROTACION_A_INICIO, ROTACION_A_FIN, t),
  };

  const b: Pose = {
    x: CENTRO_X + separacion,
    y:
      CENTRO_Y +
      lerp(Y_B_INICIO, Y_B_FIN, t) +
      FLOTE_AMPLITUD * Math.sin(p * FLOTE_FRECUENCIA_B * Math.PI * 2 + FLOTE_FASE_B),
    rotacion: lerp(ROTACION_B_INICIO, ROTACION_B_FIN, t),
  };

  const cinta: Pose = {
    x: 0,
    y: lerp(-CINTA_PARALLAX, CINTA_PARALLAX, p),
    rotacion: 0,
  };

  const opacidadPie = clamp01((p - PIE_INICIO) / (PIE_FIN - PIE_INICIO));

  return { a, b, cinta, opacidadPie };
}

/** Separación horizontal entre A y B (en porcentaje del propio ancho), para tests. */
export function separacionCelulares(pCrudo: number): number {
  const { a, b } = poseCelulares(pCrudo);
  return b.x - a.x;
}
