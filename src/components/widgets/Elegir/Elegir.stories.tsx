import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import Elegir from './Elegir';
import type { ElegirConfig } from '@/lib/types';

const PUENTE_M1L10: ElegirConfig = {
  instruction: 'Ya sabes cómo funciona el dinero. ¿Qué harías con esa ventaja?',
  options: [
    {
      id: 'guardar',
      label: 'Seguir guardando, como hasta ahora',
      reflexion: 'Guardar es lo que ya sabes hacer bien. El Módulo 2 te muestra qué más se puede hacer con esa plata.',
    },
    {
      id: 'aprender',
      label: 'Entender cómo hacerla crecer',
      reflexion: 'Es justo de eso que trata el Módulo 2: qué se puede hacer con la plata, y a cambio de qué.',
    },
    {
      id: 'no-se',
      label: 'Todavía no sé',
      reflexion: 'No hace falta saberlo ya. El Módulo 2 explica las opciones antes de pedirte que elijas.',
    },
  ],
};

const meta = {
  title: 'Widgets/Elegir',
  component: Elegir,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Arquetipo F — el único que no corrige: refleja. No hay respuesta incorrecta. Se usa en cierres de módulo y en la apuesta de Monedita; nunca en una prueba de paso.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 'min(92vw, 640px)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Elegir>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CierreDeModulo: Story = { args: { config: PUENTE_M1L10 } };

export const SeEligeConTeclado: Story = {
  args: { config: PUENTE_M1L10 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const opciones = canvas.getAllByRole('radio');
    opciones[0].focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await expect(opciones[2]).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByRole('status')).toHaveTextContent('No hace falta saberlo ya');
  },
};

export const UnaVezElegidaNoCambia: Story = {
  args: { config: PUENTE_M1L10 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: /Seguir guardando/ }));
    const otras = canvas.getAllByRole('radio', { checked: false });
    for (const o of otras) await expect(o).toBeDisabled();
  },
};
