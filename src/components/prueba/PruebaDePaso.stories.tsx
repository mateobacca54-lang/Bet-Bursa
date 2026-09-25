import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import PruebaDePaso from './PruebaDePaso';
import { PRUEBA_MODULO_1 } from '@/content/modulo-1/prueba';
import { MODULO_1 } from '@/content/modulo-1/temario';

const meta = {
  title: 'Prueba/PruebaDePaso',
  component: PruebaDePaso,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'La prueba de paso (METODOLOGIA §5): situaciones reales en desorden, nunca definiciones. No revela si acertaste hasta el final. Se aprueba con como mucho una mal.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    situaciones: PRUEBA_MODULO_1,
    moduleNumber: 1,
    moduleTitle: MODULO_1.title,
    exitHref: '/modulo/1',
    onAprobada: () => {},
  },
} satisfies Meta<typeof PruebaDePaso>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Intro: Story = {};

export const SituacionUno: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Empezar' }));
    // el panel entra animado (opacity 0→1): se espera a que termine, no al primer frame
    await waitFor(() => expect(canvas.getByRole('radiogroup')).toBeVisible(), { timeout: 2000 });
  },
};

export const SeCorrigeSoloAlFinal: Story = {
  name: 'No revela nada hasta terminar las 6',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Empezar' }));

    for (let i = 0; i < 6; i++) {
      await waitFor(() => expect(canvas.getByRole('radiogroup')).toBeVisible(), { timeout: 2000 });
      const grupo = canvas.getByRole('radiogroup');
      const etiquetaActual = grupo.getAttribute('aria-label');
      await userEvent.click(within(grupo).getAllByRole('radio')[0]);
      // nada de "correcto"/"incorrecto" aparece entre preguntas
      await expect(canvas.queryByText(/correcto|incorrecto|acertaste|fallaste/i)).not.toBeInTheDocument();

      if (i < 5) {
        // espera a que la SIGUIENTE situación monte (no basta con que pasen 420ms:
        // se espera el cambio real, así no importa cuánto tarde la transición)
        await waitFor(
          () => expect(canvas.getByRole('radiogroup').getAttribute('aria-label')).not.toBe(etiquetaActual),
          { timeout: 2000 }
        );
      }
    }

    // al terminar la sexta, aparece un resultado (aprobó o no) con su propio titular
    await waitFor(() => expect(canvas.getByRole('heading', { level: 1 })).toBeVisible(), { timeout: 2000 });
    const titular = canvas.getByRole('heading', { level: 1 }).textContent ?? '';
    expect(/Aprobaste|Todavía no/.test(titular)).toBe(true);
  },
};
