import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Objeto, { Marca, OBJETOS, Pila } from './Objetos';

const meta = {
  title: 'Illus/Objetos',
  component: Objeto,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Los dibujitos chicos de las prácticas: la bici, el bus, los cromos, el almuerzo… Mismo trazo que las estampas, en lienzo cuadrado y sin fondo, para acompañar un texto. Decorativos: el texto de al lado dice lo mismo.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Objeto>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bici: Story = { args: { id: 'bici', size: 96 } };
export const Almuerzo: Story = { args: { id: 'almuerzo', size: 96 } };

/** Todos juntos, sobre el papel cálido y sobre blanco: aquí se ve si son una familia. */
export const Todos: Story = {
  args: { id: 'bici' },
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-4)', padding: 'var(--space-6)', background: 'var(--surface-raised)' }}>
      {OBJETOS.map((id) => (
        <div key={id} style={{ background: 'var(--sand-100)', borderRadius: 'var(--radius-lg)', padding: 12 }}>
          <Objeto id={id} size={96} />
        </div>
      ))}
    </div>
  ),
};

export const Pilas: Story = {
  args: { id: 'bici' },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, padding: 24 }}>
      <Pila count={10} />
      <Pila count={12} />
      <Marca tipo="si" />
      <Marca tipo="no" />
    </div>
  ),
};
