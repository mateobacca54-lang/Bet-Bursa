export const NODE_SIZE = 44; // espeja --touch-min
/** Espacio extra sobre el punto más alto del camino diagonal, para la etiqueta del nodo. */
const TAG_ROOM_TOP = 42;

export interface PathPoint {
  x: number;
  y: number;
}

export interface PathViewport {
  width: number;
  height: number;
}

export interface PathLayout {
  points: PathPoint[];
  width: number;
  height: number;
  orientation: 'diagonal' | 'vertical';
}

/**
 * Vaivén de la gráfica, en fracciones del alto útil, que se suma a la tendencia recta.
 * Es una tabla fija (no aleatoria): el camino no puede bailar entre renders y la misma
 * cantidad de lecciones siempre dibuja la misma gráfica. Los signos alternan de forma
 * irregular —dos subidas, un retroceso, una subida más corta…— como un mercado real, no
 * como un serrucho. Con los valores de abajo, un módulo de 10 lecciones retrocede en 4 tramos
 * y cada retroceso baja al menos ~9 % del alto (unos 35 px en una gráfica de 400).
 */
const MARKET_SWING = [0, 0.12, -0.08, 0.14, -0.12, 0.08, -0.14, 0.16, -0.1] as const;

/**
 * Alturas normalizadas (0 = abajo, 1 = arriba) de cada lección: tendencia al alza con
 * retrocesos. Garantiza que el primer punto es el mínimo y el último el máximo, así que
 * "llegar al final" siempre se ve como llegar a lo más alto.
 */
export function getMarketProfile(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0];
  const last = count - 1;
  return Array.from({ length: count }, (_, i) => {
    if (i === 0) return 0;
    if (i === last) return 1;
    // El vaivén crece desde los extremos, que quedan fijos, y se apaga al acercarse al final
    // para que el último tramo sea una subida clara y no un retroceso disfrazado.
    const envelope = Math.min(1, i / 1.5, (last - i) / 1);
    const h = i / last + MARKET_SWING[i % MARKET_SWING.length] * envelope;
    return Math.min(0.97, Math.max(0.03, h));
  });
}

function validateInput(count: number, viewport: PathViewport) {
  if (
    !Number.isInteger(count) ||
    count < 0 ||
    !Number.isFinite(viewport.width) ||
    !Number.isFinite(viewport.height) ||
    viewport.width <= 0 ||
    viewport.height <= 0
  ) {
    throw new RangeError('Invalid count or viewport dimensions');
  }
}

export function getPathLayout(count: number, viewport: PathViewport): PathLayout {
  validateInput(count, viewport);

  const orientation = viewport.width >= 640 ? 'diagonal' : 'vertical';
  
  if (count === 0) {
    return { points: [], width: viewport.width, height: viewport.height, orientation };
  }
  
  if (count === 1) {
    return {
      points: [{ x: viewport.width / 2, y: viewport.height / 2 }],
      width: viewport.width,
      height: viewport.height,
      orientation
    };
  }

  const margin = NODE_SIZE / 2 + 24;
  const points: PathPoint[] = [];

  if (orientation === 'diagonal') {
    // Arriba se deja sitio extra: la lección más alta puede ser la "siguiente" y su etiqueta
    // ("Sigue: …", ~46 px) tiene que caber ENCIMA del nodo, porque a los lados pasa la línea.
    const marginTop = margin + TAG_ROOM_TOP;
    const usableW = Math.max(0, viewport.width - 2 * margin);
    const usableH = Math.max(0, viewport.height - margin - marginTop);
    
    const profile = getMarketProfile(count);
    const startX = margin;
    const startY = viewport.height - margin;
    const stepX = usableW / (count - 1);

    for (let i = 0; i < count; i++) {
      points.push({ x: startX + i * stepX, y: startY - usableH * profile[i] });
    }

    return {
      points,
      width: viewport.width,
      height: viewport.height,
      orientation
    };
  } else {
    // vertical
    const dy = 120; // fixed step for distance
    // Cuánto del ancho útil recorre el zigzag. A 1 cruzaba la pantalla entera en cada paso
    // (un rayo); a 0.6 se lee como un camino que serpentea.
    const sway = 0.6;
    const calculatedHeight = margin * 2 + (count - 1) * dy;
    const height = Math.max(viewport.height, calculatedHeight);
    
    const usableW = Math.max(0, viewport.width - 2 * margin);
    
    for (let i = 0; i < count; i++) {
      const y = height - margin - i * dy;
      // Zigzag
      const offsetX = Math.sin(i * 1.3) * (usableW / 2) * sway;
      const x = viewport.width / 2 + offsetX;
      points.push({ x, y });
    }

    return {
      points,
      width: viewport.width,
      height,
      orientation
    };
  }
}

