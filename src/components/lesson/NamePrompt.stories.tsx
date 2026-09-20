import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import NamePrompt from './NamePrompt';

const meta = {
  title: 'Lección/NamePrompt',
  component: NamePrompt,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { onAnswer: () => {} },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(92vw, 480px)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NamePrompt>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Se pregunta una sola vez, al terminar la lección 1. Es opcional. */
export const Default: Story = {};
