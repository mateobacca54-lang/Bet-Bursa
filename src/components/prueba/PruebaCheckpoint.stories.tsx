import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import PruebaCheckpoint from './PruebaCheckpoint';
import { MODULO_1 } from '@/content/modulo-1/temario';

const meta = {
  title: 'Prueba/PruebaCheckpoint',
  component: PruebaCheckpoint,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'La tarjeta bajo el camino cuando las 10 lecciones ya están hechas pero la prueba de paso todavía no. Visualmente distinta de un nodo de lección a propósito: diamante con bandera, no un círculo numerado.',
      },
    },
  },
  tags: ['autodocs'],
  args: { moduleName: MODULO_1.title, href: '/modulo/1/prueba', delay: 0 },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640, background: 'var(--ink)', padding: 24, borderRadius: 12 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PruebaCheckpoint>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
