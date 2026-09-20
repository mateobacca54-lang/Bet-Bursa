// ============================================================
// temario.ts — Módulo 1: Fundamentos del Dinero
//
// FUENTE: Metodologia Bursa/Bursa_Temario_Modulo1_1.docx
// Los campos `title`, `hook`, `keyConcept` y `practice` están copiados
// literalmente del docx. NO se reescriben ni se "mejoran".
//
// Único campo que NO viene del docx: `topic`. Es una frase corta en
// minúscula para el saludo ("La que sigue es sobre {topic}") y para
// orientar sin nombrar un número de lección. Sí se puede editar.
// ============================================================

export interface TemarioEntry {
  /** Número de lección, 1–10 */
  number: number;
  /** Título de la lección (docx, columna "Lección") */
  title: string;
  /** Gancho: pregunta o dato que rompe una creencia (docx, "Gancho") */
  hook: string;
  /** Idea central; también es lo que repasa SpacedReview (docx, "Concepto clave") */
  keyConcept: string;
  /** Aplicación práctica (docx, "Aplicación práctica") */
  practice: string;
  /** NO viene del docx. Para el saludo: "La que sigue es sobre {topic}" */
  topic: string;
}

export const MODULO_1 = {
  id: 'modulo-1',
  title: 'Fundamentos del Dinero',
  lessonCount: 10,
} as const;

export const TEMARIO_MODULO_1: readonly TemarioEntry[] = [
  {
    number: 1,
    title: '¿Qué es el dinero y por qué existe?',
    hook: '¿Por qué un billete de $50.000 vale algo si no se puede comer ni vestir?',
    keyConcept: 'El dinero es un acuerdo social de confianza, no un objeto con valor propio',
    // ⏳ DECISIÓN PENDIENTE (PLAN-MODULO-1.md §6): el texto libre no se puede
    // evaluar sin un LLM. Se propuso reemplazarlo por clasificar intercambios.
    // No implementar la lección 1 hasta que se resuelva.
    practice: 'Explica con tus palabras por qué el trueque dejó de funcionar',
    topic: 'qué es el dinero',
  },
  {
    number: 2,
    title: '¿Por qué tu plata vale menos cada año?',
    hook: 'Ese almuerzo de $8.000 de hace 10 años hoy cuesta el triple. ¿A dónde se fue tu plata?',
    keyConcept: 'Inflación: el mismo dinero compra menos con el tiempo',
    practice: 'Calcula cuánto necesitarías hoy para comprar lo que costaba $10.000 hace 5 años',
    topic: 'la inflación',
  },
  {
    number: 3,
    title: 'Interés simple vs. interés compuesto',
    hook: '$100.000 hoy o $100.000 en 10 años, ¿es lo mismo?',
    keyConcept: 'El tiempo multiplica —o te cobra— mucho más de lo que parece',
    practice: 'Compara cuánto crece $100.000 a interés simple vs. compuesto en 5 años',
    topic: 'el interés compuesto',
  },
  {
    number: 4,
    title: 'Ahorrar ≠ invertir',
    hook: '¿Por qué guardar plata en una alcancía no te está ayudando?',
    keyConcept: 'Ahorrar protege, invertir hace crecer — son herramientas distintas',
    practice: 'Clasifica 5 situaciones cotidianas: ¿toca ahorrar o invertir?',
    topic: 'la diferencia entre ahorrar e invertir',
  },
  {
    number: 5,
    title: 'Deuda buena vs. deuda mala',
    hook: 'No toda deuda es mala — pero la mayoría no distingue cuál sí lo es',
    keyConcept: 'Una deuda es buena si genera valor futuro mayor a su costo',
    practice: 'Evalúa 3 ejemplos (tarjeta de crédito, crédito educativo, celular a cuotas)',
    topic: 'cuándo una deuda te sirve y cuándo no',
  },
  {
    number: 6,
    title: 'Presupuesto personal sin Excel',
    hook: '¿A dónde se fue tu plata este mes? La mayoría no sabe responder',
    keyConcept: 'Un presupuesto simple de 3 categorías: fijo, variable, ahorro',
    practice: 'Arma tu presupuesto del mes con tus propios ingresos y gastos reales',
    topic: 'cómo armar tu presupuesto',
  },
  {
    number: 7,
    title: '¿Qué es una tasa de interés?',
    hook: 'El banco te cobra una tasa por prestarte plata y te paga otra por guardarla — ¿por qué son distintas?',
    keyConcept: 'La tasa de interés es el precio del dinero en el tiempo',
    practice: 'Identifica la tasa de interés en un extracto bancario real',
    topic: 'las tasas de interés',
  },
  {
    number: 8,
    title: 'El sistema financiero colombiano en 5 minutos',
    hook: 'CDT, cuenta de ahorros, UVR — palabras que nadie te explica antes de firmar',
    keyConcept: 'Mapa básico de los productos financieros más comunes en Colombia',
    practice: 'Empareja cada producto con la situación en la que lo usarías',
    topic: 'los productos financieros de Colombia',
  },
  {
    number: 9,
    title: 'Créditos estudiantiles: la letra pequeña',
    hook: 'Firmar un crédito educativo sin entenderlo te puede costar años de sueldo',
    keyConcept: 'Qué mirar antes de firmar: tasa, plazo, período de gracia, capitalización',
    practice: 'Revisa una simulación de crédito y detecta la trampa escondida',
    topic: 'qué mirar antes de firmar un crédito',
  },
  {
    number: 10,
    title: 'Ahora que entiendes la plata, ¿la haces trabajar para ti?',
    hook: 'Ya sabes cómo funciona el dinero — ¿qué vas a hacer con esa ventaja?',
    keyConcept: 'Puente hacia el Módulo 2: inversión (renta fija y variable)',
    practice: 'El usuario elige qué quiere aprender primero en el siguiente módulo',
    topic: 'el paso al Módulo 2',
  },
];
