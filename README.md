# Bursa

Escuela de dinero y mercados para jóvenes colombianos. Este repo es la app (Next.js + React + Storybook).

La documentación empieza en [`docs/README.md`](./docs/README.md).

## Empezar

```bash
npm install
npm run dev        # http://localhost:3000
```

Pantallas útiles mientras se construye el Módulo 1:

- `/modulo/1` — el camino de aprendizaje con tu progreso real.
- `/dev/camino?done=2&name=1` — el camino en cualquier estado (`done=0..10`, `late=1`, `name=1`).
- `/dev/widgets` — los widgets interactivos sueltos.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm test` | Pruebas de la lógica pura (vitest, sin navegador) |
| `npm run storybook` | Catálogo de componentes en `:6006` |
| `npm run capture -- --url <url> --name <tarea>` | Capturas en escritorio, reduced-motion y móvil |
| `npm run lint` | ESLint |

## Antes de tocar código

Lee [`AGENTS.md`](./AGENTS.md) (reglas del repo), [`docs/PLAN-MODULO-1.md`](./docs/PLAN-MODULO-1.md) (qué se construye)
y [`docs/ANTIGRAVITY-WORKPLAN.md`](./docs/ANTIGRAVITY-WORKPLAN.md) (cómo se ejecuta y verifica).
