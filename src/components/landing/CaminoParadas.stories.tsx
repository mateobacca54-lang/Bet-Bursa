import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import CaminoParadas from './CaminoParadas';

const meta = {
  title: 'Landing/CaminoParadas',
  component: CaminoParadas,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Sección "Un camino de seis paradas": una línea SVG que se dibuja con el scroll une los seis módulos. El Módulo 1 es la única parada disponible y despliega sus 10 temas literales del temario.',
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
} satisfies Meta<typeof CaminoParadas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
