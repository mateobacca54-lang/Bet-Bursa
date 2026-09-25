'use client';

import { useRef } from 'react';
import type { BursaWidgetProps, DocumentHotspotConfig } from '@/lib/types';
import { Documento } from '@/components/illus';
import WidgetShell from '../shared/WidgetShell';
import './document-hotspot.css';

/**
 * DocumentHotspot — el arquetipo "Señalar": encontrar un dato dentro de un documento
 * (el extracto de M1L7, la simulación de crédito de M1L9). Entrena transferencia:
 * llevar lo aprendido a un papel del mundo real, que es el momento que de verdad importa.
 *
 * Las zonas son franjas horizontales invisibles-pero-marcadas (borde punteado tenue)
 * sobre `Documento`, que es decorativo (aria-hidden). Navegación con Tab/flechas entre
 * zonas como un grupo de botones normal — no hace falta nada especial: son botones reales.
 */
export default function DocumentHotspot({
  config,
  onStateChange,
  onAttempt,
  disabled = false,
}: BursaWidgetProps<DocumentHotspotConfig, string>) {
  const elegidaRef = useRef<string | null>(null);

  return (
    <WidgetShell
      instruction={config.instruction}
      correctMessage={config.explanationCorrect}
      wrongMessage={config.explanationWrong}
      hintMessage={config.hintText}
      onStateChange={onStateChange}
    >
      {({ state, setState }) => {
        // Igual que ConsequenceSlider: las zonas siguen activas en "wrong" — se puede
        // tocar otra directamente, sin pulsar antes "Intentar de nuevo".
        const locked = disabled || state === 'correct' || state === 'revealed';

        const elegir = (zonaId: string) => {
          if (locked) return;
          elegidaRef.current = zonaId;
          const correcta = zonaId === config.correctZoneId;
          setState(correcta ? 'correct' : 'wrong');
          onAttempt?.(zonaId, correcta);
        };

        return (
          <div style={{ position: 'relative', maxWidth: 440, margin: '0 auto' }}>
            <Documento id={config.documento} />
            <div role="group" aria-label={config.instruction} style={{ position: 'absolute', inset: 0 }}>
              {config.zones.map((zona) => {
                const esElegida = elegidaRef.current === zona.id;
                const esCorrecta = zona.id === config.correctZoneId && state === 'revealed';
                const marca = esCorrecta || (esElegida && state === 'correct') ? 'correcta' : esElegida && state === 'wrong' ? 'incorrecta' : undefined;
                return (
                  <button
                    key={zona.id}
                    type="button"
                    className="dh-zona"
                    data-elegida={marca}
                    disabled={locked}
                    aria-label={zona.label}
                    onClick={() => elegir(zona.id)}
                    style={{
                      left: `${zona.x * 100}%`,
                      top: `${zona.y * 100}%`,
                      width: `${zona.width * 100}%`,
                      height: `${zona.height * 100}%`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      }}
    </WidgetShell>
  );
}
