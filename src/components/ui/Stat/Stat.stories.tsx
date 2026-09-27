import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Stat from './Stat';

const meta = {
  title: 'UI/Stat',
  component: Stat,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pesos: Story = {
  args: {
    value: 45000,
    label: 'Lo que vale hoy el almuerzo',
    format: { style: 'currency', currency: 'COP', maximumFractionDigits: 0 },
  },
};

export const Porcentaje: Story = {
  args: {
    value: 0.12,
    label: 'Inflación anual',
    format: { style: 'percent', maximumFractionDigits: 1 },
  },
};

export const Progreso: Story = {
  args: {
    value: 3,
    suffix: ' de 10',
    label: 'Lecciones completas',
  },
};
