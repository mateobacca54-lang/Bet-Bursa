import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Reveal from './Reveal';

const meta = {
  title: 'Motion/Reveal',
  component: Reveal,
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Entrada fadeUp que respeta prefers-reduced-motion. Con reduced-motion solo hace un cross-fade de 100 ms.' } },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Reveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Todo esto empieza con un billete que ya tienes en el bolsillo.' },
};

/** Con retraso: así se escalona el saludo (0 → 0.08 → 0.2 s). */
export const ConRetraso: Story = {
  args: { delay: 0.6, children: 'Entra 0,6 s después de montarse.' },
};

/** `instant` salta al estado final: es lo que pasa si el usuario interactúa mientras algo entra. */
export const Instantaneo: Story = {
  args: { instant: true, children: 'Aparece sin animar.' },
};
