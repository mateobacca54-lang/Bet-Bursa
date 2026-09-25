import { describe, it, expect } from 'vitest';
import {
  cifraContador,
  contarAciertos,
  deudaTrasGracia,
  esClasificacionCorrecta,
  estadoFila,
  pasoActivo,
  splitEtiquetaValor,
  zonaCorrectaDe,
} from './landing-lectura';
import { leccion01Config } from '@/content/modulo-1/leccion-01-dinero';
import { leccion09Config } from '@/content/modulo-1/leccion-09-letra-pequena';

describe('deudaTrasGracia', () => {
  it('fija el ejemplo de la lección 9: $3.000.000 al 1,8 % mensual, 6 meses de gracia', () => {
    expect(deudaTrasGracia(3_000_000, 0.018, 6)).toBe(3_338_935);
  });

  it('sin meses de gracia, la deuda no cambia', () => {
    expect(deudaTrasGracia(1_000_000, 0.02, 0)).toBe(1_000_000);
  });

  it('siempre redondea al peso', () => {
    expect(Number.isInteger(deudaTrasGracia(500_000, 0.015, 3))).toBe(true);
  });
});

describe('pasoActivo', () => {
  it('al inicio, el primer paso', () => {
    expect(pasoActivo(0, 3)).toBe(0);
  });

  it('a mitad de camino, el paso del medio', () => {
    expect(pasoActivo(0.5, 3)).toBe(1);
  });

  it('cerca del final o justo en el final, el último paso (no se pasa de largo)', () => {
    expect(pasoActivo(0.99, 3)).toBe(2);
    expect(pasoActivo(1, 3)).toBe(2);
  });

  it('recorta valores fuera de 0..1 en vez de romperse', () => {
    expect(pasoActivo(-1, 3)).toBe(0);
    expect(pasoActivo(2, 3)).toBe(2);
  });

  it('con 0 pasos no revienta: devuelve 0', () => {
    expect(pasoActivo(0.5, 0)).toBe(0);
  });
});

describe('estadoFila — el papel de LeeLaLetra v2', () => {
  it('la fila del paso actual está "actual"', () => {
    expect(estadoFila('cuota', 0)).toBe('actual');
    expect(estadoFila('monto', 1)).toBe('actual');
    expect(estadoFila('gracia', 2)).toBe('actual');
  });

  it('una fila de un paso ya pasado queda "leída"', () => {
    expect(estadoFila('cuota', 1)).toBe('leida');
    expect(estadoFila('cuota', 2)).toBe('leida');
    expect(estadoFila('tasa', 2)).toBe('leida');
  });

  it('una fila de un paso futuro no lleva marca ("pendiente")', () => {
    expect(estadoFila('monto', 0)).toBe('pendiente');
    expect(estadoFila('gracia', 0)).toBe('pendiente');
    expect(estadoFila('gracia', 1)).toBe('pendiente');
  });

  it('se recalcula con el paso actual: si el usuario sube, una fila "leída" vuelve a "pendiente"', () => {
    expect(estadoFila('monto', 1)).toBe('actual');
    expect(estadoFila('monto', 0)).toBe('pendiente');
  });
});

describe('splitEtiquetaValor — separa el label de una zona en etiqueta y valor', () => {
  it('parte por los dos puntos, sin escribir las cifras a mano', () => {
    const zona = leccion09Config.zones.find((z) => z.id === 'monto')!;
    expect(splitEtiquetaValor(zona.label)).toEqual({ etiqueta: 'Monto solicitado', valor: '$3.000.000' });
  });

  it('la fila de gracia conserva todo el texto después de los dos puntos (letra chica en dos frases)', () => {
    const zona = leccion09Config.zones.find((z) => z.id === 'gracia')!;
    const { etiqueta, valor } = splitEtiquetaValor(zona.label);
    expect(etiqueta).toBe('Período de gracia');
    expect(valor).toBe('6 meses. El interés no pagado se suma al saldo.');
  });

  it('sin dos puntos, todo el texto va a la etiqueta', () => {
    expect(splitEtiquetaValor('Solo etiqueta')).toEqual({ etiqueta: 'Solo etiqueta', valor: '' });
  });
});

describe('cifraContador — el contador nunca retrocede', () => {
  it('avanza cuando la propuesta es mayor', () => {
    expect(cifraContador(3_000_000, 3_100_000)).toBe(3_100_000);
  });

  it('se queda igual si la propuesta es menor (no retrocede)', () => {
    expect(cifraContador(3_338_935, 3_000_000)).toBe(3_338_935);
  });

  it('se queda igual si la propuesta es igual', () => {
    expect(cifraContador(3_338_935, 3_338_935)).toBe(3_338_935);
  });
});

describe('MetodoDemo — clasificar sin ver la respuesta antes de predecir', () => {
  const zones = leccion01Config.zones;

  it('bici-celular es trueque; bus necesita dinero', () => {
    expect(zonaCorrectaDe('bici-celular', zones)).toBe('trueque');
    expect(zonaCorrectaDe('bus', zones)).toBe('dinero');
  });

  it('reconoce un acierto y un fallo', () => {
    expect(esClasificacionCorrecta('cromos', 'trueque', zones)).toBe(true);
    expect(esClasificacionCorrecta('arriendo', 'trueque', zones)).toBe(false);
  });

  it('cuenta los aciertos de las 4 situaciones de la demo (3 de 4)', () => {
    const respuestas: Record<string, 'trueque' | 'dinero'> = {
      'bici-celular': 'trueque', // bien
      bus: 'dinero', // bien
      cromos: 'dinero', // mal (es trueque)
      arriendo: 'dinero', // bien
    };
    expect(contarAciertos(respuestas, zones)).toBe(3);
  });

  it('las 4 bien clasificadas cuentan 4 de 4', () => {
    const respuestas: Record<string, 'trueque' | 'dinero'> = {
      'bici-celular': 'trueque',
      bus: 'dinero',
      cromos: 'trueque',
      arriendo: 'dinero',
    };
    expect(contarAciertos(respuestas, zones)).toBe(4);
  });
});
