import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import DocumentHotspot from './DocumentHotspot';
import { leccion07Config } from '@/content/modulo-1/leccion-07-tasa-interes';
import { leccion09Config } from '@/content/modulo-1/leccion-09-letra-pequena';

const meta = {
  title: 'Widgets/DocumentHotspot',
  component: DocumentHotspot,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Arquetipo "Señalar" — encontrar un dato dentro de un documento dibujado (extracto, simulación de crédito). Las zonas siguen activas tras un fallo, igual que ConsequenceSlider: no hace falta pulsar "Intentar de nuevo" para tocar otra.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 'min(92vw, 480px)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DocumentHotspot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Lección 7: encontrar la tasa de interés en el extracto. */
export const ExtractoBancario: Story = { args: { config: leccion07Config } };

/** Lección 9: encontrar la trampa (letra pequeña) en la simulación de crédito. */
export const SimulacionCredito: Story = { args: { config: leccion09Config } };

export const AciertaALaPrimera: Story = {
  args: { config: leccion07Config },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Tasa de interés/ }));
    await waitFor(() => expect(canvas.getByRole('status')).toBeVisible());
    await expect(canvas.getByRole('status')).toHaveTextContent(leccion07Config.explanationCorrect);
  },
};

export const FallaYReintentaSinBotonAparte: Story = {
  name: 'Falla y reintenta tocando otra zona directamente',
  args: { config: leccion07Config },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // primero, una zona incorrecta
    await userEvent.click(canvas.getByRole('button', { name: /Saldo disponible/ }));
    await waitFor(() => expect(canvas.getByRole('status')).toBeVisible());
    await expect(canvas.getByRole('status')).toHaveTextContent(leccion07Config.explanationWrong);
    // la zona correcta sigue tocable sin pulsar nada más
    await userEvent.click(canvas.getByRole('button', { name: /Tasa de interés/ }));
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent(leccion07Config.explanationCorrect));
  },
};

export const ConTeclado: Story = {
  args: { config: leccion07Config },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const objetivo = canvas.getByRole('button', { name: /Tasa de interés/ });
    objetivo.focus();
    await expect(objetivo).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent(leccion07Config.explanationCorrect));
  },
};

export const Deshabilitado: Story = {
  args: { config: leccion07Config, disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const zona of canvas.getAllByRole('button')) await expect(zona).toBeDisabled();
  },
};
