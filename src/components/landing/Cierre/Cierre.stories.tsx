import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Cierre from './Cierre';

const meta = {
  title: 'Landing/Cierre',
  component: Cierre,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Capítulo de cierre: "Tu primera lección dura tres minutos." Monedita saluda una vez cuando la sección entra en pantalla; debajo, la tarjeta de la primera lección con su título y gancho del temario.',
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
} satisfies Meta<typeof Cierre>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
