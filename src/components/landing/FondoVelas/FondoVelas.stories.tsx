import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import FondoVelas from './FondoVelas';

const meta = {
  title: 'Landing/FondoVelas',
  component: FondoVelas,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Fondo casi invisible de velas de mercado (generadas por una caminata aleatoria con seed fija, src/lib/velas.ts). Mueve el puntero sobre el recuadro: las velas cercanas suben de opacidad y se levantan unos px. Sin puntero, sin táctil o con movimiento reducido, queda estático.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="lp">
        {/* FondoVelas se ancla al ancestro con posición más cercano (aquí, esta sección) */}
        <section
          style={{
            position: 'relative',
            isolation: 'isolate',
            minHeight: '70vh',
            display: 'grid',
            placeItems: 'center',
            background: 'var(--surface-raised)',
            overflow: 'hidden',
          }}
        >
          <Story />
          <p
            style={{
              position: 'relative',
              margin: 0,
              maxWidth: 420,
              textAlign: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-2xl)',
              color: 'var(--ink)',
            }}
          >
            Mueve el puntero por aquí encima
          </p>
        </section>
      </div>
    ),
  ],
} satisfies Meta<typeof FondoVelas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
