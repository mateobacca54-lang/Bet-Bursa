import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Landing from './Landing';

const meta = {
  title: 'Landing/Página',
  component: Landing,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'La página pública de Bursa (`/`). Página blanca, Bricolage en titulares y una escena del valor del dinero que cambia de ángulo con el scroll. Incluye la lectura de un crédito, una actividad de clasificación y el camino de aprendizaje.',
      },
    },
  },
} satisfies Meta<typeof Landing>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Página completa, de arriba abajo. */
export const Completa: Story = {};
