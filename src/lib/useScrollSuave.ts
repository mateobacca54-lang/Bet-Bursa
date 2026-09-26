'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger, gsap, registerGsap } from '@/lib/gsap';
import { SCROLL_SUAVE } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

const ESCRITORIO = '(min-width: 900px) and (pointer: fine) and (hover: hover)';

/**
 * Alisa el scroll de la rueda del mouse en escritorio (docs/PLAN-LANDING-V3.md §5): la rueda
 * avanza a saltos y los capítulos anclados, que dibujan con el scroll, se veían entrecortados.
 *
 * Lenis corre en el reloj de GSAP y le avisa a ScrollTrigger en cada cuadro, así los pines y
 * los scrubs leen la misma posición. No se monta con movimiento reducido ni en pantallas
 * táctiles: ahí manda el scroll nativo del sistema.
 */
export function useScrollSuave(): void {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !window.matchMedia(ESCRITORIO).matches) return;
    registerGsap();

    const lenis = new Lenis({
      lerp: SCROLL_SUAVE.lerp,
      // Los enlaces #ancla también se alisan, dejando libre el alto de la barra flotante.
      anchors: {
        offset: -Math.round(document.querySelector('.lp-nav')?.getBoundingClientRect().height ?? 0),
      },
    });
    const alScroll = () => ScrollTrigger.update();
    lenis.on('scroll', alScroll);
    const tick = (tiempo: number) => lenis.raf(tiempo * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); // el valor por defecto de GSAP
      lenis.off('scroll', alScroll);
      lenis.destroy();
    };
  }, [reduced]);
}
