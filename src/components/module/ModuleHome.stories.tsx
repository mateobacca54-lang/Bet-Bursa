import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import ModuleHome from './ModuleHome';
import { emptyProgress } from '@/lib/progress';

const meta = {
  title: 'Module/ModuleHome',
  component: ModuleHome,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { onReviewed: fn(), onMisionHecha: fn() },
} satisfies Meta<typeof ModuleHome>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = new Date(2026, 8, 20, 12, 0);
const progress = { ...emptyProgress('modulo-1'), userName: 'Mateo', completedLessons: [1, 2], streakDays: 2, lastActiveDate: '2026-09-20' };

export const EnCurso: Story = { args: { progress, now, hydrated: true } };
export const PrimeraVez: Story = { args: { progress: emptyProgress('modulo-1'), now, hydrated: true } };
export const VolvioTarde: Story = {
  args: { progress: { ...progress, completedLessons: [1, 2, 3], lastActiveDate: '2026-09-15' }, now, hydrated: true },
};

const diez = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** Las 10 hechas pero la prueba de paso, no: awaiting-test. Sin misión — no ha terminado. */
export const PruebaPendiente: Story = {
  args: { progress: { ...progress, completedLessons: diez, pruebaAprobada: false }, now, hydrated: true },
};

/** Módulo aprobado: aparece la misión, con su botón "Ya lo hice". */
export const ModuloCompleto: Story = {
  args: { progress: { ...progress, completedLessons: diez, pruebaAprobada: true, misionHecha: false }, now, hydrated: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Tu misión de este módulo')).toBeVisible());
    await expect(canvas.getByText(/gastaste esta semana/)).toBeVisible();
  },
};

/** Al pulsar "Ya lo hice", la misión desaparece y se avisa. */
export const MisionReconocida: Story = {
  args: { progress: { ...progress, completedLessons: diez, pruebaAprobada: true, misionHecha: false }, now, hydrated: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const boton = await canvas.findByRole('button', { name: 'Ya lo hice' });
    await userEvent.click(boton);
    await expect(args.onMisionHecha).toHaveBeenCalledOnce();
    await waitFor(() => expect(canvas.queryByText('Tu misión de este módulo')).not.toBeInTheDocument());
  },
};

/** Ya reconocida (una visita posterior): no vuelve a aparecer. */
export const ModuloCompletoSinMision: Story = {
  args: { progress: { ...progress, completedLessons: diez, pruebaAprobada: true, misionHecha: true }, now, hydrated: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Tu misión de este módulo')).not.toBeInTheDocument();
  },
};
