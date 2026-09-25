import { describe, it, expect } from 'vitest';
import { 
  NODE_SIZE, 
  getPathLayout, 
  getPathPoints, 
  buildPathD, 
  splitPathAt,
  getMarketProfile,
  pickTagPlacement,
  isRectFree,
  rectsOverlap,
  createSpaceLedger
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

  describe('diagonal: una gráfica con subidas y bajadas', () => {
    const pts = getPathPoints(10, { width: 1024, height: 768 });

    it('x crece siempre: cada lección queda a la derecha de la anterior', () => {
      for (let i = 1; i < pts.length; i++) expect(pts[i].x).toBeGreaterThan(pts[i - 1].x);
    });

    it('la altura NO es monótona: hay retrocesos, y visibles', () => {
      // en pantalla "arriba" es y menor; un retroceso es un tramo donde y aumenta
      const tramos = pts.slice(1).map((p, i) => p.y - pts[i].y);
      const retrocesos = tramos.filter((dy) => dy > 0);
      expect(retrocesos.length).toBeGreaterThanOrEqual(3);
      // cada retroceso baja al menos 25 px: si no, a simple vista la línea sigue "solo subiendo"
      for (const dy of retrocesos) expect(dy).toBeGreaterThanOrEqual(25);
      // y hay subidas entre medias: no es una caída
      expect(tramos.filter((dy) => dy < 0).length).toBeGreaterThanOrEqual(4);
    });

    it('la primera lección es el punto más bajo y la última el más alto', () => {
      const ys = pts.map((p) => p.y);
      expect(pts[0].y).toBe(Math.max(...ys));
      expect(pts[pts.length - 1].y).toBe(Math.min(...ys));
    });

    it('la tendencia general es al alza: cada mitad termina más arriba de donde empezó', () => {
      const mid = Math.floor(pts.length / 2);
      expect(pts[mid].y).toBeLessThan(pts[0].y);
      expect(pts[pts.length - 1].y).toBeLessThan(pts[mid].y);
    });

    it('no es una recta: las pendientes cambian', () => {
      let cambia = false;
      for (let i = 2; i < pts.length; i++) {
        const m1 = (pts[i - 1].y - pts[i - 2].y) / (pts[i - 1].x - pts[i - 2].x);
        const m2 = (pts[i].y - pts[i - 1].y) / (pts[i].x - pts[i - 1].x);
        if (Math.abs(m1 - m2) > 0.001) cambia = true;
      }
      expect(cambia).toBe(true);
    });
  });

  describe('getMarketProfile', () => {
    it('entre 0 y 1, primero mínimo y último máximo, para cualquier cantidad', () => {
      for (const n of [2, 3, 5, 10, 17, 30]) {
        const h = getMarketProfile(n);
        expect(h).toHaveLength(n);
        expect(h[0]).toBe(0);
        expect(h[n - 1]).toBe(1);
        for (const v of h) {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(1);
        }
        // nadie iguala al primero ni al último: el mínimo y el máximo son únicos
        for (let i = 1; i < n - 1; i++) {
          expect(h[i]).toBeGreaterThan(0);
          expect(h[i]).toBeLessThan(1);
        }
      }
    });

    it('es determinista y los casos 0 y 1 no rompen', () => {
      expect(getMarketProfile(10)).toEqual(getMarketProfile(10));
      expect(getMarketProfile(0)).toEqual([]);
      expect(getMarketProfile(1)).toEqual([0]);
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

  describe('pickTagPlacement: la etiqueta "Sigue" no pisa nada', () => {
    const TAG = { width: 210, height: 46 };
    // Anchos donde el camino se ve como en el producto. Por debajo de ~900 px la etiqueta de la
    // lección 1 no tiene lado libre y el componente usa su posición anterior (ver LearningPath).
    const sizes = [
      { width: 900, height: 380 },
      { width: 1136, height: 455 },
      { width: 1500, height: 480 },
    ];

    it('para cada lección y cada tamaño hay un lado libre, y no toca otros nodos ni la línea', () => {
      for (const vp of sizes) {
        const pts = getPathPoints(10, vp);
        for (let i = 0; i < pts.length; i++) {
          const pos = pickTagPlacement(i, pts, vp, TAG);
          // A partir de ~1100 px siempre hay lado libre. A 900, la última lección (esquina superior
          // derecha) puede no tenerlo; entonces devuelve null y el componente usa su posición anterior.
          if (vp.width >= 1100) expect(pos, `lección ${i + 1} a ${vp.width}px`).not.toBeNull();
          if (!pos) continue;
          // dentro del lienzo
          expect(pos.left).toBeGreaterThanOrEqual(0);
          expect(pos.top).toBeGreaterThanOrEqual(0);
          expect(pos.left + TAG.width).toBeLessThanOrEqual(vp.width);
          expect(pos.top + TAG.height).toBeLessThanOrEqual(vp.height);
          // ningún otro nodo dentro del rectángulo
          for (let j = 0; j < pts.length; j++) {
            if (j === i) continue;
            const inX = pts[j].x > pos.left - NODE_SIZE / 2 && pts[j].x < pos.left + TAG.width + NODE_SIZE / 2;
            const inY = pts[j].y > pos.top - NODE_SIZE / 2 && pts[j].y < pos.top + TAG.height + NODE_SIZE / 2;
            expect(inX && inY, `nodo ${j + 1} bajo la etiqueta de ${i + 1} a ${vp.width}px`).toBe(false);
          }
        }
      }
    });

    it('es determinista y devuelve null para un índice inexistente', () => {
      const pts = getPathPoints(10, sizes[1]);
      expect(pickTagPlacement(3, pts, sizes[1], TAG)).toEqual(pickTagPlacement(3, pts, sizes[1], TAG));
      expect(pickTagPlacement(99, pts, sizes[1], TAG)).toBeNull();
    });

    it('prefiere la derecha cuando está libre (la lección 1 abre el camino)', () => {
      const pts = getPathPoints(10, sizes[2]);
      const pos = pickTagPlacement(0, pts, sizes[2], TAG)!;
      expect(pos.left).toBeGreaterThan(pts[0].x);
    });
  });

  describe('isRectFree: un adorno solo se muestra si no pisa la gráfica', () => {
    const vp = { width: 1136, height: 455 };
    const pts = getPathPoints(10, vp);

    it('la esquina superior izquierda está libre en un camino ancho', () => {
      expect(isRectFree({ left: 24, top: 44, width: 190, height: 148 }, pts, vp)).toBe(true);
    });

    it('un rectángulo encima de un nodo o de la línea NO está libre', () => {
      const n = pts[4];
      expect(isRectFree({ left: n.x - 20, top: n.y - 20, width: 40, height: 40 }, pts, vp)).toBe(false);
      // el punto medio entre dos nodos cae sobre la línea
      const mx = (pts[2].x + pts[3].x) / 2, my = (pts[2].y + pts[3].y) / 2;
      expect(isRectFree({ left: mx - 5, top: my - 5, width: 10, height: 10 }, pts, vp)).toBe(false);
    });

    it('fuera del lienzo no está libre', () => {
      expect(isRectFree({ left: -10, top: 0, width: 50, height: 50 }, pts, vp)).toBe(false);
      expect(isRectFree({ left: vp.width - 20, top: 0, width: 50, height: 50 }, pts, vp)).toBe(false);
    });
  });

  describe('rectsOverlap', () => {
    const a = { left: 0, top: 0, width: 100, height: 100 };

    it('detecta el solape y la separación', () => {
      expect(rectsOverlap(a, { left: 50, top: 50, width: 100, height: 100 })).toBe(true);
      expect(rectsOverlap(a, { left: 120, top: 0, width: 50, height: 50 })).toBe(false);
    });

    it('dos rectángulos que apenas se tocan cuentan como separados, salvo con holgura', () => {
      const pegado = { left: 100, top: 0, width: 50, height: 50 };
      expect(rectsOverlap(a, pegado)).toBe(false);
      expect(rectsOverlap(a, pegado, 8)).toBe(true);
    });
  });

  describe('createSpaceLedger: los adornos no se pisan entre ellos', () => {
    const vp = { width: 1136, height: 455 };
    const pts = getPathPoints(10, vp);
    const ETIQ = { width: 180, height: 27 };
    // La esquina superior izquierda está libre de nodos: ahí van el cartel y, a veces, la etiqueta
    const esquina = { left: 24, top: 44, width: 190, height: 148 };

    it('un sitio libre deja de estarlo una vez reservado', () => {
      const ledger = createSpaceLedger(pts, vp);
      expect(ledger.fits(esquina)).toBe(true);
      ledger.occupy(esquina);
      expect(ledger.fits(esquina)).toBe(false);
    });

    it('claim reserva si cabe y no toca nada si no cabe', () => {
      const ledger = createSpaceLedger(pts, vp);
      expect(ledger.claim(esquina)).toBe(true);
      expect(ledger.taken).toHaveLength(1);
      // el mismo sitio, ya tomado
      expect(ledger.claim({ ...esquina, left: 30 })).toBe(false);
      expect(ledger.taken).toHaveLength(1);
    });

    it('sigue respetando nodos y línea, no solo lo reservado', () => {
      const ledger = createSpaceLedger(pts, vp);
      const n = pts[4];
      expect(ledger.fits({ left: n.x - 20, top: n.y - 20, width: 40, height: 40 })).toBe(false);
    });

    it('la etiqueta evita un sitio que ya reservó otro adorno', () => {
      const libre = createSpaceLedger(pts, vp);
      const sinReserva = pickTagPlacement(0, pts, vp, ETIQ)!;
      // se reserva justo donde iba a caer la etiqueta
      libre.occupy({ left: sinReserva.left, top: sinReserva.top, ...ETIQ });
      const conReserva = pickTagPlacement(0, pts, vp, { ...ETIQ, reserved: libre.taken });
      expect(conReserva).not.toEqual(sinReserva);
    });

    it('el caso real: etiqueta primero, y el cartel cede si ya no cabe', () => {
      // Con 3 lecciones hechas y 1280x800 la etiqueta caía encima del cartel (60 %).
      const view = { width: 1136, height: 455 };
      const p = getPathPoints(10, view);
      const ledger = createSpaceLedger(p, view);
      const tag = pickTagPlacement(3, p, view, { ...ETIQ, reserved: ledger.taken });
      if (tag) ledger.occupy({ left: tag.left, top: tag.top, ...ETIQ });
      const cartel = { left: 24, top: 44, width: 176 + 58 / 3, height: 132 + 58 / 3 };
      // el cartel solo se muestra si de verdad queda sitio: lo importante es que la decisión
      // tenga en cuenta la etiqueta, no que el resultado sea sí o no
      const conEtiqueta = ledger.fits(cartel, { clearance: 12 });
      const sinEtiqueta = createSpaceLedger(p, view).fits(cartel, { clearance: 12 });
      expect(sinEtiqueta || !conEtiqueta).toBe(true);
      if (tag && conEtiqueta) {
        expect(rectsOverlap(cartel, { left: tag.left, top: tag.top, ...ETIQ }, 12)).toBe(false);
      }
    });
  });
});
