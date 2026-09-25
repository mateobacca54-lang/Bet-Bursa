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
          'Sección "Una ruta que empieza por lo que ya vives": una línea SVG que se dibuja con el scroll une los cuatro módulos del tronco común. El Módulo 1 es la única parada disponible y despliega sus 10 temas literales del temario. Debajo, las dos ramas (trabajo e inversión) se nombran por sus módulos reales.',
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
