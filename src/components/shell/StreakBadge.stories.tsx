import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import StreakBadge from './StreakBadge';

const meta = {
  title: 'Shell/StreakBadge',
  component: StreakBadge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof StreakBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Activa: Story = { args: { days: 4 } };
export const UnDia: Story = { args: { days: 1 } };
/** Sin racha la llama va apagada, sin ningún reproche. */
export const Apagada: Story = { args: { days: 0 } };
