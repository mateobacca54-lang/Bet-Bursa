import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import EmailPrompt from './EmailPrompt';

const meta = {
  title: 'Lección/EmailPrompt',
  component: EmailPrompt,
  parameters: { layout: 'centered', a11y: { test: 'error' } },
  tags: ['autodocs'],
  args: { onAnswer: fn() },
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof EmailPrompt>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const CorreoInvalido: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), 'sin-arroba');
    await userEvent.click(canvas.getByRole('button', { name: 'Avísame' }));
    await expect(canvas.getByRole('alert')).toHaveTextContent('No parece un correo. Revísalo e intenta otra vez.');
    await expect(args.onAnswer).not.toHaveBeenCalled();
    await expect(globalThis.fetch).not.toHaveBeenCalled();
  },
};
export const CorreoValido: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), 'persona@ejemplo.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Avísame' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Listo. Te escribo cuando esté.');
    await expect(args.onAnswer).toHaveBeenCalledOnce();
    await expect(globalThis.fetch).toHaveBeenCalledWith('/api/suscribir', expect.objectContaining({
      method: 'POST', body: JSON.stringify({ correo: 'persona@ejemplo.com' }),
    }));
  },
};
export const SinCorreo: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'No, gracias' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Sin problema.');
    await expect(args.onAnswer).toHaveBeenCalledOnce();
    await expect(globalThis.fetch).not.toHaveBeenCalled();
  },
};
export const SinRed: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = fn().mockRejectedValue(new Error('Sin red'));
    return () => { globalThis.fetch = original; };
  },
  play: CorreoValido.play,
};
