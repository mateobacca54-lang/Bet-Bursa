import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Estampa, { type EstampaScene } from './Estampa';

const meta = {
  title: 'Illus/Estampa',
  component: Estampa,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Objetos de la plata cotidiana en Colombia. Estampas vectoriales de contorno redondeado e ilustraciones generadas para empanada, ahorro y presupuesto, sobre blanco y con acentos suaves. Son decorativas: el significado y las cifras viven en el texto de la interfaz.',
      },
    },
  },
  decorators: [(Story, context) => <div style={{ width: context.parameters.layout === 'fullscreen' ? '100%' : 320, maxWidth: '100%' }}><Story /></div>],
  tags: ['autodocs'],
} satisfies Meta<typeof Estampa>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Billete: Story = { args: { scene: 'billete' } };
export const Empanada: Story = { args: { scene: 'empanada' } };
export const Monedas: Story = { args: { scene: 'monedas' } };
export const Alcancia: Story = { args: { scene: 'alcancia' } };
export const Tarjeta: Story = { args: { scene: 'tarjeta' } };
export const Porcentaje: Story = { args: { scene: 'porcentaje' } };
export const Plaza: Story = { args: { scene: 'plaza' } };
export const Tienda: Story = { args: { scene: 'tienda' } };
export const Pantalla: Story = { args: { scene: 'pantalla' } };
export const Presupuesto: Story = { args: { scene: 'presupuesto' } };
export const Banco: Story = { args: { scene: 'banco' } };
export const Birrete: Story = { args: { scene: 'birrete' } };
export const Semilla: Story = { args: { scene: 'semilla' } };

/** Las trece juntas, también en móvil: comparación de escala y tratamiento. */
export const Todas: Story = {
  args: { scene: 'billete' },
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 'var(--space-4)', padding: 'var(--space-6)', background: 'var(--surface)', boxSizing: 'border-box' }}>
      {(['billete', 'empanada', 'monedas', 'alcancia', 'tarjeta', 'porcentaje', 'plaza', 'tienda', 'pantalla', 'presupuesto', 'banco', 'birrete', 'semilla'] as EstampaScene[]).map((s) => (
        <figure key={s} style={{ margin: 0 }}>
          <Estampa scene={s} style={{ borderRadius: 'var(--radius-lg)' }} />
          <figcaption style={{ padding: 'var(--space-2)', color: 'var(--ink)', fontFamily: 'var(--font-family)' }}>{s}</figcaption>
        </figure>
      ))}
    </div>
  ),
};
