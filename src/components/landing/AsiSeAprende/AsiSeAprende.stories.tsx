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
          'Capítulo "Así se aprende en Bursa.": un celular (marco CSS) muestra tres capturas reales de una lección — predices, lo ves, entiendes por qué. En escritorio el celular queda fijo y su pantalla cruza en opacidad según el paso activo; en móvil o con movimiento reducido cada paso lleva su propia captura.',
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
