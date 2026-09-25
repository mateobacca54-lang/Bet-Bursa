'use client';

import { useGSAP } from '@gsap/react';
import { DURATION, EASE_NAME, ScrollTrigger, SplitText, STAGGER, gsap, registerGsap } from '@/lib/gsap';

registerGsap();

/**
 * ApareceAlBajar — "que las cosas vayan apareciendo" al bajar (SPEC-LANDING-V2.md §11).
 *
 * No renderiza nada: busca los elementos ya pintados por el servidor (por clase o por
 * `data-aparece`) y les monta GSAP + ScrollTrigger encima. El HTML del servidor sale
 * completo y visible; este componente lo esconde en cliente justo antes de animarlo
 * (nunca al revés, para que sin JS —o mientras JS carga— no falte nada).
 *
 * Reglas (AGENTS.md + SPEC §11):
 * - Solo `transform` y `opacity` (autoAlpha). Las curvas y duraciones salen de motion.ts
 *   vía `src/lib/gsap.ts` (CustomEase 'bursaOutExpo' / 'bursaOutQuart').
 * - `prefers-reduced-motion: reduce` → no se crea NINGUNA aparición (gsap.matchMedia):
 *   el contenido queda visible desde el principio, tal cual lo pintó el servidor.
 * - Cada aparición corre una sola vez (`once: true`, `start: 'top 85%'`).
 * - Un clic o un foco de teclado sobre algo que está entrando lo completa al instante
 *   (`tween.progress(1)`): nunca bloquea la interacción.
 * - LeeLaLetra y MetodoDemo tienen su propio movimiento (framer, interactivo): esto solo
 *   toca sus `.lp-title` / `.lp-lead`, nunca su interior.
 */
