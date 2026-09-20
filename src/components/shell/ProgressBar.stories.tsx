import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ProgressBar from './ProgressBar';

const meta = {
  title: 'Shell/ProgressBar',
  component: ProgressBar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const wrap = (Story: () => React.JSX.Element) => (
  <div style={{ width: 320 }}>
    <Story />
  </div>
);

export const Vacia: Story = { args: { value: 0, max: 10, label: 'Progreso del módulo 1' }, decorators: [wrap] };
export const EnCurso: Story = { args: { value: 3, max: 10, label: 'Progreso del módulo 1' }, decorators: [wrap] };
export const Completa: Story = { args: { value: 10, max: 10, label: 'Progreso del módulo 1' }, decorators: [wrap] };
