import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { userEvent, within } from 'storybook/test';
import HeroQuiz from './HeroQuiz';
import './landing.css';

const meta = {
  title: 'Landing/HeroQuiz',
  component: HeroQuiz,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'La pieza memorable del héroe: predecir antes de revelar (gancho literal de la lección 3). Monedita salta y cambia de cara según el acierto; la elegida se marca "Tu predicción" y la correcta "Respuesta" con un check, nunca solo con color. Se recorre entera con teclado.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="lp" style={{ width: 'min(420px, 92vw)', background: 'var(--surface-raised)' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof HeroQuiz>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Antes de elegir: las tres opciones activas, sin revelación. */
export const SinElegir: Story = {};

/** Elige la opción correcta: Monedita celebra. */
export const Acierto: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Valen más hoy/ }));
  },
};

/** Elige "Es lo mismo": Monedita queda pensativa y la correcta se revela aparte. */
export const FalloEsLoMismo: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /^Es lo mismo$/ }));
  },
};

/** Elige "Valen más en 10 años": el otro fallo posible. */
export const FalloEnDiezAnos: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Valen más en 10 años/ }));
  },
};
