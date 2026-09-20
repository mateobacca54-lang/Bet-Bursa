import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import AppShell from './AppShell';

const meta = {
  title: 'Shell/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const content = <p style={{ margin: 0, color: 'var(--ink-secondary)' }}>Aquí va el contenido de la pantalla.</p>;

export const EnCurso: Story = { args: { completed: 3, total: 10, moduleLabel: 'Módulo 1', streakDays: 3, children: content } };
export const SinProgreso: Story = { args: { completed: 0, total: 10, moduleLabel: 'Módulo 1', streakDays: 0, children: content } };
