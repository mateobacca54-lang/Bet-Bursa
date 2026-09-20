import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Sidebar from './Sidebar';

const meta = {
  title: 'Shell/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ startCollapsed }: { startCollapsed: boolean }) {
  const [collapsed, setCollapsed] = useState(startCollapsed);
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
    </div>
  );
}

export const Expandida: Story = { args: { collapsed: false, onToggle: () => {} }, render: () => <Demo startCollapsed={false} /> };
export const Contraida: Story = { args: { collapsed: true, onToggle: () => {} }, render: () => <Demo startCollapsed /> };
