'use client';

import { useEffect, useState, type RefObject } from 'react';
import { rectsOverlap, type FreeRectBox } from './path-geometry';

// ============================================================
// useEvitarAyuda / useTapaAyuda — dónde cae el botón de ayuda (fijo, misma
// esquina en toda la app), medido en coordenadas LOCALES de un contenedor.
//
// POR QUÉ NO ES UNA ESQUINA FIJA: se midió que el botón de ayuda puede caer a
// MITAD de un bloque de contenido, no en su esquina — un bloque suele ser más
// alto que el hueco visible bajo él en la página sin desplazar, así que la
// intuición "está en la esquina inferior derecha" es falsa la mitad de las
// veces (ver 05-ESTADO.md, ola de solapes). Por eso se MIDE con
// getBoundingClientRect, no se calcula a ojo.
//
// Se recalcula al desplazar o cambiar de tamaño (con throttle de un cuadro), y
// además unas cuantas veces justo al montar: en la carga inicial, sin que nadie
// haya desplazado nada, la primera medición puede llegar antes de que el botón
// de ayuda termine de montarse en su propia parte del árbol — se comprobó que
// sin este reintento la primera pantalla podía quedar mal calculada hasta el
// primer scroll.
// ============================================================

const REINTENTOS_AL_MONTAR = 6;

/** Corre `medir` una vez y unas cuantas veces más en los primeros cuadros tras montar. */
function useMedicionAlMontar(medir: () => void) {
  useEffect(() => {
    let cuadro: number | null = null;
    let restantes = REINTENTOS_AL_MONTAR;

    const ciclo = () => {
      cuadro = null;
      medir();
      if (restantes > 0) {
        restantes--;
        cuadro = requestAnimationFrame(ciclo);
      }
    };
    const pedir = () => {
      if (cuadro === null) cuadro = requestAnimationFrame(medir);
    };

    ciclo();
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    return () => {
      if (cuadro !== null) cancelAnimationFrame(cuadro);
      window.removeEventListener('scroll', pedir);
      window.removeEventListener('resize', pedir);
    };
    // `medir` se recrea cada render, pero solo importa que exista al montar y en cada
    // evento; usarla como dependencia reiniciaría los reintentos en cada render, no
    // solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** `ref` debe apuntar al elemento del pie (position: fixed o sticky) que hay que evitar. */
export function useEvitarAyuda<T extends HTMLElement>(contenedorRef: RefObject<T | null>): FreeRectBox | null {
  const [rect, setRect] = useState<FreeRectBox | null>(null);

  // Relee contenedorRef.current en cada medición (no lo captura una sola vez): si el
  // elemento se oculta y reaparece —como puede hacer PruebaCheckpoint, que se esconde
  // a sí mismo cuando Ayuda lo tapa—, sigue midiendo contra el nodo real, no contra
  // uno ya fuera del documento.
  useMedicionAlMontar(() => {
    const contenedor = contenedorRef.current;
    const ayuda = document.querySelector('.ay-abrir');
    if (!contenedor || !ayuda) {
      setRect((prev) => (prev === null ? prev : null));
      return;
    }
    const c = contenedor.getBoundingClientRect();
    const a = ayuda.getBoundingClientRect();
    setRect({ left: a.left - c.left, top: a.top - c.top, width: a.width, height: a.height });
  });

  return rect;
}

/**
 * Como `useEvitarAyuda`, pero para el caso simple: ¿Ayuda tapa AHORA MISMO todo este
 * elemento? Devuelve el booleano ya calculado — mide y compara los dos rectángulos
 * dentro del propio efecto, así quien lo usa nunca necesita leer `ref.current` durante
 * el render (está prohibido: linter `react-hooks/refs`).
 */
export function useTapaAyuda<T extends HTMLElement>(contenedorRef: RefObject<T | null>): boolean {
  const [tapa, setTapa] = useState(false);

  useMedicionAlMontar(() => {
    const contenedor = contenedorRef.current;
    const ayuda = document.querySelector('.ay-abrir');
    if (!contenedor || !ayuda) {
      setTapa(false);
      return;
    }
    const c = contenedor.getBoundingClientRect();
    const a = ayuda.getBoundingClientRect();
    const local: FreeRectBox = { left: a.left - c.left, top: a.top - c.top, width: a.width, height: a.height };
    setTapa(rectsOverlap(local, { left: 0, top: 0, width: c.width, height: c.height }));
  });

  return tapa;
}
