import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Heading from './Heading';

const meta = {
  title: 'UI/Heading',
  component: Heading,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['display', 'title'] },
    size: { control: 'select', options: ['xl', 'lg', 'md', 'sm'] },
    level: { control: 'select', options: [1, 2, 3, 4] },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DisplayXl: Story = {
  args: { variant: 'display', size: 'xl', children: 'Llevas 3 de 10' },
};

export const DisplayLg: Story = {
  args: { variant: 'display', size: 'lg', children: '¿Qué pasa cuando la plata pierde valor?' },
};

export const TituloDeTarjeta: Story = {
  args: { variant: 'title', size: 'md', level: 3, children: 'La inflación' },
};

export const ConFocoAlMontar: Story = {
  args: {
    variant: 'display',
    size: 'lg',
    level: 1,
    focusOnMount: true,
    children: 'Este título recibe el foco sin anillo naranja',
  },
};
