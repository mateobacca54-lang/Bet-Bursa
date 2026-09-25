import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Imagotipo from './Imagotipo';

const meta = {
  title: 'Marca/Imagotipo',
  component: Imagotipo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Logo aprobado en Figma («Bursa · Identidad de marca»): símbolo de dos trazos y «bursa» en minúscula, sin punto. Todo sale de tokens.css; el alto lo define quien lo usa.',
      },
    },
  },
  tags: ['autodocs'],
  args: { titulo: 'Bursa', style: { height: 'var(--space-12)' } },
  argTypes: {
    variante: { control: 'inline-radio', options: ['horizontal', 'vertical', 'simbolo', 'simbolo-chico', 'wordmark'] },
    tono: { control: 'inline-radio', options: ['positivo', 'negativo', 'mono', 'sobre-naranja'] },
  },
} satisfies Meta<typeof Imagotipo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Firma principal: barra de la web y de la app. */
export const Horizontal: Story = { args: { variante: 'horizontal' } };

/** Formatos cuadrados: perfil de redes, splash. */
export const Vertical: Story = { args: { variante: 'vertical', style: { height: 'var(--space-16)' } } };

/** Ícono de la app, avatar, barra lateral cerrada. */
export const Simbolo: Story = { args: { variante: 'simbolo' } };

/** Solo de 16 a 24 px: trazo más grueso para que no se funda. */
export const SimboloChico: Story = { args: { variante: 'simbolo-chico', style: { height: 'var(--space-6)' } } };

/** Sobre tinta. */
export const Negativo: Story = {
  args: { tono: 'negativo' },
  decorators: [(S) => <div style={{ background: 'var(--ink)', padding: 'var(--space-8)' }}><S /></div>],
};

/** Sobre el naranja de marca. */
export const SobreNaranja: Story = {
  args: { tono: 'sobre-naranja' },
  decorators: [(S) => <div style={{ background: 'var(--brand-600)', padding: 'var(--space-8)' }}><S /></div>],
};

/** Sobre durazno u oro el naranja no llega a 3:1: todo en tinta. */
export const Mono: Story = {
  args: { tono: 'mono' },
  decorators: [(S) => <div style={{ background: 'var(--gold-300)', color: 'var(--ink)', padding: 'var(--space-8)' }}><S /></div>],
};
