// ============================================================
// Lección 01 — ¿Qué es el dinero y por qué existe?
// Widget: DragClassifier (Arquetipo B)
//
// ⚠ Se aparta del docx en la aplicación práctica: el temario pide "Explica con
// tus palabras por qué el trueque dejó de funcionar" (texto libre, que no se puede
// corregir sin un LLM). Aquí se clasifican 6 intercambios cotidianos: enseña la
// "doble coincidencia de deseos" por experiencia y se corrige al instante.
// Decisión #1 de docs/PLAN-MODULO-1.md §10; reversible.
// ============================================================

import type { DragClassifierConfig } from '@/lib/types';

const TRUEQUE = 'trueque';
const DINERO = 'dinero';

export const leccion01Config: DragClassifierConfig = {
  instruction:
    'Clasifica cada situación: ¿se puede resolver con trueque (cambiar una cosa por otra) o necesita dinero? Arrastra cada una a su zona, o tócala y luego toca la zona.',
  items: [
    {
      id: 'bici-celular',
      shortLabel: 'Bici por celular',
      label: 'Cambiar tu bicicleta por el celular de un amigo que justo quiere una bici',
      explanation: 'Los dos quieren lo que tiene el otro. Ese cruce de deseos casi nunca pasa, pero aquí sí.',
    },
    {
      id: 'bus',
      shortLabel: 'Bus',
      label: 'Pagar el bus para ir al colegio',
      explanation: 'El conductor no necesita tu bicicleta ni tus cromos. Necesita algo que le sirva con cualquiera.',
    },
    {
      id: 'cromos',
      shortLabel: 'Cromos',
      label: 'Cambiar tus cromos repetidos por los repetidos de una compañera',
      explanation: 'Cada una tiene lo que la otra busca: hay coincidencia, así que el trueque alcanza.',
    },
    {
      id: 'profe',
      shortLabel: 'Profe de inglés',
      label: 'Pagarle a tu profesor particular de inglés',
      explanation: 'Tendrías que tener justo lo que él necesita ese día. Con dinero no hace falta adivinar.',
    },
    {
      id: 'almuerzo',
      shortLabel: 'Empanada por arepa',
      label: 'Cambiar tu empanada por la arepa de tu compañero, que hoy quería empanada',
      explanation: 'Los dos quieren lo del otro en el mismo momento: por eso el trueque funciona.',
    },
    {
      id: 'arriendo',
      shortLabel: 'Arriendo',
      label: 'Pagar el arriendo',
      explanation: 'El dueño no quiere tres bicicletas: quiere poder pagar sus propias cuentas. El dinero sirve para todo.',
    },
  ],
  zones: [
    { id: TRUEQUE, label: 'Se puede resolver con trueque', correctItemIds: ['bici-celular', 'cromos', 'almuerzo'] },
    { id: DINERO, label: 'Necesita dinero', correctItemIds: ['bus', 'profe', 'arriendo'] },
  ],
  explanationCorrect:
    'El trueque solo funciona cuando lo que quieres lo tiene alguien que, a la vez, quiere lo tuyo. Como eso casi nunca coincide, todos aceptamos algo a cambio de cualquier cosa: el dinero.',
  explanationWrong: 'Fíjate si los dos quieren lo que tiene el otro. Si no, hace falta algo que todos acepten.',
};

export const leccion01 = {
  explanation:
    'Antes del dinero se cambiaba una cosa por otra: eso se llama trueque. Funciona solo si lo que tú quieres lo tiene alguien que, al mismo tiempo, quiere lo tuyo. Como eso casi nunca coincide, la gente acordó usar algo que todos aceptan a cambio de cualquier cosa. Ese acuerdo se llama dinero.',
  example:
    'Imagina que quieres almorzar y solo tienes tu bicicleta. El dueño del restaurante no necesita una bici hoy. Con un billete de $50.000 no hay problema: él sabe que cualquier tienda lo va a recibir, y por eso el billete vale, aunque no se pueda comer.',
  summary:
    'El dinero existe porque el trueque casi nunca coincide. Vale porque todos confiamos en que los demás lo van a aceptar.',
};
