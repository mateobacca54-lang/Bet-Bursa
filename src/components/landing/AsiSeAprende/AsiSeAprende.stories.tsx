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
          'Capítulo "Así se aprende en Bursa.": dos celulares con pantallas reales de la app flotan y giran sobre la cinta de la marca (tres giros generados con Higgsfield). En escritorio la sección se ancla y el video avanza con el scroll, como la moneda del héroe; en celular, con movimiento reducido o ahorro de datos se ve el último cuadro como imagen fija.',
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
