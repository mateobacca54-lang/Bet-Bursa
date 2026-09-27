import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Pill from './Pill';

const meta = {
  title: 'UI/Pill',
  component: Pill,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['brand', 'gold', 'muted'] },
  },
} satisfies Meta<typeof Pill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Brand: Story = {
  args: { tone: 'brand', children: 'Hecha' },
};

export const Gold: Story = {
  args: { tone: 'gold', children: '5 días seguidos' },
};

export const Muted: Story = {
  args: { tone: 'muted', children: '3 min' },
};
