import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Greeting from './Greeting';
import { TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';
import type { GreetingData } from '@/lib/greeting';

const meta = {
  title: 'Shell/Greeting',
  component: Greeting,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Los cuatro estados del saludo (PLAN §5.5). Sin nombre es OTRA frase, no una frase con un hueco. El progreso se nombra como logro ("llevas 2 de 10"), nunca como deuda.' } },
  },
  decorators: [(Story) => (<div style={{ padding: 'var(--space-16) var(--space-6)' }}><Story /></div>)],
  tags: ['autodocs'],
} satisfies Meta<typeof Greeting>;

export default meta;
type Story = StoryObj<typeof meta>;

const base: GreetingData = { state: 'in-progress', userName: 'Mateo', completedCount: 2, totalLessons: 10, nextLesson: 3, reviewLesson: null };
const common = { lessons: TEMARIO_MODULO_1, ctaHref: '#leccion' };

export const PrimeraVez: Story = {
  args: { ...common, data: { ...base, state: 'first-time', userName: null, completedCount: 0, nextLesson: 1 } },
};
export const EnCurso: Story = { args: { ...common, data: base } };
export const EnCursoSinNombre: Story = { args: { ...common, data: { ...base, userName: null } } };
export const VolvioTarde: Story = {
  args: { ...common, data: { ...base, state: 'returning-late', completedCount: 3, nextLesson: 4, reviewLesson: 1 } },
};
export const Completo: Story = {
  args: { ...common, data: { ...base, state: 'complete', completedCount: 10, nextLesson: null } },
};
