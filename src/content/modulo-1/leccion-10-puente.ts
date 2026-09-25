// ============================================================
// Lección 10 — Ahora que entiendes la plata, ¿la haces trabajar para ti?
// Widget: Elegir (Arquetipo F) — el único que NO corrige: refleja.
//
// La práctica del docx es literal: "El usuario elige qué quiere aprender primero
// en el siguiente módulo". No hay respuesta correcta, así que no se corrige: cada
// elección devuelve qué es eso que eligió y dónde lo va a encontrar.
//
// Las tres opciones apuntan a temas reales del Módulo 2 (TEMARIO.md §4), no a
// promesas: no se dice que vaya a ganar nada.
// ============================================================

import type { ElegirConfig } from '@/lib/types';

export const leccion10Config: ElegirConfig = {
  instruction: 'Ya sabes cómo funciona la plata. ¿Qué te gustaría entender primero?',
  options: [
    {
      id: 'sin-arriesgar',
      label: 'Cómo hacerla crecer sin arriesgar mucho',
      reflexion:
        'Eso es prestar: le das tu plata a alguien —un banco, por ejemplo— y te devuelve una cifra que ya sabes desde el principio. El Módulo 2 empieza justo por ahí.',
    },
    {
      id: 'ser-dueno',
      label: 'Qué significa comprar una parte de una empresa',
      reflexion:
        'Eso es ser dueño: te va bien si a la empresa le va bien, y nadie te promete nada. Es la otra mitad del Módulo 2.',
    },
    {
      id: 'por-donde',
      label: 'Por dónde se empieza cuando no tienes mucho',
      reflexion:
        'Es la pregunta que casi nadie responde. El Módulo 2 llega ahí, pero después de explicarte las opciones: primero entender, después decidir.',
    },
  ],
};

export const leccion10 = {
  explanation:
    'Ya sabes qué es el dinero, qué se lo come y qué lo multiplica. Con eso puedes leer casi cualquier oferta que te hagan. Lo que sigue es qué hacer con la plata que no necesitas ya, y resulta que solo hay dos caminos: prestarla, o comprar con ella un pedazo de algo.',
  example:
    'Alguien te ofrece dos cosas por los mismos $500.000. La primera te devuelve, dentro de un año, una cifra que ya conoces desde hoy. La segunda te hace socio de una tienda: si vende bien ganas más, si vende mal pierdes. Ninguna es la correcta — son cosas distintas, y ahora vas a poder decir cuál es cuál.',
  summary:
    'Solo hay dos formas de hacer crecer la plata: prestarla, o ser dueño de algo. El Módulo 2 empieza por ahí.',
};
