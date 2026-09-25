import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import LeeLaLetra from './LeeLaLetra';

const meta = {
  title: 'Landing/LeeLaLetra',
  component: LeeLaLetra,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Sección "Lee la letra pequeña": el scroll mueve un resaltador por la simulación de crédito de la lección 9. Sticky solo en escritorio con movimiento; en móvil y con prefers-reduced-motion el documento se muestra una sola vez, con las tres zonas ya resaltadas y numeradas.',
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
} satisfies Meta<typeof LeeLaLetra>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
