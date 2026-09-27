import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Eyebrow from './Eyebrow';

const meta = {
  title: 'UI/Eyebrow',
  component: Eyebrow,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['brand', 'muted'] },
  },
} satisfies Meta<typeof Eyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Brand: Story = {
  args: { tone: 'brand', children: 'Lección 3 · Interés' },
};

export const Muted: Story = {
  args: { tone: 'muted', children: 'Ahora tú' },
};
