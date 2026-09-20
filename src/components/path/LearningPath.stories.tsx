import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import LearningPath from './LearningPath';
import { TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';

const meta = {
  title: 'Path/LearningPath',
  component: LearningPath,
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'El camino como gráfica de mercado (PLAN §2). Pasa el cursor por un nodo para ver el gancho; pulsa uno bloqueado para ver el shake.' } },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LearningPath>;

export default meta;
type Story = StoryObj<typeof meta>;

const common = {
  lessons: TEMARIO_MODULO_1,
  hrefFor: (n: number) => `#leccion-${n}`,
  ticker: 'M1 · Fundamentos del dinero',
};

export const PrimeraVez: Story = { args: { ...common, completedLessons: [], nextLesson: 1 } };
export const EnCurso: Story = { args: { ...common, completedLessons: [1, 2], nextLesson: 3 } };
export const Mitad: Story = { args: { ...common, completedLessons: [1, 2, 3, 4, 5], nextLesson: 6 } };
export const Completo: Story = { args: { ...common, completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nextLesson: null } };

/** En pantallas de menos de 640 px el camino pasa a vertical y serpentea. */
export const Movil: Story = {
  args: { ...common, completedLessons: [1, 2], nextLesson: 3 },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  decorators: [(Story) => (<div style={{ width: 358 }}><Story /></div>)],
};
