import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import CapituloEncoge from './CapituloEncoge';

const meta = {
  title: 'Landing/Capítulos/CapituloEncoge',
  component: CapituloEncoge,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Capítulo oscuro anclado: al bajar, los años pasan de 2026 a 2036 y la moneda se encoge (el área, no el lado, es proporcional al valor) mientras un contador dice cuánto compran hoy $100.000 con la inflación real del Banco de la República. Con prefers-reduced-motion, sin pin ni scrub: directo al año 2036 con la misma información.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="lp">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof CapituloEncoge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Estado inicial: año 2026, $100.000 completos. Baja para ver el resto del gesto en el navegador. */
export const Default: Story = {};
