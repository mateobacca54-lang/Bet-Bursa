import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import TopicSheet from './TopicSheet';
import { HERO_LEFT, HERO_RIGHT } from './landing-data';

const meta = {
  title: 'Landing/TopicSheet',
  component: TopicSheet,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'El panel que se abre al tocar una tarjeta del héroe: solo lo básico del tema (la pregunta con la que arranca y su idea central, ambas literales del temario). Diálogo modal: el foco queda dentro, Esc y el clic fuera lo cierran. Nace desde la posición de la tarjeta con transform y opacity.',
      },
    },
  },
  args: { origin: { x: 240, y: 300, width: 220 }, onClose: () => {} },
} satisfies Meta<typeof TopicSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disponible: Story = { args: { card: HERO_RIGHT[0] } };
export const Pronto: Story = { args: { card: HERO_LEFT[1] } };
