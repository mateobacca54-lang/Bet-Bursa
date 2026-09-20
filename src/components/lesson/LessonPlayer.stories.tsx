import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import LessonPlayer from './LessonPlayer';
import { TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';
import { getLessonContent } from '@/content/modulo-1/lecciones';

const entry = (n: number) => TEMARIO_MODULO_1.find((l) => l.number === n)!;
const content = (n: number) => getLessonContent(n)!;

const meta = {
  title: 'Lección/LessonPlayer',
  component: LessonPlayer,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { exitHref: '/modulo/1', onFinish: () => {} },
} satisfies Meta<typeof LessonPlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Lección 1 — clasificar trueque vs. dinero. Al final pregunta el nombre (solo la primera vez). */
export const Leccion1: Story = { args: { entry: entry(1), content: content(1), askName: true, onName: () => {} } };

/** Lección 2 — slider de inflación. */
export const Leccion2: Story = { args: { entry: entry(2), content: content(2) } };

/** Lección 3 — predecir el interés compuesto antes de verlo. */
export const Leccion3: Story = { args: { entry: entry(3), content: content(3) } };
