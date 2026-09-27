import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Choice from './Choice';

const meta = {
  title: 'UI/Choice',
  component: Choice,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'selected', 'correct', 'wrong', 'disabled'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(92vw, 420px)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Choice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: { state: 'idle', children: 'Sube porque la plata pierde valor' },
};

export const Selected: Story = {
  args: { state: 'selected', children: 'Sube porque la plata pierde valor' },
};

export const Correct: Story = {
  args: { state: 'correct', children: 'Sube porque la plata pierde valor' },
};

export const Wrong: Story = {
  args: { state: 'wrong', children: 'Sube porque el dueño se volvió codicioso' },
};

export const Disabled: Story = {
  args: { state: 'disabled', children: 'Sube porque la plata pierde valor' },
};

export const ConLetra: Story = {
  args: { state: 'idle', leading: 'A', children: 'Sube porque la plata pierde valor' },
};
