import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { userEvent, within } from 'storybook/test';
import WarmUp from './WarmUp';
import { WARM_UP } from '@/content/inicio';

const meta = {
  title: 'Inicio/WarmUp',
  component: WarmUp,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'La apuesta de bienvenida: predecir antes de revelar. Ninguna opción se pinta de rojo o verde; la elegida solo se marca como "Tu apuesta". Se recorre entera con teclado.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(560px, 92vw)', padding: 'var(--space-6)', background: 'var(--surface-raised)', borderRadius: 'var(--radius-lg)' }}>
        <Story />
      </div>
    ),
  ],
  args: { config: WARM_UP, ctaHref: '#camino' },
  tags: ['autodocs'],
} satisfies Meta<typeof WarmUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SinApostar: Story = {};

export const ApostoHoyVale: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Hoy vale más/ }));
  },
};

export const ApostoQueEsLoMismo: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Es lo mismo/ }));
  },
};
