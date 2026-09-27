import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ProgressBar from './ProgressBar';

const meta = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['thin', 'medium'] },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(92vw, 480px)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Media: Story = {
  args: { value: 3, max: 10, label: 'Llevas 3 de 10', size: 'medium' },
};

export const Fina: Story = {
  args: { value: 7, max: 10, label: 'Llevas 7 de 10', size: 'thin' },
};

export const Completa: Story = {
  args: { value: 10, max: 10, label: 'Llevas 10 de 10' },
};