export default function ApareceAlBajar() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    // Bajo reduced motion este callback nunca corre: no se crea nada (SPEC §11 regla 2).
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const scrollTriggers: ScrollTrigger[] = [];
      const splits: SplitText[] = [];
      let resizeObserver: ResizeObserver | undefined;
      let refreshTimer: ReturnType<typeof setTimeout> | undefined;
      let cancelled = false;

      /** Deja que un tween/timeline complete de un salto: nada bloquea la interacción. */
      function completeAncestorTweens(target: EventTarget | null) {
        let node = target instanceof Element ? target : null;
        while (node && node !== document.body) {
          for (const tween of gsap.getTweensOf(node)) tween.progress(1);
          node = node.parentElement;
        }
      }
      const onFocusIn = (e: FocusEvent) => completeAncestorTweens(e.target);
      const onPointerDown = (e: PointerEvent) => completeAncestorTweens(e.target);
      document.addEventListener('focusin', onFocusIn, true);
      document.addEventListener('pointerdown', onPointerDown, true);

      /** Líneas que suben desde su máscara (SplitText). Devuelve el tween, pausado. */
      function buildLines(el: Element, paused = true) {
        const split = new SplitText(el, { type: 'lines', mask: 'lines', autoSplit: true, aria: 'auto' });
        splits.push(split);
        gsap.set(split.lines, { yPercent: 100 });
        return gsap.to(split.lines, {
          yPercent: 0,
          duration: DURATION.scene,
          ease: EASE_NAME.outExpo,
          stagger: STAGGER * 2,
          paused,
        });
      }

      /** Sube y aparece (autoAlpha). Devuelve el tween, pausado. */
      function buildRise(el: Element, y = 24, delay = 0, paused = true) {
        gsap.set(el, { y, autoAlpha: 0 });
        return gsap.to(el, { y: 0, autoAlpha: 1, duration: DURATION.element, ease: EASE_NAME.outExpo, delay, paused });
      }

      /** Se dibuja de izquierda a derecha (scaleX). Devuelve el tween, pausado. */
      function buildDraw(el: Element, paused = true) {
        gsap.set(el, { scaleX: 0, transformOrigin: 'left center' });
        return gsap.to(el, { scaleX: 1, duration: DURATION.scene, ease: EASE_NAME.outExpo, paused });
      }

      /** Reproduce `playable` (tween o timeline) una sola vez, al entrar en pantalla. */
      function onEnterOnce(trigger: Element, playable: { play: () => void }, start = 'top 85%') {
        scrollTriggers.push(
          ScrollTrigger.create({
            trigger,
            start,
            once: true,
            onEnter: () => playable.play(),
          })
        );
      }

      function setup() {
        // ─── Héroe: al cargar, no por scroll (SPEC §11 tabla) ───
        const heroTitle = document.querySelector('#hero-titulo');
        if (heroTitle) {
          const tl = gsap.timeline();
          tl.add(buildLines(heroTitle, false));

          const restOfHero = ['.lp-hero-lead', '.lp-hero-actions']
            .map((sel) => document.querySelector(sel))
            .filter((el): el is Element => el !== null);
          restOfHero.forEach((el, i) => {
            tl.add(buildRise(el, 12, 0, false), i === 0 ? '-=0.1' : `-=${DURATION.element - STAGGER}`);
          });

          tl.play();
        }

        // ─── Cada .lp-title / .lp-lead (propias y de B), salvo el héroe y el cierre
        // (el cierre lleva su propia secuencia, más abajo) ───
        document.querySelectorAll<HTMLElement>('.lp-title').forEach((el) => {
          if (el.closest('.lp-closing')) return;
          onEnterOnce(el, buildLines(el));
        });
        document.querySelectorAll<HTMLElement>('.lp-lead').forEach((el) => {
          if (el.closest('.lp-closing')) return;
          onEnterOnce(el, buildRise(el, 12, 0.1));
        });

        // ─── Promesa única: se dibuja la línea y entra el texto ───
        document.querySelectorAll<HTMLElement>('.lp-promise').forEach((col, i) => {
          const line = col.querySelector<HTMLElement>('[data-aparece="dibujar"]');
          const body = col.querySelector<HTMLElement>('[data-aparece="subir"]');
          const tl = gsap.timeline({ paused: true, delay: i * STAGGER });
          if (line) tl.add(buildDraw(line, false));
          if (body) tl.add(buildRise(body, 12, 0, false), '-=0.15');
          if (line || body) onEnterOnce(col, tl);
        });

        // ─── Bloques sueltos marcados por A: tarjeta de instituciones, cada pregunta,
        // paradas del camino de B (.cam-parada, buscado por selector, sin tocar su archivo).
        // Las de dentro de .lp-promise y .lp-closing ya se manejaron aparte. ───
        document.querySelectorAll<HTMLElement>('[data-aparece="subir"], .cam-parada').forEach((el) => {
          if (el.closest('.lp-promise') || el.closest('.lp-closing')) return;
          onEnterOnce(el, buildRise(el, 24));
        });

        // ─── Cierre: Monedita con un pequeño rebote, luego el título por líneas,
        // luego el botón (secuencia propia, no la genérica) ───
        const closing = document.querySelector('.lp-closing');
        if (closing) {
          const avatar = closing.querySelector<HTMLElement>('.lp-closing-avatar');
          const title = closing.querySelector<HTMLElement>('.lp-title');
          const button = closing.querySelector<HTMLElement>('[data-aparece="subir"]');
          const tl = gsap.timeline({ paused: true });
          if (avatar) {
            gsap.set(avatar, { y: 16, scale: 0.94, autoAlpha: 0 });
            tl.to(avatar, {
              y: 0,
              scale: 1,
              autoAlpha: 1,
              duration: DURATION.element,
              ease: EASE_NAME.outQuart,
            });
          }
          if (title) tl.add(buildLines(title, false), '-=0.05');
          if (button) tl.add(buildRise(button, 12, 0, false), '-=0.1');
          if (avatar || title || button) onEnterOnce(closing, tl);
        }

        // Todo lo de arriba puede haber corrido el layout (SplitText re-envuelve en
        // líneas): un refresh final deja las posiciones de los ScrollTrigger correctas.
        ScrollTrigger.refresh();

        // ─── Refresca cuando cambie el alto de la página (el quiz y el camino crecen) ───
        const lp = document.querySelector('.lp');
        if (lp) {
          resizeObserver = new ResizeObserver(() => {
            clearTimeout(refreshTimer);
            refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
          });
          resizeObserver.observe(lp);
        }
      }

      // SplitText necesita medir el texto ya con la fuente final cargada, o las líneas
      // salen mal cortadas (SPEC §11 regla 1).
      document.fonts.ready.then(() => {
        if (!cancelled) setup();
      });

      return () => {
        cancelled = true;
        document.removeEventListener('focusin', onFocusIn, true);
        document.removeEventListener('pointerdown', onPointerDown, true);
        resizeObserver?.disconnect();
        clearTimeout(refreshTimer);
        scrollTriggers.forEach((st) => st.kill());
        splits.forEach((s) => s.revert());
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
