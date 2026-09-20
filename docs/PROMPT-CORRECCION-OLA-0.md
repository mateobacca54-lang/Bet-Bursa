# Prompt — Corrección de la Ola 0 (tarea R0)

Para pegar en Antigravity (Gemini 3.1 Pro). Un solo agente: los 4 archivos son disjuntos
entre sí pero pequeños, y las tres correcciones se validan juntas.

**Antes de lanzar:** no hagas `git add` hasta revisar. Tu árbol tiene todo en staging, así que
`git diff --stat` (sin `--cached`) mostrará **solo** lo que toque este agente. Si vuelves a
hacer `git add`, esa comprobación deja de servir.

Los archivos `docs/correccion-ola-0/*.txt` son el contenido de destino, ya compilado, con
lint limpio y probado. Tienen extensión `.txt` a propósito: así `tsc` y `eslint` no los
tratan como código del proyecto. Se pueden borrar cuando termine la tarea.

````
Tarea R0 del plan de olas de Bursa — corrección de la Ola 0.

Lee primero: AGENTS.md y docs/ANTIGRAVITY-WORKPLAN.md (§3 y §4, Ola 0).

═══ CONTEXTO ═══
La Ola 0 pasó `npm test` (24 tests en verde), pero una revisión independiente encontró
defectos que esos tests NO detectan. Tu trabajo es corregirlos y NADA MÁS.

═══ ARCHIVOS QUE PUEDES EDITAR (solo estos cuatro) ═══
  src/lib/progress.ts
  src/lib/progress.test.ts
  src/lib/motion.ts
  src/lib/motion.test.ts

