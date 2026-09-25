import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import HeroMoneda from './HeroMoneda';

const meta = {
  title: 'Landing/Capítulos/HeroMoneda',
  component: HeroMoneda,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'La primera pantalla: "Entiende tu plata." en el tipo más grande del sitio, la moneda de vidrio y oro quieta, y una línea de confianza bajo los dos botones. Sin progreso guardado, el CTA principal dice "Empieza gratis"; con progreso, cambia a "Sigue con la lección N" (useCtaProgreso).',
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
} satisfies Meta<typeof HeroMoneda>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Primera visita: sin progreso guardado, CTA por defecto. */
export const SinProgreso: Story = {};
