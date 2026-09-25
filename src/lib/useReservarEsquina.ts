'use client';

import { useEffect, useRef } from 'react';

// ============================================================
// useReservarEsquina — evita que el botón de ayuda (fijo, esquina inferior
// derecha en TODA la app) se monte sobre el pie de una pantalla con su propio
// botón ahí mismo.
//
// POR QUÉ EXISTE: se midió con scripts/medir-solapes.mjs que el botón de ayuda
// tapaba hasta un 28 % del botón "Continuar" del pie de una lección, en varios
// anchos. La causa: los dos son `position: fixed`/`sticky` en la misma esquina,
// y ninguno sabía del otro.
//
// CÓMO LO RESUELVE: el pie de la pantalla (el único que sabe su propio alto,
// que además CAMBIA — crece cuando aparece el aviso "Resuelve el ejercicio para
// seguir") mide su alto real con ResizeObserver y lo publica en una variable
// CSS en <html>, que .ay-abrir (ayuda.css) usa para subir su propio `bottom`.
// Ninguna pantalla sin pie de página se ve afectada: la variable no existe y
// el valor por defecto (0px) no cambia nada.
// ============================================================

const VARIABLE = '--pie-flotante-alto';

/** `ref` debe apuntar al elemento del pie (position: fixed o sticky) que hay que evitar. */
export function useReservarEsquina<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const raiz = document.documentElement;

    const observer = new ResizeObserver(([entry]) => {
      raiz.style.setProperty(VARIABLE, `${Math.ceil(entry.contentRect.height)}px`);
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      raiz.style.removeProperty(VARIABLE);
    };
  }, []);

  return ref;
}
