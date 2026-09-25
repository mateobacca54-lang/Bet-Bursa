'use client';

import { useRef, type MouseEvent } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { DURATION, EASE_NAME, gsap, registerGsap } from '@/lib/gsap';

type MoneditaState = 'idle' | 'correct' | 'wrong';

interface MoneditaInteractivaProps {
  state?: MoneditaState;
}

const MONEDITA_ASSETS = {
  idle: { src: '/monedita/monedita.webp', width: 600, height: 640 },
  correct: { src: '/monedita/monedita-celebra.webp', width: 256, height: 256 },
  wrong: { src: '/monedita/monedita-pensando.webp', width: 256, height: 256 },
} as const;

/**
 * MoneditaInteractiva
 * Renderiza a la mascota con GSAP internamente para los micro-movimientos (respiración y parallax),
 * pero expone una interfaz limpia basada en "states" para que Framer Motion pueda manejar
 * los saltos lógicos estructurales (hop) desde componentes superiores como HeroQuiz.
 */
export default function MoneditaInteractiva({ state = 'idle' }: MoneditaInteractivaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLImageElement>(null);
  const pointerTweens = useRef<{
    x: ReturnType<typeof gsap.quickTo>;
    rotationX: ReturnType<typeof gsap.quickTo>;
    rotationY: ReturnType<typeof gsap.quickTo>;
  } | null>(null);
  const reduced = usePrefersReducedMotion();

  const asset = MONEDITA_ASSETS[state];

  useGSAP(() => {
    const character = characterRef.current;
    pointerTweens.current = null;
    if (!character) return;
    if (reduced || state !== 'idle') {
      gsap.killTweensOf(character);
      gsap.set(character, { clearProps: 'transform' });
      return;
    }

    registerGsap();
    gsap.to(character, {
      y: -3, // Desplazamiento mínimo
      duration: DURATION.story * 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    const follow = { duration: DURATION.scene, ease: EASE_NAME.outQuart };
    pointerTweens.current = {
      x: gsap.quickTo(character, 'x', follow),
      rotationX: gsap.quickTo(character, 'rotationX', follow),
      rotationY: gsap.quickTo(character, 'rotationY', follow),
    };

    return () => { pointerTweens.current = null; };

  }, { scope: containerRef, dependencies: [reduced, state], revertOnUpdate: true });

  // 2. Interacción 3D local (Limitada al área del personaje)
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced || state !== 'idle' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    
    const rect = containerRef.current!.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Rango normalizado de -1 a 1
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    
    // Movimiento hiper limitado (máximo 6 grados)
    pointerTweens.current?.x(deltaX * 4);
    pointerTweens.current?.rotationY(deltaX * 6);
    pointerTweens.current?.rotationX(-deltaY * 6);
  };

  const handleMouseLeave = () => {
    if (state !== 'idle') return;
    pointerTweens.current?.x(0);
    pointerTweens.current?.rotationY(0);
    pointerTweens.current?.rotationX(0);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="flex items-center justify-center w-full h-full cursor-default"
      style={{ perspective: '800px' }}
    >
      <Image
        ref={characterRef}
        key={asset.src}
        src={asset.src}
        alt="Monedita"
        width={asset.width}
        height={asset.height}
        className="w-full h-auto object-contain"
        draggable={false}
        // Usamos priority en idle ya que es el LCP (Largest Contentful Paint) del Hero
        priority={state === 'idle'}
      />
    </div>
  );
}