export function getPathPoints(count: number, viewport: PathViewport): PathPoint[] {
  return getPathLayout(count, viewport).points;
}

export function buildPathD(points: PathPoint[]): string {
  if (points.length === 0) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
}

export function splitPathAt(points: PathPoint[], completed: number): { done: PathPoint[]; locked: PathPoint[] } {
  if (points.length === 0) {
    return { done: [], locked: [] };
  }

  const clampCompleted = Math.max(0, Math.min(completed, points.length - 1));
  
  const done = points.slice(0, clampCompleted + 1).map(p => ({ ...p }));
  const locked = points.slice(clampCompleted).map(p => ({ ...p }));
  
  return { done, locked };
}

// ─── Dónde va la etiqueta "Sigue: …" ───
//
// Con una línea que solo subía, el lado derecho del nodo siempre estaba libre. Con subidas y
// bajadas ya no: la etiqueta caía encima del nodo siguiente o de la línea punteada. Aquí se
// prueban lados por orden de preferencia y se elige el primero que no pise nada.

export interface TagBox {
  left: number;
  top: number;
}

export interface TagPlacementOptions {
  /** Ancho y alto estimados de la etiqueta */
  width: number;
  height: number;
  /** Holgura que debe quedar entre la etiqueta y cualquier nodo o tramo de línea */
  clearance?: number;
  /** Espacio ya tomado por adornos de mayor prioridad */
  reserved?: readonly FreeRectBox[];
}

/** ¿Un círculo (centro, radio) toca un rectángulo? */
function circleHitsRect(c: PathPoint, r: number, b: { l: number; t: number; r: number; b: number }): boolean {
  const nx = Math.max(b.l, Math.min(c.x, b.r));
  const ny = Math.max(b.t, Math.min(c.y, b.b));
  return (c.x - nx) ** 2 + (c.y - ny) ** 2 < r * r;
}

/** ¿El segmento a–b atraviesa el rectángulo? (se muestrea: la etiqueta es grande, no hace falta exactitud) */
function segmentHitsRect(a: PathPoint, b: PathPoint, box: { l: number; t: number; r: number; b: number }): boolean {
  const steps = Math.max(2, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 6));
  for (let i = 0; i <= steps; i++) {
    const x = a.x + ((b.x - a.x) * i) / steps;
    const y = a.y + ((b.y - a.y) * i) / steps;
    if (x >= box.l && x <= box.r && y >= box.t && y <= box.b) return true;
  }
  return false;
}

/**
 * Elige dónde poner la etiqueta del nodo `index`: a la derecha si cabe; si no, encima o
 * debajo (alineada a un borde del nodo). Devuelve null si ningún lado queda libre.
 * Función pura: mismo layout → misma posición.
 */
export function pickTagPlacement(
  index: number,
  points: readonly PathPoint[],
  viewport: PathViewport,
  { width, height, clearance = 4, reserved = [] }: TagPlacementOptions
): TagBox | null {
  const p = points[index];
  if (!p) return null;
  const half = NODE_SIZE / 2;
  const gap = 8;

  const clampLeft = (left: number) => Math.min(Math.max(left, 8), viewport.width - width - 8);
  const candidates: TagBox[] = [
    // A la derecha, a tres alturas: centrada en el nodo, un poco más abajo, y justo debajo de él.
    // Cuando la línea sale subiendo hacia la derecha (lo normal), la de abajo queda por debajo de ella.
    { left: p.x + half + 10, top: p.y - height / 2 },
    { left: p.x + half + 10, top: p.y - height * 0.15 },
    { left: p.x + half + 10, top: p.y + 2 },
    { left: clampLeft(p.x - half), top: p.y - half - gap - height },
    { left: clampLeft(p.x + half - width), top: p.y - half - gap - height },
    { left: clampLeft(p.x - half), top: p.y + half + gap },
    { left: clampLeft(p.x + half - width), top: p.y + half + gap },
    { left: p.x - half - 10 - width, top: p.y - height / 2 },
  ];

  for (const c of candidates) {
    const box = { left: c.left, top: c.top, width, height };
    if (isRectFree(box, points, viewport, { clearance, ignoreIndex: index, reserved })) return c;
  }
  return null;
}

