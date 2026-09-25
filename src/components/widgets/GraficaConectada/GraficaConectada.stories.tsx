import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import GraficaConectada from './GraficaConectada';
import { RESPALDO } from '@/lib/indicadores/respaldo';

const meta = {
  title: 'Widgets/GraficaConectada',
  component: GraficaConectada,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Dos vistas conectadas (RUTA-DE-APRENDIZAJE §4.2, tomado de Brilliant): a la izquierda, ' +
          'el precio de una empanada por año; a la derecha, el bolsillo con la plata de hoy y cuántas ' +
          'empanadas alcanza a comprar. Una guía punteada conecta el punto activo de la gráfica con el ' +
          'bolsillo. Mover el año con el slider actualiza ambas vistas juntas.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    precioInicial: { control: { type: 'number', step: 50 } },
    inflacionAnual: { control: { type: 'number', step: 0.1 } },
    plata: { control: { type: 'number', step: 500 } },
    anios: { control: { type: 'number', min: 1, max: 20, step: 1 } },
  },
} satisfies Meta<typeof GraficaConectada>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estado por defecto: precio de hoy $2.500, inflación real de agosto de 2026
 * (RESPALDO.inflacion.valor, ya que la API en vivo puede no responder), $10.000 de plata
 * fija y un horizonte de 10 años.
 */
export const Default: Story = {
  args: {
    precioInicial: 2500,
    // RESPALDO.inflacion.valor es `number | null` por contrato (Indicador), pero el
    // respaldo de inflación siempre trae un número: no se guarda sin `valor`.
    inflacionAnual: RESPALDO.inflacion.valor ?? 6.24,
    plata: 10000,
    anios: 10,
  },
};

/**
 * Alta inflación (12% anual): el precio sube más rápido y el bolsillo pierde
 * empanadas antes. Sirve para comparar el mismo widget con dos velocidades de pérdida.
 */
export const AltaInflacion: Story = {
  args: {
    ...Default.args,
    inflacionAnual: 12,
  },
};

/**
 * Nota de reduced motion: con `prefers-reduced-motion: reduce` el punto resaltado, su
 * guía punteada y las empanadas que se apagan saltan directo al estado final — sin
 * spring ni fade — porque `usePrefersReducedMotion` (no el de framer-motion) apaga el
 * movimiento en JS. La información (el precio, la cuenta de empanadas, la frase) es
 * exactamente la misma con o sin movimiento; solo cambia qué tan brusca es la transición.
 * Para verlo: activar "reducir movimiento" en el sistema operativo antes de abrir esta
 * historia, o emular `prefers-reduced-motion: reduce` en las herramientas de desarrollo.
 */
export const ReducedMotion: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Activa "reducir movimiento" en tu sistema operativo (o emula `prefers-reduced-motion: reduce` ' +
          'en las herramientas de desarrollo) antes de mover el slider: el punto, la guía y las empanadas ' +
          'saltan al estado final en vez de animarse.',
      },
    },
  },
};
