'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './shell.css';

export type SidebarItemId = 'inicio' | 'modulos' | 'progreso';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  active?: SidebarItemId;
}

const ICON_PROPS = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
} as const;

const ITEMS: { id: SidebarItemId; label: string; href: string | null; icon: ReactNode }[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    href: '/inicio',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10" />
      </svg>
    ),
  },
  {
    id: 'modulos',
    label: 'Módulos',
    href: '/modulo/1',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M3 18 9 11l4 4 8-9" />
        <path d="M15 6h6v6" />
      </svg>
    ),
  },
  {
    id: 'progreso',
    label: 'Progreso',
    href: '/progreso',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />
      </svg>
    ),
  },
];

/**
 * Sidebar — navegación principal (solo desde 900 px; en móvil no se muestra).
 *
 * Colapsa de 260 a 72 px. El cambio de ancho es INSTANTÁNEO a propósito: animar `width`
 * rompe la regla de solo transform/opacity (AGENTS.md) y obligaría al camino a recalcular
 * su geometría en cada cuadro. Lo que sí se anima es la opacidad de las etiquetas.
 */
export default function Sidebar({ collapsed, onToggle, active = 'modulos' }: SidebarProps) {
  return (
    <nav
      aria-label="Principal"
      className="bursa-sidebar"
      style={{ width: collapsed ? 72 : 260, transition: 'opacity var(--transition-normal)' }}
    >
      <Link
        href="/"
        className={`bursa-sidebar-brand${collapsed ? ' bursa-sidebar-brand--compact' : ''}`}
        aria-label="Bursa, inicio"
      >
        <span className={`bursa-brand-art${collapsed ? ' bursa-brand-art--compact' : ''}`}>
          <Image src="/brand/bursa-imagotipo-h-principal.jpg" alt="" fill sizes={collapsed ? '32px' : '160px'} draggable={false} />
        </span>
      </Link>

      {ITEMS.map((item) => {
        const content = (
          <>
            <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span>
            <span
              style={{
                opacity: collapsed ? 0 : 1,
                width: collapsed ? 0 : 'auto',
                overflow: 'hidden',
                transition: 'opacity var(--transition-normal)',
              }}
            >
              {item.label}
            </span>
          </>
        );

        return item.href ? (
          <Link
            key={item.id}
            href={item.href}
            className="bursa-nav-item"
            aria-current={active === item.id ? 'page' : undefined}
            title={collapsed ? item.label : undefined}
          >
            {content}
          </Link>
        ) : (
          <span
            key={item.id}
            className="bursa-nav-item"
            aria-disabled="true"
            title={`${item.label} (pronto)`}
          >
            {content}
          </span>
        );
      })}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
        className="bursa-nav-item"
        style={{
          marginTop: 'auto',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-family)',
          width: '100%',
        }}
      >
        <svg
          {...ICON_PROPS}
          style={{
            flexShrink: 0,
            transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition-normal)',
          }}
        >
          <path d="m15 6-6 6 6 6" />
        </svg>
        <span style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto', overflow: 'hidden' }}>
          Contraer
        </span>
      </button>
    </nav>
  );
}
