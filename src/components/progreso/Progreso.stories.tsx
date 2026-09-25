import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import Progreso from './Progreso';
import { emptyProgress } from '@/lib/progress';

const meta = {
  title: 'Progreso/Progreso',
  component: Progreso,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { onMisionHecha: fn() },
} satisfies Meta<typeof Progreso>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = new Date(2026, 8, 20, 12, 0);
const progress = { ...emptyProgress('modulo-1'), userName: 'Mateo', streakDays: 2, lastActiveDate: '2026-09-20' };
const diez = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const SinEmpezar: Story = { args: { progress: emptyProgress('modulo-1'), now, hydrated: true } };

/** Con lecciones hechas y sin repasar: aparece "Para repasar". */
export const ConRepaso: Story = {
  args: { progress: { ...progress, completedLessons: [1, 2, 3] }, now, hydrated: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Para repasar')).toBeVisible());
  },
};

/** Las 10 hechas: aparece la misión, con su botón "Ya lo hice". */
export const MisionPendiente: Story = {
  args: { progress: { ...progress, completedLessons: diez, pruebaAprobada: true, misionHecha: false }, now, hydrated: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Tu misión de este módulo')).toBeVisible());
  },
};

/** Al pulsar "Ya lo hice", se avisa al padre. */
export const MisionReconocida: Story = {
  args: { progress: { ...progress, completedLessons: diez, pruebaAprobada: true, misionHecha: false }, now, hydrated: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const boton = await canvas.findByRole('button', { name: 'Ya lo hice' });
    await userEvent.click(boton);
    await expect(args.onMisionHecha).toHaveBeenCalledOnce();
  },
};

/** Ya reconocida: no vuelve a aparecer. */
export const ModuloCompletoSinMision: Story = {
  args: { progress: { ...progress, completedLessons: diez, pruebaAprobada: true, misionHecha: true }, now, hydrated: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Tu misión de este módulo')).not.toBeInTheDocument();
  },
};

export const Cargando: Story = { args: { progress: emptyProgress('modulo-1'), now, hydrated: false } };
