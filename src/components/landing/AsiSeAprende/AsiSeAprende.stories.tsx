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
          'Capítulo "Así se aprende en Bursa.": dos celulares con pantallas reales de la app flotan y giran sobre la cinta de la marca (tres giros generados con Higgsfield). La sección se ancla y el scroll avanza el giro: en escritorio moviendo el video, como la moneda del héroe; en celular dibujando a mano una secuencia de imágenes en un canvas (más fluida en iOS que un seek de video). Con movimiento reducido o ahorro de datos se ve un cuadro fijo como imagen.',
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
