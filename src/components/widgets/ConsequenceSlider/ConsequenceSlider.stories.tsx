import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ConsequenceSlider from './ConsequenceSlider';
import { leccion02Config } from '@/content/modulo-1/leccion-02-inflacion';

const meta = {
  title: 'Widgets/ConsequenceSlider',
  component: ConsequenceSlider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Arquetipo A — el usuario mueve un slider y ve una visualización actualizarse en vivo. Valida contra un valor objetivo con tolerancia configurable.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof ConsequenceSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estado por defecto: lección de inflación con todos los datos.
 * El usuario debe encontrar el año en que el almuerzo supera $15.000.
 */
export const Default: Story = {
  args: {
    config: leccion02Config,
    onStateChange: (state) => console.log('[State]', state),
    onAttempt: (answer, isCorrect) =>
      console.log('[Attempt]', { answer, isCorrect }),
  },
};

/**
 * Widget deshabilitado (post-completación o loading).
 */
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

/**
 * Configuración alternativa: slider de 2018 a 2030
 * con un precio base diferente.
 */
export const CustomRange: Story = {
  args: {
    config: {
      ...leccion02Config,
      startValue: 2018,
      endValue: 2030,
      basePrice: 12000,
      targetPrice: 25000,
      hookText: 'El precio del transporte en 12 años',
      instruction:
        'Mueve el slider hasta el año en que el pasaje de bus supera los $25.000.',
      dataPoints: [], // se generan automáticamente
    },
    onStateChange: (state) => console.log('[State]', state),
    onAttempt: (answer, isCorrect) =>
      console.log('[Attempt]', { answer, isCorrect }),
  },
};
