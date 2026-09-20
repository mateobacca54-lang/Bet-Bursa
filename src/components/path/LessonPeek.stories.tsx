import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import LessonPeek from './LessonPeek';
import { TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';

const meta = {
  title: 'Path/LessonPeek',
  component: LessonPeek,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof LessonPeek>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disponible: Story = { args: { id: 'peek-3', lesson: TEMARIO_MODULO_1[2], locked: false } };
export const Bloqueada: Story = { args: { id: 'peek-6', lesson: TEMARIO_MODULO_1[5], locked: true } };
