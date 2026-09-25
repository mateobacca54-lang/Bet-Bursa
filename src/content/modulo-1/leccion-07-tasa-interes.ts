// ============================================================
// Lección 07 — ¿Qué es una tasa de interés?
// Widget: DocumentHotspot (Arquetipo "Señalar")
//
// La práctica del docx es literal: "Identifica la tasa de interés en un extracto
// bancario real". Aquí el extracto es DIBUJADO, no una foto de un banco real (sin
// marca, sin dato de una persona real — REGLAS §4). El monto y la tasa son un
// ejemplo de práctica, igual que en las lecciones anteriores.
//
// Las coordenadas de las zonas son las 5 franjas de src/components/illus/Documento.tsx
// (ExtractoBancario): titular, cuenta, saldo, tasa (correcta), fecha de corte.
// ============================================================

import type { DocumentHotspotConfig } from '@/lib/types';

const FILA = { width: 1, height: 0.1375 };

export const leccion07Config: DocumentHotspotConfig = {
  instruction: 'Este es un extracto de cuenta. Toca dónde está la tasa de interés.',
  documento: 'extracto-bancario',
  zones: [
    { id: 'titular', x: 0, y: 0.1875, ...FILA, label: 'Titular: C. Ramírez' },
    { id: 'cuenta', x: 0, y: 0.325, ...FILA, label: 'Cuenta: terminada en 4821' },
    { id: 'saldo', x: 0, y: 0.4625, ...FILA, label: 'Saldo disponible: $1.240.000' },
    { id: 'tasa', x: 0, y: 0.6, ...FILA, label: 'Tasa de interés efectiva anual: 3,2 %' },
    { id: 'fecha', x: 0, y: 0.7375, ...FILA, label: 'Fecha de corte: 5 de cada mes' },
  ],
  correctZoneId: 'tasa',
  explanationCorrect: 'Esa es: "efectiva anual" dice cuánto paga la cuenta en un año, ya con todo incluido.',
  hintText: 'No es el saldo ni la fecha. Busca la fila que tenga un porcentaje.',
  explanationWrong: 'Esa fila no es la tasa. Busca la única fila que trae un símbolo de porcentaje.',
};

export const leccion07 = {
  explanation:
    'Una tasa de interés es el precio del dinero en el tiempo: lo que cuesta pedirlo prestado, o lo que paga dejarlo guardado. El banco te cobra una tasa cuando te presta y te paga otra —casi siempre menor— cuando le prestas tú a él, guardando tu plata ahí.',
  example:
    'En un extracto de cuenta, la tasa casi nunca es el número más grande ni el más destacado: suele ir en letra pequeña, junto a las palabras "efectiva anual". Encontrarla es la mitad del trabajo; la otra mitad es saber que ese número, no el saldo, es el que te dice si te conviene tener la plata ahí.',
  summary: 'La tasa de interés es el precio del dinero en el tiempo, y casi siempre viene en la letra pequeña.',
};