export interface FreeRectBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** ¿Dos rectángulos se tocan, dejando `clearance` de holgura alrededor del primero? */
export function rectsOverlap(a: FreeRectBox, b: FreeRectBox, clearance = 0): boolean {
  return (
    a.left - clearance < b.left + b.width &&
    a.left + a.width + clearance > b.left &&
    a.top - clearance < b.top + b.height &&
    a.top + a.height + clearance > b.top
  );
}

/**
 * ¿Un rectángulo cabe en el lienzo sin pisar ningún nodo, ningún tramo de la línea NI ningún
 * espacio ya reservado por otro adorno?
 *
 * `reserved` es la pieza que faltaba: antes cada adorno solo miraba los nodos, así que dos
 * adornos podían elegir el mismo hueco y montarse uno encima del otro. Ver 07-PLAN.md, ola 1.
 * `ignoreIndex` excluye el nodo al que pertenece la etiqueta.
 */
export function isRectFree(
  rect: FreeRectBox,
  points: readonly PathPoint[],
  viewport: PathViewport,
  {
    clearance = 4,
    ignoreIndex = -1,
    reserved = [],
  }: { clearance?: number; ignoreIndex?: number; reserved?: readonly FreeRectBox[] } = {}
): boolean {
  const half = NODE_SIZE / 2;
  const box = {
    l: rect.left - clearance,
    t: rect.top - clearance,
    r: rect.left + rect.width + clearance,
    b: rect.top + rect.height + clearance,
  };
  if (box.l < 0 || box.t < 0 || box.r > viewport.width || box.b > viewport.height) return false;
  if (points.some((q, i) => i !== ignoreIndex && circleHitsRect(q, half, box))) return false;
  if (reserved.some((r) => rectsOverlap(rect, r, clearance))) return false;
  for (let i = 1; i < points.length; i++) {
    if (segmentHitsRect(points[i - 1], points[i], box)) return false;
  }
  return true;
}

// ─── El registro de espacio ocupado ───
//
// Los adornos del camino se colocan POR ORDEN DE IMPORTANCIA, y cada uno reserva el sitio que
// ocupa para que el siguiente no lo pise. Quien no encuentra sitio, no se muestra.
//
//   1  nodos y línea      nunca ceden: son el contenido
//   2  etiqueta "Sigue:"  orienta — dice qué viene
//   3  cartel del tema    decorativo, pero informa
//   4  Monedita           va dentro del rectángulo del cartel
//
// Antes cada uno preguntaba "¿hay nodos debajo?" y ninguno sabía de los otros. Con dos adornos
// funcionaba; con más, chocaban (la etiqueta llegó a tapar el 60 % del cartel).

export interface SpaceLedger {
  /** Rectángulos ya tomados, en orden de reserva */
  readonly taken: readonly FreeRectBox[];
  /** Marca un rectángulo como ocupado */
  occupy: (rect: FreeRectBox) => void;
  /** ¿Cabe aquí, sin pisar nodos, línea ni nada reservado? */
  fits: (rect: FreeRectBox, opts?: { clearance?: number; ignoreIndex?: number }) => boolean;
  /** Si cabe, lo reserva y devuelve true. Si no, deja todo igual y devuelve false */
  claim: (rect: FreeRectBox, opts?: { clearance?: number; ignoreIndex?: number }) => boolean;
}

/** Crea un registro de espacio para un camino concreto. */
export function createSpaceLedger(points: readonly PathPoint[], viewport: PathViewport): SpaceLedger {
  const taken: FreeRectBox[] = [];
  const fits: SpaceLedger['fits'] = (rect, opts = {}) =>
    isRectFree(rect, points, viewport, { ...opts, reserved: taken });
  return {
    taken,
    fits,
    occupy: (rect) => {
      taken.push(rect);
    },
    claim: (rect, opts) => {
      if (!fits(rect, opts)) return false;
      taken.push(rect);
      return true;
    },
  };
}
