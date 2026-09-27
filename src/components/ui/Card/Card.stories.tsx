import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Card from './Card';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['raised', 'sunk', 'ink'] },
    size: { control: 'select', options: ['md', 'lg'] },
    pad: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Raised: Story = {
  args: {
    variant: 'raised',
    children: 'Tarjeta blanca sobre papel, con filo y sombra suave.',
  },
};

export const Sunk: Story = {
  args: {
    variant: 'sunk',
    children: 'Bloque hundido: --paper-sunk, sin borde ni sombra.',
  },
};

export const Ink: Story = {
  args: {
    variant: 'ink',
    children: 'Héroe oscuro: máximo un bloque por pantalla.',
  },
};

export const Grande: Story = {
  args: {
    variant: 'raised',
    size: 'lg',
    children: 'Tarjeta grande de capítulo, radio --radius-card-lg.',
  },
};
