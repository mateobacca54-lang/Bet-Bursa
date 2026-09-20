import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import AnimatedComparator from './AnimatedComparator';
import { leccion03Config } from '@/content/modulo-1/leccion-03-interes';

const meta = {
  title: 'Widgets/AnimatedComparator',
  component: AnimatedComparator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Arquetipo D — comparar series. Con `predictionMode`, la persona predice antes de revelar: arrastra un punto (o usa flechas) hasta donde cree que llegará la serie oculta; al fijar, la serie real se dibuja por encima y el mensaje dice cuánto se acercó, sin ganar ni perder.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 'min(92vw, 640px)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AnimatedComparator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Lección 3: interés simple visible; el compuesto se predice y luego se revela. */
export const Prediccion: Story = { args: { config: leccion03Config } };

/** Sin `predictionMode`: ambas series se muestran completas desde el principio. */
export const SinPrediccion: Story = {
  args: { config: { ...leccion03Config, predictionMode: undefined } },
};
