import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import BotonAyuda from './BotonAyuda';

const meta: Meta<typeof BotonAyuda> = {
  title: 'Ayuda/BotonAyuda',
  component: BotonAyuda,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof BotonAyuda>;

export const Cerrado: Story = {};

export const Abierto: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /ayuda/i }));
    await expect(await canvas.findByRole('dialog')).toBeVisible();
  },
};

export const ConMotivoElegido: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /ayuda/i }));
    const opcion = await canvas.findByRole('radio', { name: 'No entendí esta lección' });
    await userEvent.click(opcion);
    await expect(opcion).toHaveAttribute('aria-checked', 'true');
    // Hasta que no hay motivo, no se puede enviar: un reporte sin motivo no sirve de nada
    await expect(canvas.getByRole('button', { name: 'Enviar' })).toBeEnabled();
  },
};

export const SinMotivoNoSePuedeEnviar: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /ayuda/i }));
    await canvas.findByRole('dialog');
    await expect(canvas.getByRole('button', { name: 'Enviar' })).toBeDisabled();
  },
};

export const SeCierraConEscape: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const abrir = canvas.getByRole('button', { name: /ayuda/i });
    await userEvent.click(abrir);
    await canvas.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    // El panel sale con una animación: se espera a que termine de desmontarse
    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(abrir).toHaveFocus();
  },
};
