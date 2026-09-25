import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Monedita from './Monedita';

const meta = {
  title: 'Inicio/Monedita',
  component: Monedita,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'La moneda guía. Solo se mueve al entrar y al reaccionar a algo que hizo el usuario (variante `hop`). En reposo no flota ni parpadea: el movimiento explica o no existe.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300, padding: 'var(--space-8)', background: 'var(--sand-100)', borderRadius: 'var(--radius-lg)' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Monedita>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EnReposo: Story = { args: { reaction: 0 } };
/** Sube el contador: Monedita da un saltito. Bajo reduced-motion no salta. */
export const Reaccionando: Story = { args: { reaction: 1 } };