NO toques ningún otro archivo. En particular:
  - src/components/**  → tiene 1 error y 2 avisos de lint ANTERIORES a esta tarea. No son tuyos.
  - path-geometry.*, greeting.*, tokens.css, vitest.config.ts, package.json, docs/**
NO ejecutes git add ni git commit.

═══ PASO 0 — LÍNEA BASE (antes de tocar nada) ═══
Ejecuta y guarda la salida de:
  npm test
  npx tsc --noEmit -p .
  npx eslint src/lib
Debes ver: 24 tests en verde; EXACTAMENTE 1 error de tsc (en src/lib/motion.test.ts);
7 errores de eslint, todos `no-explicit-any`, en motion.ts, motion.test.ts y progress.ts.
Si ves algo distinto, PÁRATE y dilo antes de continuar.

═══ DEFECTO 1 — BUG en src/lib/progress.ts ═══
`loadProgress` y `saveProgress` leen `globalThis.localStorage` FUERA del try/catch. Con los
datos del sitio bloqueados, ACCEDER a `localStorage` lanza SecurityError, y las dos funciones
lanzan. Contradice la especificación ("NUNCA lanzan") y la regla de AGENTS.md.

Hazlo en este orden (primero la prueba, para comprobar que detecta el bug):

1. Añade al FINAL del `describe` de src/lib/progress.test.ts (imports ya existentes):

   function withThrowingAccessor(fn: () => void) {
     const desc = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
     Object.defineProperty(globalThis, 'localStorage', {
       configurable: true,
       get() { throw new DOMException('denied', 'SecurityError'); },
     });
     try {
       fn();
     } finally {
       if (desc) Object.defineProperty(globalThis, 'localStorage', desc);
       else Reflect.deleteProperty(globalThis, 'localStorage');
     }
   }

   it('loadProgress no lanza si ACCEDER a localStorage lanza', () => {
     withThrowingAccessor(() => {
       expect(() => loadProgress('m1')).not.toThrow();
       expect(loadProgress('m1')).toEqual(emptyProgress('m1'));
     });
   });

   it('saveProgress no lanza si ACCEDER a localStorage lanza y devuelve false', () => {
     withThrowingAccessor(() => {
       expect(() => saveProgress(emptyProgress('m1'))).not.toThrow();
       expect(saveProgress(emptyProgress('m1'))).toBe(false);
     });
   });

2. Ejecuta `npm test`. DEBEN FALLAR exactamente esas 2 pruebas. Si pasan, tu prueba no
   detecta el bug: corrígela antes de seguir.

3. Corrige src/lib/progress.ts:

   a) Justo encima de `loadProgress` añade:

      type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

      function resolveStorage(storage?: StorageLike): StorageLike | null {
        if (storage) return storage;
        try {
          return typeof globalThis !== 'undefined' && globalThis.localStorage ? globalThis.localStorage : null;
        } catch {
          // Con los datos del sitio bloqueados, ACCEDER a localStorage lanza SecurityError.
          return null;
        }
      }

   b) En `loadProgress` y `saveProgress`: el parámetro pasa a `storage?: StorageLike` y la
      primera línea del cuerpo pasa a `const s = resolveStorage(storage);`
      (elimina la línea vieja `const s = storage ?? (...)`). El resto de la lógica no cambia.

   c) En `loadProgress`, quita los dos `any`:
        const parsed: Record<string, unknown> | null = JSON.parse(raw);
        ...filter((x): x is number => typeof x === 'number')     ← en completedLessons y en
                                                                   reviewedConcepts

4. Ejecuta `npm test`: las 2 pruebas nuevas pasan y los tests anteriores siguen en verde.

═══ DEFECTO 2 — src/lib/motion.ts no es compatible con los tipos de framer-motion ═══
Hoy `SPRING_*` tienen `type: string` (deben ser 'spring'), `EASE_*` son `number[]` (deben ser
tuplas de 4) y `variants` no es asignable a `Variants`. Cualquier tarea posterior que escriba
`transition={SPRING_DRAG}` tendría un error de TypeScript.

Ya existe el contenido de destino, compilado, con lint limpio y probado. NO lo reescribas a
mano: CÓPIALO.

   docs/correccion-ola-0/motion.ts.txt       →  sustituye por completo src/lib/motion.ts
   docs/correccion-ola-0/motion.test.ts.txt  →  sustituye por completo src/lib/motion.test.ts

Después de copiar NO modifiques el contenido. Lo que cambia respecto a lo actual:
  - Tipado: `Bezier` como tupla; `as const satisfies Transition` en los SPRING_*;
    `satisfies Variants` en `variants`. NINGÚN valor numérico cambia.
  - Se ELIMINA la variante `staggerChildren` y se AÑADEN `MAX_STAGGERED` (8) y
    `staggerDelay(index)`. El escalonado pasa a ser por hijo: `transition={{ delay: staggerDelay(i) }}`.
  - `motionSafe` sin `any`. Con reduced=false sigue devolviendo LA MISMA REFERENCIA.
  - motion.test.ts: se conservan los 4 tests anteriores (con las líneas 75-76 tipadas sin
    `any`) y se AÑADEN 2: una guarda de tipos (la comprueba `tsc`) y una de `staggerDelay`.

═══ DEFECTO 3 — lint ═══
Queda resuelto por 1 y 2: ya no debe quedar ningún `any` en los cuatro archivos.

═══ PROHIBIDO ═══
  - `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `as any`, ni cambiar reglas de eslint
    o tsconfig para que "pase".
  - Borrar o debilitar tests existentes. Solo se permite lo descrito arriba.
  - Cambiar valores numéricos de motion.ts.
  - Renombrar o eliminar exports, salvo `staggerChildren` (se elimina) y los dos que se añaden.
  - Si un comando falla, NO lo arregles con supresiones: PÁRATE y reporta la salida.

═══ ACEPTACIÓN (ejecuta los cuatro y pega la salida completa) ═══
  1. npm test                       → 4 archivos, 28 tests, todos en verde (24 anteriores + 4 nuevos)
  2. npx tsc --noEmit -p .          → CERO errores (sin salida)
  3. npx eslint src/lib             → CERO problemas (sin salida)
  4. git diff --stat                → SOLO los 4 archivos de arriba

Entrega: las cuatro salidas, y cualquier decisión que hayas tomado tú donde estas
instrucciones no fueran exactas. Si algo no coincide con lo que se esperaba, dilo.
````
