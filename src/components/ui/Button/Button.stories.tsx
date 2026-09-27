import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Button from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'select', options: ['md', 'lg'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: 'Empieza gratis', variant: 'primary' },
};

export const Secondary: Story = {
  args: { children: 'Ver cómo funciona', variant: 'secondary' },
};

export const Ghost: Story = {
  args: { children: 'Ahora no', variant: 'ghost' },
};

export const Large: Story = {
  args: { children: 'Continuar', size: 'lg' },
};

export const Disabled: Story = {
  args: { children: 'Comprobar', disabled: true },
};

export const ComoEnlace: Story = {
  args: { children: 'Ir a la lección', href: '/modulo/1' },
};

export const FullWidth: Story = {
  args: { children: 'Terminar lección', fullWidth: true },
  parameters: { layout: 'padded' },
};
