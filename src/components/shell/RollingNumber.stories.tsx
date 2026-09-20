import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import RollingNumber from './RollingNumber';

const meta = {
  title: 'Shell/RollingNumber',
  component: RollingNumber,
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'La cifra rueda hacia arriba cuando CAMBIA. En el primer render aparece quieta.' } },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RollingNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { value: 2 } };

function Counter() {
  const [value, setValue] = useState(2);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
      <span style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-bold)' }}>
        <RollingNumber value={value} />
      </span>
      <button type="button" onClick={() => setValue((v) => v + 1)} style={{ minHeight: 'var(--touch-min)', padding: '0 var(--space-6)' }}>
        Sumar una lección
      </button>
    </div>
  );
}

/** Pulsa el botón: el número rueda. */
export const Interactivo: Story = { args: { value: 2 }, render: () => <Counter /> };
