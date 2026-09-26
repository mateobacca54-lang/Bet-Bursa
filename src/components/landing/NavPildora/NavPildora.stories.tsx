import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import NavPildora from './NavPildora';
import '../landing.css';

const meta: Meta<typeof NavPildora> = {
  title: 'Landing/NavPildora',
  component: NavPildora,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Navegación flotante de la landing v3: píldora translúcida con la marca, las anclas de cada capítulo (la raya naranja marca el activo) y el botón principal.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="lp" style={{ minHeight: '40vh' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    anclas: [
      { id: 'capitulo-encoge', etiqueta: 'Inflación' },
      { id: 'capitulo-crece', etiqueta: 'Interés' },
      { id: 'lee-la-letra', etiqueta: 'Crédito' },
      { id: 'como-aprendes-app', etiqueta: 'La app' },
      { id: 'camino', etiqueta: 'La ruta' },
    ],
    cta: { label: 'Empieza gratis', href: '/inicio' },
  },
};
export default meta;

export const PorDefecto: StoryObj<typeof NavPildora> = {};
