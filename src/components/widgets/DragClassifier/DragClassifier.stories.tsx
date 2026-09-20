import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import DragClassifier from './DragClassifier';
import { leccion01Config } from '@/content/modulo-1/leccion-01-dinero';

const meta = {
  title: 'Widgets/DragClassifier',
  component: DragClassifier,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Arquetipo B — una situación a la vez que se clasifica en dos zonas. Se puede arrastrar, tocar (ítem y luego zona) o usar teclado (Enter elige, flechas cambian de zona, Enter suelta, Escape cancela). Tras 2 fallos con un mismo ítem, se coloca solo y se explica.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 'min(92vw, 640px)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DragClassifier>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Lección 1: trueque vs. dinero (6 situaciones). */
export const Leccion1: Story = { args: { config: leccion01Config } };

/** Deshabilitado: p. ej. después de completar. */
export const Deshabilitado: Story = { args: { config: leccion01Config, disabled: true } };
