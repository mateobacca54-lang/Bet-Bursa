import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ModuleCard from './ModuleCard';
import { MODULO_1 } from '@/content/modulo-1/temario';
import { MODULO_1_BLURB, MODULO_2_PREVIEW } from '@/content/inicio';

const meta = {
  title: 'Inicio/ModuleCard',
  component: ModuleCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Un módulo en el mapa. El progreso es logro ("Llevas 2 de 10"), nunca deuda. Un módulo por abrir es una tarjeta quieta, no un enlace.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 'min(380px, 92vw)' }}><Story /></div>],
  args: { title: MODULO_1.title, blurb: MODULO_1_BLURB },
  tags: ['autodocs'],
} satisfies Meta<typeof ModuleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const m1 = { number: 1, total: 10, href: '/modulo/1' } as const;

export const Empezar: Story = { args: { card: { ...m1, status: 'start', completed: 0 } } };
export const EnCurso: Story = { args: { card: { ...m1, status: 'in-progress', completed: 2 } } };
export const Completo: Story = { args: { card: { ...m1, status: 'complete', completed: 10 } } };
export const Proximamente: Story = {
  args: {
    title: MODULO_2_PREVIEW.title,
    blurb: MODULO_2_PREVIEW.blurb,
    card: { number: 2, status: 'soon', completed: null, total: null, href: null },
  },
};
