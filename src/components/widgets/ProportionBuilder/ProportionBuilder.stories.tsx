import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { ProportionBuilderConfig } from '@/lib/types';
import ProportionBuilder from './ProportionBuilder';

// Ejemplo de Storybook inspirado en las tres categorías de L6; no es contenido publicado.
const config: ProportionBuilderConfig = {
  instruction: 'Tienes $800.000 para este mes. Reparte entre fijo, variable y ahorro.',
  totalAmount: 800000,
  categories: [
    { id: 'fijo', label: 'Fijo', initialPercent: 60, colorToken: '--brand-600' },
    { id: 'variable', label: 'Variable', initialPercent: 35, colorToken: '--gold-300' },
    { id: 'ahorro', label: 'Ahorro', initialPercent: 5, colorToken: '--brand-200' },
  ],
  savingsMinPercent: 10,
  feedbackPositive: 'Separaste al menos $80.000 para ahorrar este mes.',
  feedbackNegative: 'Con este reparto guardas menos de $80.000. Puedes ajustar las categorías para reservar al menos el 10 %.',
};

const meta = {
  title: 'Widgets/ProportionBuilder', component: ProportionBuilder,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
  tags: ['autodocs'],
  args: { config, onAttempt: fn(), onStateChange: fn() },
} satisfies Meta<typeof ProportionBuilder>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Presupuesto: Story = {};
export const TecladoYReintento: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Confirmar reparto' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(config.feedbackNegative);
    await expect(args.onAttempt).toHaveBeenLastCalledWith({ fijo: 60, variable: 35, ahorro: 5 }, false);
    await userEvent.click(canvas.getByRole('button', { name: 'Intentar de nuevo' }));
    const ahorro = canvas.getByRole('slider', { name: 'Ahorro' });
    await expect(ahorro).toHaveAttribute('aria-valuenow', '5');
    ahorro.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowUp}{ArrowRight}{ArrowUp}{ArrowRight}');
    await expect(ahorro).toHaveAttribute('aria-valuenow', '10');
    const amount = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(80000);
    await expect(ahorro).toHaveAttribute('aria-valuetext', `10 %, ${amount}`);
    const total = canvas.getAllByRole('slider').reduce((sum, slider) => sum + Number(slider.getAttribute('aria-valuenow')), 0);
    await expect(total).toBe(100);
    await expect(Number(canvas.getByRole('slider', { name: 'Fijo' }).getAttribute('aria-valuenow'))).toBeLessThan(60);
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Confirmar reparto' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(config.feedbackPositive);
    await expect(args.onAttempt).toHaveBeenLastCalledWith(expect.objectContaining({ ahorro: 10 }), true);
  },
};
export const ConLimites: Story = {
  args: { config: { ...config, categories: config.categories.map((c) => ({ ...c, minPercent: 5, maxPercent: 70 })) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fijo = canvas.getByRole('slider', { name: 'Fijo' });
    fijo.focus();
    await userEvent.keyboard('{End}');
    await expect(fijo).toHaveAttribute('aria-valuenow', '70');
    await userEvent.keyboard('{Home}');
    await expect(fijo).toHaveAttribute('aria-valuenow', '5');
    await expect(canvas.getAllByRole('slider').reduce((sum, s) => sum + Number(s.getAttribute('aria-valuenow')), 0)).toBe(100);
  },
};
export const Deshabilitado: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const slider of canvas.getAllByRole('slider')) await expect(slider).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Confirmar reparto' })).toBeDisabled();
  },
};
