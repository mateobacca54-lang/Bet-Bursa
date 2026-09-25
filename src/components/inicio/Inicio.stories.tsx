import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Inicio from './Inicio';
import { emptyProgress, type ModuleProgress } from '@/lib/progress';

const NOW = new Date(2026, 8, 21, 10, 0, 0);

const meta = {
  title: 'Inicio/Inicio',
  component: Inicio,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'La pantalla entre la landing y el camino. Primera visita: Monedita se presenta y propone una apuesta. Si ya empezaste: el mismo saludo que /modulo/1 y el mapa de módulos. No pide ningún dato.',
      },
    },
  },
  args: { now: NOW, hydrated: true, progress: emptyProgress('modulo-1') },
} satisfies Meta<typeof Inicio>;

export default meta;
type Story = StoryObj<typeof meta>;

const con = (over: Partial<ModuleProgress>): ModuleProgress => ({ ...emptyProgress('modulo-1'), ...over });

export const PrimeraVisita: Story = {};

export const EnCurso: Story = {
  args: { progress: con({ completedLessons: [1, 2], lastActiveDate: '2026-09-21', streakDays: 2, userName: 'Mateo', namePrompted: true }) },
};

export const EnCursoSinNombre: Story = {
  args: { progress: con({ completedLessons: [1], lastActiveDate: '2026-09-20', streakDays: 1, userName: '', namePrompted: true }) },
};

export const VolvioTarde: Story = {
  args: { progress: con({ completedLessons: [1, 2, 3], lastActiveDate: '2026-09-14', streakDays: 3, userName: 'Mateo', namePrompted: true }) },
};

export const ModuloCompleto: Story = {
  args: {
    progress: con({
      completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      lastActiveDate: '2026-09-21',
      streakDays: 10,
      userName: 'Mateo',
      namePrompted: true,
    }),
  },
};

/** Antes de leer localStorage: el globo va vacío para no mostrar el estado equivocado un instante. */
export const Hidratando: Story = { args: { hydrated: false } };
