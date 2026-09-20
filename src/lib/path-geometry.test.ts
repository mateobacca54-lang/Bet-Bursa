import { describe, it, expect } from 'vitest';
import { 
  NODE_SIZE, 
  getPathLayout, 
  getPathPoints, 
  buildPathD, 
  splitPathAt 
} from './path-geometry';

describe('Geometría del Camino (Ola 0)', () => {
  
  it('determinismo: dos llamadas dan el mismo resultado', () => {
    const res1 = getPathLayout(10, { width: 1024, height: 768 });
    const res2 = getPathLayout(10, { width: 1024, height: 768 });
    expect(res1).toEqual(res2);
  });

  it('count exacto de puntos; los casos 0 y 1', () => {
    const p0 = getPathPoints(0, { width: 800, height: 600 });
    expect(p0).toHaveLength(0);

    const p1 = getPathPoints(1, { width: 800, height: 600 });
    expect(p1).toHaveLength(1);
    expect(p1[0].x).toBe(400);
    expect(p1[0].y).toBe(300);
    
    const p10 = getPathPoints(10, { width: 800, height: 600 });
    expect(p10).toHaveLength(10);
  });

  it('el corte de 640: 639 -> vertical, 640 -> diagonal', () => {
    const v = getPathLayout(5, { width: 639, height: 800 });
    expect(v.orientation).toBe('vertical');
    
    const d = getPathLayout(5, { width: 640, height: 800 });
    expect(d.orientation).toBe('diagonal');
  });

  describe('diagonal', () => {
    it('monotonía estricta y NO colinealidad (count 10)', () => {
      const points = getPathPoints(10, { width: 1024, height: 768 });
      
      // Monotonía
      for (let i = 1; i < points.length; i++) {
        expect(points[i].x).toBeGreaterThan(points[i - 1].x);
        expect(points[i].y).toBeLessThan(points[i - 1].y);
      }
      
      // Colinealidad: comprobando las pendientes entre segmentos
      let slopesChange = false;
      for (let i = 2; i < points.length; i++) {
        const m1 = (points[i - 1].y - points[i - 2].y) / (points[i - 1].x - points[i - 2].x);
        const m2 = (points[i].y - points[i - 1].y) / (points[i].x - points[i - 1].x);
        if (Math.abs(m1 - m2) > 0.001) {
          slopesChange = true;
          break;
        }
      }
      expect(slopesChange).toBe(true);
    });
  });

  describe('vertical', () => {
    it('una columna, lección 1 más abajo, alto crece con count', () => {
      const layout3 = getPathLayout(3, { width: 400, height: 500 });
      const layout10 = getPathLayout(10, { width: 400, height: 500 });
      
      expect(layout10.height).toBeGreaterThan(layout3.height);
      
      const pts = layout10.points;
      for (let i = 1; i < pts.length; i++) {
        expect(pts[i].y).toBeLessThan(pts[i - 1].y); // lección 1 está en índice 0 y debe ser la mayor Y
      }
    });
  });

  it('márgenes y separación mínima, barridos con anchos 320-1920 y altos 400-1080, count 10', () => {
    const widths = [320, 639, 640, 1024, 1920];
    const heights = [400, 768, 1080];
    const margin = (NODE_SIZE / 2) + 24; // 46
    const minDistance = NODE_SIZE + 12; // 56
    
    for (const w of widths) {
      for (const h of heights) {
        const layout = getPathLayout(10, { width: w, height: h });
        const pts = layout.points;
        
        for (let i = 0; i < pts.length; i++) {
          // Márgenes
          expect(pts[i].x).toBeGreaterThanOrEqual(margin - 0.1);
          expect(pts[i].x).toBeLessThanOrEqual(w - margin + 0.1);
          expect(pts[i].y).toBeGreaterThanOrEqual(margin - 0.1);
          expect(pts[i].y).toBeLessThanOrEqual(layout.height - margin + 0.1);
          
          // Separación entre cualquier par
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[j].x - pts[i].x;
            const dy = pts[j].y - pts[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            expect(dist).toBeGreaterThanOrEqual(minDistance - 0.1);
          }
        }
      }
    }
  });

  it('buildPathD', () => {
    const dEmpty = buildPathD([]);
    expect(dEmpty).toBe('');

    const pts = [
      { x: 10.5, y: 20 },
      { x: 30, y: 40 },
      { x: 50.123, y: 60 }
    ];
    const d = buildPathD(pts);
    expect(d).toMatch(/^M 10.50 20.00 L 30.00 40.00 L 50.12 60.00$/);
    
    // Solo M y L
    expect(d).not.toMatch(/[CQS]/);
  });

  it('splitPathAt', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 20 },
      { x: 30, y: 30 }
    ];

    // completed = 1
    const { done, locked } = splitPathAt(pts, 1);
    expect(done).toHaveLength(2); // idx 0, 1
    expect(locked).toHaveLength(3); // idx 1, 2, 3
    expect(done[1]).toEqual(locked[0]); // vértice compartido
    expect(done[0]).not.toBe(pts[0]); // no muta/es copia
    
    // completed = 0
    const r0 = splitPathAt(pts, 0);
    expect(r0.done).toHaveLength(1);
    expect(r0.locked).toHaveLength(4);
    
    // completed = count - 1
    const rEnd = splitPathAt(pts, 3);
    expect(rEnd.done).toHaveLength(4);
    expect(rEnd.locked).toHaveLength(1);
    
    // clamp
    const rClampOver = splitPathAt(pts, 99);
    expect(rClampOver.done).toHaveLength(4);
    expect(rClampOver.locked).toHaveLength(1);
    
    const rClampUnder = splitPathAt(pts, -10);
    expect(rClampUnder.done).toHaveLength(1);
    expect(rClampUnder.locked).toHaveLength(4);
  });

  it('RangeError en entradas inválidas', () => {
    const v = { width: 1024, height: 768 };
    expect(() => getPathLayout(-1, v)).toThrow(RangeError);
    expect(() => getPathLayout(1.5, v)).toThrow(RangeError);
    expect(() => getPathLayout(10, { width: 0, height: 768 })).toThrow(RangeError);
    expect(() => getPathLayout(10, { width: 1024, height: -10 })).toThrow(RangeError);
    expect(() => getPathLayout(10, { width: NaN, height: 768 })).toThrow(RangeError);
    expect(() => getPathLayout(10, { width: 1024, height: Infinity })).toThrow(RangeError);
  });
});
