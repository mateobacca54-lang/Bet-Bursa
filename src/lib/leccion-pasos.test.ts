import { describe, it, expect } from 'vitest';
import {
  dividirEnFrases,
  siguienteRevelacion,
  faltanPorRevelar,
  totalPasosEjemploVisual,
  pasoVisual,
  acertoApuesta,
  fraseResultadoApuesta,
} from './leccion-pasos';

describe('dividirEnFrases', () => {
  it('parte un texto simple en sus frases', () => {
    const frases = dividirEnFrases('El dinero existe porque el trueque casi nunca coincide. Vale porque todos confiamos.');
    expect(frases).toEqual(['El dinero existe porque el trueque casi nunca coincide.', 'Vale porque todos confiamos.']);
  });

  it('no corta el punto de un separador de miles ("$8.000")', () => {
    const frases = dividirEnFrases('El almuerzo cuesta $8.000 en el centro. Antes costaba menos.');
    expect(frases).toHaveLength(2);
    expect(frases[0]).toBe('El almuerzo cuesta $8.000 en el centro.');
  });

  it('no corta el punto de una cifra grande con varios separadores ("$1.200.000")', () => {
    const frases = dividirEnFrases('El celular cuesta $1.200.000 a 24 cuotas. Eso es más que de contado.');
    expect(frases).toEqual(['El celular cuesta $1.200.000 a 24 cuotas.', 'Eso es más que de contado.']);
  });

  it('respeta porcentajes con coma decimal ("6,5 %") sin tratarlos como corte', () => {
    const frases = dividirEnFrases('Los precios suben 6,5 % cada año. Eso se acumula rápido.');
    expect(frases).toEqual(['Los precios suben 6,5 % cada año.', 'Eso se acumula rápido.']);
  });

  it('no corta en una abreviatura conocida ("pág.")', () => {
    const frases = dividirEnFrases('Mira la tasa en la pág. 3 del contrato. Ahí está la trampa.');
    expect(frases).toEqual(['Mira la tasa en la pág. 3 del contrato.', 'Ahí está la trampa.']);
  });

  it('no trata una raya larga como fin de frase', () => {
    const frases = dividirEnFrases('El tiempo multiplica —o te cobra— mucho más de lo que parece.');
    expect(frases).toEqual(['El tiempo multiplica —o te cobra— mucho más de lo que parece.']);
  });

  it('no corta un punto que no está seguido de espacio ni de fin de texto', () => {
    const frases = dividirEnFrases('Ver www.ejemplo.co para más información. Ahí está todo.');
    // "www.ejemplo.co" no tiene espacio tras esos puntos, así que no se corta ahí.
    expect(frases[0]).toBe('Ver www.ejemplo.co para más información.');
    expect(frases).toHaveLength(2);
  });

  it('reconoce cierres con "!" y "?"', () => {
    const frases = dividirEnFrases('¿Ya sabes cuánto vale? Sí, claro que sí! Vamos a verlo.');
    expect(frases).toEqual(['¿Ya sabes cuánto vale?', 'Sí, claro que sí!', 'Vamos a verlo.']);
  });

  it('un texto vacío no produce frases', () => {
    expect(dividirEnFrases('')).toEqual([]);
    expect(dividirEnFrases('   ')).toEqual([]);
  });

  it('un texto sin punto final se conserva como una sola frase', () => {
    expect(dividirEnFrases('Una frase sin punto final')).toEqual(['Una frase sin punto final']);
  });

  it('funciona con los textos reales de las lecciones 1 a 3', () => {
    const l1 =
      'Antes del dinero se cambiaba una cosa por otra: eso se llama trueque. Funciona solo si lo que tú quieres lo tiene alguien que, al mismo tiempo, quiere lo tuyo. Como eso casi nunca coincide, la gente acordó usar algo que todos aceptan a cambio de cualquier cosa. Ese acuerdo se llama dinero.';
    expect(dividirEnFrases(l1)).toHaveLength(4);

    const l3 =
      'Guardas $100.000 con una tasa del 20 % anual. Con interés simple ganas $20.000 cada año, y a los 5 años tienes $200.000. Con interés compuesto, el segundo año ganas el 20 % de $120.000, o sea $24.000, y así sigue creciendo: a los 5 años tienes $248.832.';
    expect(dividirEnFrases(l3)).toHaveLength(3);
  });
});

describe('siguienteRevelacion / faltanPorRevelar', () => {
  it('avanza de a una frase sin pasarse del total', () => {
    expect(siguienteRevelacion(1, 4)).toBe(2);
    expect(siguienteRevelacion(3, 4)).toBe(4);
    expect(siguienteRevelacion(4, 4)).toBe(4);
  });

  it('faltanPorRevelar dice si el botón debe seguir ofreciendo "Seguir"', () => {
    expect(faltanPorRevelar(1, 4)).toBe(true);
    expect(faltanPorRevelar(4, 4)).toBe(false);
    expect(faltanPorRevelar(0, 0)).toBe(false);
  });
});

describe('totalPasosEjemploVisual / pasoVisual', () => {
  it('las lecciones 1-3 tienen esquema; el resto, por ahora, no', () => {
    expect(totalPasosEjemploVisual(1)).toBeGreaterThan(0);
    expect(totalPasosEjemploVisual(2)).toBeGreaterThan(0);
    expect(totalPasosEjemploVisual(3)).toBeGreaterThan(0);
    expect(totalPasosEjemploVisual(4)).toBe(0);
  });

  it('el paso visual nunca supera el total de esa lección', () => {
    const total = totalPasosEjemploVisual(1);
    expect(pasoVisual(99, 1)).toBe(total);
    expect(pasoVisual(0, 1)).toBe(0);
  });
});

describe('acertoApuesta / fraseResultadoApuesta', () => {
  it('acierta solo si el id elegido es el de la lección', () => {
    expect(acertoApuesta('papel', 'papel')).toBe(true);
    expect(acertoApuesta('igual', 'papel')).toBe(false);
    expect(acertoApuesta(null, 'papel')).toBe(false);
  });

  it('la frase de resultado no regaña, solo reconoce', () => {
    expect(fraseResultadoApuesta(true)).toMatch(/atinaste/i);
    expect(fraseResultadoApuesta(false)).not.toMatch(/mal|error|fallaste/i);
  });
});
