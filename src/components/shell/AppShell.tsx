'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar, { type SidebarItemId } from './Sidebar';
import StreakBadge from './StreakBadge';
import ProgressBar from './ProgressBar';
import RollingNumber from './RollingNumber';
import './shell.css';

interface AppShellProps {
  children: ReactNode;
  /** Lecciones completadas del módulo actual */
  completed: number;
  total: number;
  /** Etiqueta del módulo, ej. "Módulo 1" */
  moduleLabel: string;
  streakDays: number;
  active?: SidebarItemId;
}

/**
 * AppShell — marco de la aplicación: barra lateral (desde 900 px) + encabezado fijo.
 * El encabezado lleva el progreso del módulo y la racha.
 */
export default function AppShell({
  children,
  completed,
  total,
  moduleLabel,
  streakDays,
  active = 'modulos',
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bursa-shell">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} active={active} />

      <div className="bursa-main">
        <header className="bursa-header">
          <Link
            href="/inicio"
            className="bursa-header-brand"
            aria-label="Bursa, inicio"
          >
            <span className="bursa-brand-art">
              <Image src="/brand/bursa-imagotipo-h-principal.jpg" alt="" fill sizes="160px" draggable={false} />
            </span>
          </Link>

          <div className="bursa-header-progress">
            <span
              style={{
                whiteSpace: 'nowrap',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--ink)',
              }}
            >
              {moduleLabel}
              <span style={{ color: 'var(--ink-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
                {' · '}
                <RollingNumber value={completed} /> de {total}
              </span>
            </span>
            <ProgressBar value={completed} max={total} label={`Progreso del ${moduleLabel.toLowerCase()}`} />
          </div>

          <StreakBadge days={streakDays} />
        </header>

        <main id="contenido" className="bursa-content">
          {children}
        </main>
      </div>
    </div>
  );
}
