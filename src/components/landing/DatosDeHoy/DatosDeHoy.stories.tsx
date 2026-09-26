import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import DatosDeHoy from './DatosDeHoy';

const meta = {
  title: 'Landing/DatosDeHoy',
  component: DatosDeHoy,
  parameters: {
    layout: 'fullscreen',
    // La sección ya trae su propio fondo (--ink); el fondo claro de Storybook por
    // defecto no importa, pero 'dark' evita el salto visual al abrir la historia.
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        component:
          'Banda oscura de "datos en vivo" (docs/PLAN-LANDING-V3.md §3, fila 2), inspirada en Ramp: los cinco indicadores reales de useIndicadores(), con su fecha y su fuente. Sin animación: es estática a propósito.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DatosDeHoy>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Los cinco indicadores con el respaldo del repo (mismo HTML en servidor y cliente). */
export const Default: Story = {};
