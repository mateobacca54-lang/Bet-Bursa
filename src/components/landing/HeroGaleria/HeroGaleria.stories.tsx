import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import HeroGaleria from './HeroGaleria';

const meta: Meta<typeof HeroGaleria> = {
  title: 'Landing/HeroGaleria',
  component: HeroGaleria,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Héroe de la landing v3: titular gigante con "plata" en naranja, la moneda en su pedestal (en escritorio el scroll la hace girar hasta mirarte de frente) y la cápsula "Gratis" con el botón principal.',
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
};
export default meta;

export const PorDefecto: StoryObj<typeof HeroGaleria> = {};
