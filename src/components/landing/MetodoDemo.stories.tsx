import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import MetodoDemo from './MetodoDemo';

const meta = {
  title: 'Landing/MetodoDemo',
  component: MetodoDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Sección "Monedita te pregunta antes de explicarte": un stepper de tres pasos (Predices → Ves qué pasó → Entiendes por qué) sobre 4 situaciones de la lección 1. Los pasos 2 y 3 quedan deshabilitados hasta responder las 4: no se puede ver la respuesta antes de predecir.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="lp">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MetodoDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
