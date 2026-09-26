import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { DURATION, EASE_OUT_EXPO, EASE_OUT_QUART, STAGGER } from './motion';

// ============================================================
// gsap.ts — registro central de GSAP (SPEC-LANDING-V2.md §11).
//
// GSAP es SOLO para "apariciones al hacer scroll" (ScrollTrigger + SplitText).
// Framer Motion sigue siendo el motor de lo interactivo (los widgets de lección y
// el contador de LeeLaLetra): nunca las dos animan el MISMO elemento.
//
// Los plugins tocan `window`/`document` al registrarse, así que el registro
// pasa SOLO en cliente (guardado con `typeof window`). Las curvas no se
// inventan: se registran una vez a partir de los bezier de motion.ts.
// ============================================================

export const EASE_NAME = {
  outExpo: 'bursaOutExpo',
  outQuart: 'bursaOutQuart',
} as const;

let registered = false;

/** Registra los plugins de GSAP y las curvas de motion.ts. No hace nada en el servidor ni dos veces. */
export function registerGsap(): void {
  if (registered || typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create(EASE_NAME.outExpo, EASE_OUT_EXPO.join(','));
  CustomEase.create(EASE_NAME.outQuart, EASE_OUT_QUART.join(','));
  registered = true;
}

export { gsap, ScrollTrigger, SplitText, DURATION, STAGGER };
