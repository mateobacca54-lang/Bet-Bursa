'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import type { BursaWidgetProps, DragClassifierConfig, DragItem, WidgetState } from '@/lib/types';
import { DURATION, EASE_OUT_EXPO, SPRING_DRAG, variants } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { MAX_MISSES_PER_ITEM, correctZoneId, pickZoneAt, type ZoneRect } from '@/lib/widget-math';
import { WidgetShell } from '../shared';

/**
 * DragClassifier — Arquetipo B
 *
 * La persona clasifica ítems en zonas. Se puede hacer de tres maneras y las tres llegan
 * al mismo sitio (una acción, una sola función `place`):
 *   · arrastrando el ítem hasta la zona;
 *   · tocando el ítem y luego la zona (móvil y lector de pantalla);
 *   · con teclado: Enter/Espacio sobre el ítem lo elige, ← → ↑ ↓ mueven entre zonas,
 *     Enter/Espacio lo suelta, Escape cancela.
 *
 * El feedback es inmediato y por ítem. Un ítem mal colocado vuelve a su sitio con un
 * temblor corto y se explica; tras MAX_MISSES_PER_ITEM fallos se coloca solo con su
 * explicación, para que nadie quede atascado.
 */
export default function DragClassifier({
  config,
  onStateChange,
  onAttempt,
  disabled = false,
}: BursaWidgetProps<DragClassifierConfig, Record<string, string>>) {
  return (
    <WidgetShell
      instruction={config.instruction}
      correctMessage={config.explanationCorrect}
      wrongMessage={config.explanationWrong}
      onStateChange={onStateChange}
      maxAttempts={99}
    >
      {({ state, setState }) => (
        <Board config={config} state={state} setState={setState} onAttempt={onAttempt} disabled={disabled} />
      )}
    </WidgetShell>
  );
}

// ─── Tablero ────────────────────────────────────────────────

interface BoardProps {
  config: DragClassifierConfig;
  state: WidgetState;
  setState: (s: WidgetState) => void;
  onAttempt?: (answer: Record<string, string>, isCorrect: boolean) => void;
  disabled: boolean;
}

