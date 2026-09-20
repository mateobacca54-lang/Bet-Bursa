export const NODE_SIZE = 44; // espeja --touch-min

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
    const usableW = Math.max(0, viewport.width - 2 * margin);
    const usableH = Math.max(0, viewport.height - 2 * margin);
    
    const yWeights: number[] = [];
    let sumY = 0;
    
    // Deterministic weights to break collinearity
    for (let i = 1; i < count; i++) {
      const w = 1 + 0.6 * Math.sin(i * 12.345);
      yWeights.push(w);
      sumY += w;
    }

    const startX = margin;
    const startY = viewport.height - margin;
    const stepX = usableW / (count - 1);
    
    points.push({ x: startX, y: startY });
    
    let currentY = startY;
    for (let i = 1; i < count; i++) {
      const x = startX + i * stepX;
      currentY -= usableH * (yWeights[i - 1] / sumY);
      points.push({ x, y: currentY });
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
