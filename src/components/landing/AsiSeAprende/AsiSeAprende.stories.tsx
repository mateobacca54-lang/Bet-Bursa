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
          'Capítulo "Así se aprende en Bursa.": dos celulares que flotan delante de una cinta 3D de marca y, al bajar con el scroll, se apartan cada uno hacia su lado inclinándose (referencia de movimiento: la landing de Slush; colores y tipografía son los de Bursa). Cada celular reproduce en bucle un video de una actividad real de la app —mover el tiempo en el precio del almuerzo, predecir y comparar el interés compuesto—, con un botón de pausa para los dos. En escritorio la sección se ancla mientras se recorre; en celular y con movimiento reducido no hay pin ni scroll: la pose queda fija en el estado final, ya separado, con la misma información.',
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