function Board({ config, state, setState, onAttempt, disabled }: BoardProps) {
  const { items, zones } = config;
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [misses, setMisses] = useState<Record<string, number>>({});
  const [shakes, setShakes] = useState<Record<string, number>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [overZone, setOverZone] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const zoneRefs = useRef<Record<string, HTMLElement | null>>({});
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  /** Instante en que terminó el último arrastre: el clic que lo sigue no debe elegir el ítem */
  const dragEndedAt = useRef(0);

  const boardRef = useRef<HTMLDivElement>(null);
  /** Si el foco estaba en el tablero al colocar, pasa a la siguiente tarjeta */
  const refocusNext = useRef(false);

  const locked = disabled || state === 'correct' || state === 'revealed';
  const pending = useMemo(() => items.filter((i) => !(i.id in placements)), [items, placements]);
  const current = pending[0];
  const itemById = useCallback((id: string) => items.find((i) => i.id === id), [items]);
  const zoneLabel = useCallback((id: string) => zones.find((z) => z.id === id)?.label ?? '', [zones]);

  useEffect(() => {
    if (refocusNext.current && current) {
      itemRefs.current[current.id]?.focus({ preventScroll: true });
    }
    refocusNext.current = false;
  }, [current]);

  // Todo colocado → terminó.
  useEffect(() => {
    if (state !== 'correct' && items.length > 0 && pending.length === 0) {
      setState('correct');
    }
  }, [pending.length, items.length, state, setState]);

  const place = useCallback(
    (itemId: string, zoneId: string) => {
      const item = itemById(itemId);
      const right = correctZoneId(zones, itemId);
      if (!item || !right || itemId in placements) return;

      refocusNext.current = !!boardRef.current?.contains(document.activeElement);
      setSelectedId(null);
      setOverZone(null);
      onAttempt?.({ ...placements, [itemId]: zoneId }, zoneId === right);

      if (zoneId === right) {
        setPlacements((p) => ({ ...p, [itemId]: zoneId }));
        setMessage(item.explanation ? `${item.label}: ${item.explanation}` : `${item.label} va en «${zoneLabel(right)}».`);
        return;
      }

      const n = (misses[itemId] ?? 0) + 1;
      setMisses((m) => ({ ...m, [itemId]: n }));
      setShakes((s) => ({ ...s, [itemId]: (s[itemId] ?? 0) + 1 }));

      if (n >= MAX_MISSES_PER_ITEM) {
        setPlacements((p) => ({ ...p, [itemId]: right }));
        setMessage(`Va en «${zoneLabel(right)}». ${item.explanation ?? ''}`.trim());
      } else {
        setMessage(`Casi. Ese no va en «${zoneLabel(zoneId)}». Prueba en la otra zona.`);
      }
    },
    [itemById, zones, placements, misses, onAttempt, zoneLabel],
  );

  const rects = useCallback((): ZoneRect[] => {
    return zones.flatMap((z) => {
      const el = zoneRefs.current[z.id];
      if (!el) return [];
      const r = el.getBoundingClientRect();
      return [{ id: z.id, left: r.left, top: r.top, right: r.right, bottom: r.bottom }];
    });
  }, [zones]);

  // Al elegir un ítem, el foco pasa a la primera zona: ← → ↑ ↓ y Enter hacen el resto.
  const select = (id: string) => {
    if (locked) return;
    if (selectedId === id) {
      setSelectedId(null);
      return;
    }
    setSelectedId(id);
    setMessage(`Elegiste «${itemById(id)?.label}». Ahora elige una zona.`);
    zoneRefs.current[zones[0]?.id]?.focus();
  };

  const cancelSelection = () => {
    const id = selectedId;
    setSelectedId(null);
    setMessage('');
    if (id) itemRefs.current[id]?.focus();
  };

  const onZoneKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (!selectedId) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelSelection();
      return;
    }
    const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const backward = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    if (forward || backward) {
      e.preventDefault();
      const next = (index + (forward ? 1 : -1) + zones.length) % zones.length;
      zoneRefs.current[zones[next].id]?.focus();
    }
  };

  return (
    <div ref={boardRef}>
      {/* Situación actual: una a la vez, para que las zonas siempre estén a la vista */}
      <div role="group" aria-label="Situación por clasificar" style={{ marginBottom: 'var(--space-4)' }}>
        {current ? (
          <>
            <p style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--font-size-sm)', color: 'var(--ink-secondary)' }}>
              Situación {items.length - pending.length + 1} de {items.length}
            </p>
            <ItemCard
              key={current.id}
              item={current}
              selected={selectedId === current.id}
              disabled={locked}
              shakeSignal={shakes[current.id] ?? 0}
              registerRef={(el) => (itemRefs.current[current.id] = el)}
              onSelect={() => {
                if (performance.now() - dragEndedAt.current < 300) return;
                select(current.id);
              }}
              onDragStart={() => setSelectedId(null)}
              onDragMove={(x, y) => {
                const z = pickZoneAt(rects(), x, y);
                setOverZone((prev) => (prev === z ? prev : z));
              }}
              onDragEnd={(x, y) => {
                const z = pickZoneAt(rects(), x, y);
                setOverZone(null);
                dragEndedAt.current = performance.now();
                // Si soltó lejos de toda zona, `dragSnapToOrigin` lo devuelve sin contar fallo.
                if (z) place(current.id, z);
              }}
            />
          </>
        ) : (
          <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>Ya clasificaste todo.</p>
        )}
      </div>

      {/* Zonas: siempre dos columnas, incluso en móvil (arrastrar a izquierda o derecha) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--space-3)' }}>
        {zones.map((zone, index) => {
          const placed = items.filter((i) => placements[i.id] === zone.id);
          const armed = selectedId !== null;
          const highlighted = overZone === zone.id;
          const selectedLabel = selectedId ? itemById(selectedId)?.label : undefined;
          return (
            <button
              key={zone.id}
              ref={(el) => {
                zoneRefs.current[zone.id] = el;
              }}
              type="button"
              disabled={locked}
              tabIndex={armed ? 0 : -1}
              aria-disabled={!armed || locked}
              aria-label={
                armed && selectedLabel
                  ? `Poner «${selectedLabel}» en ${zone.label}`
                  : `${zone.label}. ${placed.length} ${placed.length === 1 ? 'situación' : 'situaciones'}`
              }
              onClick={() => armed && selectedId && place(selectedId, zone.id)}
              onKeyDown={(e) => onZoneKeyDown(e, index)}
              style={{
                textAlign: 'left',
                fontFamily: 'var(--font-family)',
                minHeight: 128,
                minWidth: 0,
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: `2px dashed ${highlighted || armed ? 'var(--brand-600)' : 'var(--border)'}`,
                background: highlighted ? 'var(--brand-50)' : 'var(--surface)',
                color: 'var(--ink)',
                cursor: armed ? 'pointer' : 'default',
                transition: 'background var(--transition-fast), border-color var(--transition-fast)',
              }}
            >
              <span style={{ display: 'block', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2)' }}>
                {zone.label}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-1)', minWidth: 0 }}>
                {placed.map((i) => (
                  <PlacedChip key={i.id} label={i.shortLabel ?? i.label} title={i.label} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback por ítem (también lo anuncia el lector de pantalla) */}
      <p
        role="status"
        aria-live="polite"
        style={{
          margin: 'var(--space-4) 0 0 0',
          minHeight: '3em',
          fontSize: 'var(--font-size-base)',
          lineHeight: 'var(--line-height-normal)',
          color: 'var(--ink-secondary)',
        }}
      >
        {message}
      </p>
    </div>
  );
}

