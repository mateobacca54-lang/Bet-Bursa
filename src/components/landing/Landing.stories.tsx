import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Landing from './Landing';
import StickyHero from './StickyHero';
import Manifesto from './Manifesto';
import MarketStrip from './MarketStrip';

const meta = {
  title: 'Landing/Página',
  component: Landing,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'La página pública de Bursa (`/`). Héroe con el titular fijo y columnas de tarjetas que se desplazan en sentidos opuestos al hacer scroll; manifiesto que se "lee" palabra por palabra; producto real en piezas; una lección incrustada; el camino del Módulo 1; y las imágenes del mercado pasando junto a un texto fijo. Con reduced-motion no hay sticky ni desplazamientos.',
      },
    },
  },
} satisfies Meta<typeof Landing>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Página completa. */
export const Completa: Story = {};

/** Solo el héroe (desplázate para ver las columnas moverse). */
export const Heroe: Story = { render: () => <StickyHero /> };

/** Solo el manifiesto (palabras que pasan de tenue a plena con el scroll). */
export const ManifiestoLectura: Story = {
  render: () => (
    <div style={{ paddingTop: '40vh' }}>
      <Manifesto />
    </div>
  ),
};

/** Solo la franja del mercado. */
export const FranjaMercado: Story = { render: () => <MarketStrip /> };
