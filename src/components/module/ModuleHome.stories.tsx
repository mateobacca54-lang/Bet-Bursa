import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ModuleHome from './ModuleHome';
import { emptyProgress } from '@/lib/progress';

const meta = {
  title: 'Module/ModuleHome',
  component: ModuleHome,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof ModuleHome>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = new Date(2026, 8, 20, 12, 0);
const progress = { ...emptyProgress('modulo-1'), userName: 'Mateo', completedLessons: [1, 2], streakDays: 2, lastActiveDate: '2026-09-20' };

export const EnCurso: Story = { args: { progress, now, hydrated: true, onReviewed: () => {} } };
export const PrimeraVez: Story = { args: { progress: emptyProgress('modulo-1'), now, hydrated: true, onReviewed: () => {} } };
export const VolvioTarde: Story = {
  args: { progress: { ...progress, completedLessons: [1, 2, 3], lastActiveDate: '2026-09-15' }, now, hydrated: true, onReviewed: () => {} },
};
