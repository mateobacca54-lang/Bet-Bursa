import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import FloatingPapers from './FloatingPapers';

const meta = {
  title: 'Decor/FloatingPapers',
  component: FloatingPapers,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Papeles financieros que flotan tras el saludo. Parallax con el cursor (tope 12 px, solo puntero fino) y deriva en reposo. Con prefers-reduced-motion se desmonta entero. Decisión de layout por container query: con el héroe estrecho se ocultan.' } },
  },
  decorators: [
    (Story) => (
      <div className="bursa-hero" style={{ height: 420, maxWidth: 1100, margin: '0 auto', padding: 'var(--space-8)' }}>
        <Story />
        <p style={{ position: 'relative', textAlign: 'center', paddingTop: 'var(--space-16)', fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
          Mueve el cursor por aquí
        </p>
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof FloatingPapers>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
