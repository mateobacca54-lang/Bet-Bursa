import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SpacedReview from './SpacedReview';

const meta = {
  title: 'Shell/SpacedReview',
  component: SpacedReview,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof SpacedReview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    lesson: 1,
    concept: 'El dinero es un acuerdo social de confianza, no un objeto con valor propio',
    onDone: () => console.log('[Lo tengo]'),
  },
};
