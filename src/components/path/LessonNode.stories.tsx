import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import LessonNode from './LessonNode';

const meta = {
  title: 'Path/LessonNode',
  component: LessonNode,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <ol style={{ position: 'relative', width: 200, height: 120, margin: 0, padding: 0, background: 'var(--ink)', borderRadius: 'var(--radius-md)' }}>
        <Story />
      </ol>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof LessonNode>;

export default meta;
type Story = StoryObj<typeof meta>;

const common = { x: 100, y: 60, href: '#leccion', delay: 0, instant: false, onEnter: () => {}, onLeave: () => {}, onLockedAttempt: () => {} };

export const Completada: Story = { args: { ...common, number: 1, state: 'completed', label: 'Lección 1. Completada.' } };
/** Halo que pulsa: es la lección que sigue. */
export const Actual: Story = { args: { ...common, number: 3, state: 'current', label: 'Lección 3. Es la siguiente.' } };
/** Púlsala: hace shake y NO navega. */
export const Bloqueada: Story = { args: { ...common, number: 7, state: 'locked', label: 'Lección 7. Bloqueada.' } };
