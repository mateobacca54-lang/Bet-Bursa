'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { DURATION, gsap, registerGsap } from '@/lib/gsap';
import './hero-scroll-scene.css';

/** En escritorio se fija el héroe completo; en móvil, la escena compacta. */
export default function HeroScrollScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const plinthRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    registerGsap();
    const mm = gsap.matchMedia();
    const setup = (pinHero: boolean) => {
      const scene = sceneRef.current;
      const card = cardRef.current;
      const plinth = plinthRef.current;
      if (!scene || !card || !plinth) return;
      const hero = scene.closest<HTMLElement>('.lp-hero');
      const trigger = pinHero ? hero : scene;
      if (!trigger) return;

      gsap.timeline({
        scrollTrigger: {
          trigger,
          start: pinHero
            ? () => `top ${Math.round(document.querySelector('.lp-nav')?.getBoundingClientRect().height ?? 0)}px`
            : 'top 50%',
          end: pinHero ? () => `+=${Math.round(window.innerHeight * 0.45)}` : 'top 15%',
          ...(pinHero ? { pin: trigger, pinSpacing: true } : {}),
          scrub: DURATION.scene,
          invalidateOnRefresh: true,
        },
      })
        .to(card, { rotationY: 90, y: -8, scale: 0.97, duration: DURATION.scene, ease: 'none' }, 0)
        .to(card, { rotationY: 180, y: 0, scale: 1, duration: DURATION.scene, ease: 'none' })
        .to(plinth, { scaleX: 0.75, opacity: 0.45, duration: DURATION.scene, ease: 'none' }, 0)
        .to(plinth, { scaleX: 1, opacity: 1, duration: DURATION.scene, ease: 'none' });

      return () => gsap.set([card, plinth], { clearProps: 'transform' });
    };
    mm.add('(min-width: 800px) and (prefers-reduced-motion: no-preference)', () => setup(true));
    mm.add('(max-width: 799px) and (prefers-reduced-motion: no-preference)', () => setup(false));
    return () => mm.revert();
  }, { scope: sceneRef });

  return (
    <figure className="hs-scene" ref={sceneRef} aria-labelledby="hs-title hs-caption">
      <h2 id="hs-title" className="hs-title">¿Ahorrar e invertir son lo mismo?</h2>

      <div className="hs-stage" aria-hidden="true">
        <div className="hs-plinth" ref={plinthRef} />
        <div className="hs-card" ref={cardRef}>
          <div className="hs-face hs-face--front">
            <span className="hs-face-top">La misma plata. Dos decisiones.</span>
            <div className="hs-art">
              <Image src="/illustrations/ahorro-inversion-bursa-v2.png" alt="" width={1542} height={1020} sizes="(max-width: 799px) 90vw, 440px" priority draggable={false} />
            </div>
            <div className="hs-art-labels"><span>Ahorrar</span><span>Invertir</span></div>
          </div>
          <div className="hs-face hs-face--back">
            <strong className="hs-back-answer">No son lo mismo.</strong>
            <div className="hs-outcomes">
              <div><strong>Ahorrar</strong><span>Guardas la plata para usarla cuando la necesites.</span></div>
              <div><strong>Invertir</strong><span>Buscas que crezca, pero también puede perder valor.</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="hs-static">
        <p><strong>Ahorrar:</strong> guardas la plata para usarla cuando la necesites.</p>
        <p><strong>Invertir:</strong> buscas que crezca, pero también puede perder valor.</p>
      </div>

      <figcaption id="hs-caption" className="hs-caption">
        <span className="lp-sr-only">Ahorrar te ayuda a guardar plata; invertir busca hacerla crecer y conlleva riesgo. </span>
        Empiezas con la misma plata. Lo que cambia es el propósito y el riesgo.
      </figcaption>
    </figure>
  );
}
