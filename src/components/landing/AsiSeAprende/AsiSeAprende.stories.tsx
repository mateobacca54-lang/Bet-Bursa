import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import AsiSeAprende from './AsiSeAprende';

const meta = {
  title: 'Landing/AsiSeAprende',
  component: AsiSeAprende,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Capítulo "Así se aprende en Bursa.": carrusel horizontal "Highlights" con una tarjeta grande por momento de la lección —predices, lo ves, entiendes por qué—, cada una con capturas reales de escritorio y celular. Se recorre con touch, trackpad, teclado (flechas) o los controles de la píldora (puntos y pausa); avanza solo cada 6s si la sección está visible, no hay movimiento reducido y nadie interactuó.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="lp">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AsiSeAprende>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
