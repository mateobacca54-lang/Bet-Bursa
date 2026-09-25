import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import DatoReal from './DatoReal';

const meta = {
  title: 'Widgets/DatoReal',
  component: DatoReal,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'El número de hoy en Colombia para el concepto de la lección, con fecha y fuente (Banco de la República, DANE, Superfinanciera). Pinta el respaldo del repo y lo cambia por el dato en vivo de /api/indicadores si llega.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DatoReal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Lección 2 · inflación */
export const Inflacion: Story = { args: { indicadores: ['inflacion'] } };
/** Lección 3 · interés: lo que paga un CDT */
export const CDT: Story = { args: { indicadores: ['cdt'] } };
/** Lección 7 · tasa de interés */
export const TasaPolitica: Story = { args: { indicadores: ['tasaPolitica'] } };
/** Lección 9 · letra pequeña: el techo legal */
export const Usura: Story = { args: { indicadores: ['usura'] } };
/** Dólar hoy */
export const TRM: Story = { args: { indicadores: ['trm'] } };