// ─── Ítem arrastrable ───────────────────────────────────────

interface ItemCardProps {
  item: DragItem;
  selected: boolean;
  disabled: boolean;
  shakeSignal: number;
  registerRef: (el: HTMLElement | null) => void;
  onSelect: () => void;
  onDragStart: () => void;
  onDragMove: (clientX: number, clientY: number) => void;
  onDragEnd: (clientX: number, clientY: number) => void;
}

function ItemCard({ item, selected, disabled, shakeSignal, registerRef, onSelect, onDragStart, onDragMove, onDragEnd }: ItemCardProps) {
  const reduced = usePrefersReducedMotion();
  const controls = useAnimationControls();

  // Cada tarjeta nueva entra desde abajo (12 px); con reduced-motion aparece sin moverse.
  useEffect(() => {
    controls.start({ opacity: 1, y: 0, transition: reduced ? { duration: 0.1 } : { duration: DURATION.element, ease: EASE_OUT_EXPO } });
  }, [controls, reduced]);

  // Cada fallo hace temblar el ítem una vez (no se hace en reduced-motion: ahí basta el texto).
  useEffect(() => {
    if (shakeSignal > 0 && !reduced) controls.start(variants.shake);
  }, [shakeSignal, reduced, controls]);

  return (
    <motion.button
      ref={registerRef}
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      drag={!disabled}
      dragSnapToOrigin
      dragMomentum={false}
      dragElastic={0.15}
      dragTransition={{ bounceStiffness: SPRING_DRAG.stiffness, bounceDamping: SPRING_DRAG.damping }}
      whileDrag={{ scale: 1.04, zIndex: 20 }}
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      animate={controls}
      onDragStart={onDragStart}
      onDrag={(_, info) => onDragMove(info.point.x - window.scrollX, info.point.y - window.scrollY)}
      onDragEnd={(_, info) => onDragEnd(info.point.x - window.scrollX, info.point.y - window.scrollY)}
      style={{
        fontFamily: 'var(--font-family)',
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-medium)',
        textAlign: 'left',
        color: 'var(--ink)',
        background: selected ? 'var(--brand-50)' : 'var(--surface-raised)',
        border: `2px solid ${selected ? 'var(--brand-600)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        padding: 'var(--space-3) var(--space-4)',
        minHeight: 'var(--touch-min)',
        maxWidth: '100%',
        cursor: disabled ? 'default' : 'grab',
        touchAction: 'none' /* superficie de gesto propia: el navegador no debe hacer scroll */,
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {item.label}
    </motion.button>
  );
}

function PlacedChip({ label, title }: { label: string; title: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.span
      title={title}
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduced ? { duration: 0.1 } : SPRING_DRAG}
      style={{
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--brand-700)',
        background: 'var(--brand-50)',
        borderRadius: 'var(--radius-pill)',
        padding: 'var(--space-1) var(--space-2)',
        maxWidth: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {label}
    </motion.span>
  );
}
