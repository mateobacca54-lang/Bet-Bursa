'use client';

import { ConsequenceSlider } from '@/components/widgets/ConsequenceSlider';
import { AnimatedComparator } from '@/components/widgets/AnimatedComparator';
import { DragClassifier } from '@/components/widgets/DragClassifier';
import { ProportionBuilder } from '@/components/widgets/ProportionBuilder';
import { DocumentHotspot } from '@/components/widgets/DocumentHotspot';
import { Elegir } from '@/components/widgets/Elegir';
import { DatoReal } from '@/components/widgets/DatoReal';
import { leccion01Config } from '@/content/modulo-1/leccion-01-dinero';
import { leccion02Config } from '@/content/modulo-1/leccion-02-inflacion';
import { leccion03Config } from '@/content/modulo-1/leccion-03-interes';
import { leccion06Config } from '@/content/modulo-1/leccion-06-presupuesto';
import { leccion07Config } from '@/content/modulo-1/leccion-07-tasa-interes';
import { leccion10Config } from '@/content/modulo-1/leccion-10-puente';
import type { WidgetState } from '@/lib/types';

function logState(nombre: string) {
  return (state: WidgetState) => console.log(`[${nombre}]`, state);
}

/** Una sección con su rótulo, para que cada arquetipo se identifique en la captura. */
function Seccion({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} data-widget-section={id} style={{ maxWidth: 720, margin: '0 auto var(--space-16) auto' }}>
      <div
        style={{
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--brand-700)',
          letterSpacing: 'var(--tracking-wide)',
          textTransform: 'uppercase' as const,
          marginBottom: 'var(--space-3)',
          padding: '0 var(--space-2)',
        }}
      >
        {titulo}
      </div>
      {children}
    </section>
  );
}

export default function WidgetsDevPage() {
  return (
    <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: 'var(--space-8) var(--space-4)' }}>
      {/* Header */}
      <div style={{ maxWidth: 720, margin: '0 auto var(--space-12) auto', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--brand-600)',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase' as const,
            marginBottom: 'var(--space-2)',
          }}
        >
          Bursa · Dev · Widgets
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-display-3)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          Arquetipos de widgets interactivos
        </h1>
        <p style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-base)', color: 'var(--ink-soft)', marginTop: 'var(--space-2)' }}>
          Página de desarrollo para probar widgets aislados, fuera del flujo de lección.
        </p>
      </div>

      <Seccion id="consequence-slider" titulo="Arquetipo A — ConsequenceSlider · Lección 02 · Inflación">
        <ConsequenceSlider config={leccion02Config} onStateChange={logState('ConsequenceSlider')} onAttempt={(a, ok) => console.log('[ConsequenceSlider attempt]', a, ok)} />
      </Seccion>

      <Seccion id="drag-classifier" titulo="Arquetipo B — DragClassifier · Lección 01 · Trueque vs. dinero">
        <DragClassifier config={leccion01Config} onStateChange={logState('DragClassifier')} onAttempt={(a, ok) => console.log('[DragClassifier attempt]', a, ok)} />
      </Seccion>

      <Seccion id="proportion-builder" titulo="Arquetipo Repartir — ProportionBuilder · Lección 06 · Presupuesto">
        <ProportionBuilder config={leccion06Config} onStateChange={logState('ProportionBuilder')} onAttempt={(a, ok) => console.log('[ProportionBuilder attempt]', a, ok)} />
      </Seccion>

      <Seccion id="document-hotspot" titulo="Arquetipo Señalar — DocumentHotspot · Lección 07 · Extracto bancario">
        <DocumentHotspot config={leccion07Config} onStateChange={logState('DocumentHotspot')} onAttempt={(a, ok) => console.log('[DocumentHotspot attempt]', a, ok)} />
      </Seccion>

      <Seccion id="animated-comparator" titulo="Arquetipo D — AnimatedComparator · Lección 03 · Interés simple vs. compuesto">
        <AnimatedComparator config={leccion03Config} onStateChange={logState('AnimatedComparator')} onAttempt={(a, ok) => console.log('[AnimatedComparator attempt]', a, ok)} />
      </Seccion>

      <Seccion id="elegir" titulo="Arquetipo F — Elegir · Lección 10 · Cierre de módulo">
        <Elegir config={leccion10Config} onStateChange={logState('Elegir')} onAttempt={(a, ok) => console.log('[Elegir attempt]', a, ok)} />
      </Seccion>

      <Seccion id="dato-real" titulo="DatoReal · El número de hoy en Colombia">
        <DatoReal indicadores={['inflacion', 'cdt', 'trm']} />
      </Seccion>
    </main>
  );
}
