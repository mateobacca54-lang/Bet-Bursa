import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import PathLine from './PathLine';
import { getPathLayout } from '@/lib/path-geometry';

const meta = {
  title: 'Path/PathLine',
  component: PathLine,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof PathLine>;

export default meta;
type Story = StoryObj<typeof meta>;

const layout = getPathLayout(10, { width: 900, height: 420 });
const frame = (Story: () => React.JSX.Element) => (
  <div style={{ position: 'relative', width: 900, height: 420, background: 'var(--ink)', borderRadius: 'var(--radius-lg)' }}>
    <Story />
  </div>
);

/** El trazo naranja se DIBUJA; después aparece el tramo punteado. Recarga la story para verlo. */
export const SeDibuja: Story = { args: { layout, currentIndex: 3, startDelay: 0.2, instant: false, reduced: false }, decorators: [frame] };
export const EstadoFinal: Story = { args: { layout, currentIndex: 3, startDelay: 0, instant: true, reduced: false }, decorators: [frame] };
export const ReducedMotion: Story = { args: { layout, currentIndex: 3, startDelay: 0, instant: false, reduced: true }, decorators: [frame] };
