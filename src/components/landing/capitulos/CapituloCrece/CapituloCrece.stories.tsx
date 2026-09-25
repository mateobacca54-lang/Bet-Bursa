import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import CapituloCrece from './CapituloCrece';

const meta = {
  title: 'Landing/Capítulos/CapituloCrece',
  component: CapituloCrece,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'La firma interactiva del héroe: el scroll ancla la escena y mueve `m` de 0 a 120 meses. Dos contadores en vivo (guardar vs. un CDT que compone mes a mes), el frasco fundiendo sus 4 estampas por opacidad, y una línea delgada que se dibuja con el scroll. La conclusión y la nota de fuente llegan justo después de que el pin se suelta. Con prefers-reduced-motion, sin pin ni scrub: directo al mes 120.',
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
} satisfies Meta<typeof CapituloCrece>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Estado inicial: mes 0, los dos contadores en $0. Baja para ver el resto del gesto en el navegador. */
export const Default: Story = {};
