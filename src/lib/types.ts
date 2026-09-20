// ============================================================
// types.ts — Contratos del sistema de widgets de Bursa
// ============================================================

/**
 * Estados posibles de un widget interactivo.
 *
 * - idle:     el widget se muestra, pero el usuario no ha interactuado
 * - active:   el usuario está manipulando el widget
 * - correct:  la respuesta fue validada como correcta
 * - wrong:    la respuesta fue validada como incorrecta
 * - revealed: se mostró la respuesta correcta (después de N intentos)
 */
export type WidgetState = 'idle' | 'active' | 'correct' | 'wrong' | 'revealed';

/**
 * Props comunes que todos los arquetipos de widget exponen.
 * El motor de lecciones no necesita saber qué widget renderiza.
 *
 * @template TConfig  — forma de la configuración específica del arquetipo
 * @template TAnswer  — forma de la respuesta que el usuario envía
 */
export interface BursaWidgetProps<TConfig, TAnswer> {
  /** Datos de la lección: valores, etiquetas, objetivo, tolerancia, etc. */
  config: TConfig;

  /** Callback para notificar transiciones de estado al contenedor */
  onStateChange?: (state: WidgetState) => void;

  /** Callback para telemetría: qué respondió el usuario y si acertó */
  onAttempt?: (answer: TAnswer, isCorrect: boolean) => void;

  /** Deshabilita toda interacción (post-completación, loading, etc.) */
  disabled?: boolean;

  /** Locale para formateo de moneda. Por defecto 'es-CO' */
  locale?: string;
}

// ─── Configuración del ConsequenceSlider (Arquetipo A) ───

export interface DataPoint {
  x: number;
  y: number;
}

export interface ConsequenceSliderConfig {
  /** Etiqueta del slider, ej. "Año" */
  label: string;

  /** Unidad de medida, ej. "COP" */
  unit: string;

  /** Valor mínimo del slider */
  startValue: number;

  /** Valor máximo del slider */
  endValue: number;

  /** Paso del slider */
  step: number;

  /** Precio base (valor en el año inicial) */
  basePrice: number;

  /** Tasa de inflación anual (decimal, ej. 0.065 = 6.5%) */
  inflationRate: number;

  /** Precio objetivo que el usuario debe encontrar */
  targetPrice: number;

  /** Tolerancia: ±N pasos alrededor del objetivo para aceptar */
  tolerance: number;

  /** Serie de datos pre-calculada [{x: año, y: precio}, ...] */
  dataPoints: DataPoint[];

  /** Texto que se muestra al acertar */
  explanationCorrect: string;

  /** Texto que se muestra al fallar */
  explanationWrong: string;

  /** Instrucción principal que ve el usuario */
  instruction: string;

  /** Texto del gancho / contexto inicial */
  hookText: string;
}

// ─── Configuración del DragClassifier (Arquetipo B) ───

export interface DragItem {
  id: string;
  label: string;
  /** Nombre corto para la ficha que queda dentro de la zona (por defecto, `label`) */
  shortLabel?: string;
  /** Descripción corta o contexto adicional */
  description?: string;
  /** Por qué va en su zona. Se muestra al colocarlo (o al revelarlo tras fallar) */
  explanation?: string;
}

export interface DropZone {
  id: string;
  label: string;
  /** IDs de los items que pertenecen a esta zona (respuesta correcta) */
  correctItemIds: string[];
}

export interface DragClassifierConfig {
  instruction: string;
  items: DragItem[];
  zones: DropZone[];
  explanationCorrect: string;
  explanationWrong: string;
}

// ─── Configuración del ProportionBuilder (Arquetipo C) ───

export interface ProportionCategory {
  id: string;
  label: string;
  /** Color del bloque: referencia a un token de la escala */
  colorToken: string;
  /** Porcentaje inicial sugerido */
  initialPercent: number;
  /** Mínimo permitido (ej. ahorro >= 10%) */
  minPercent?: number;
  /** Máximo permitido */
  maxPercent?: number;
}

export interface ProportionBuilderConfig {
  instruction: string;
  categories: ProportionCategory[];
  /** Monto total de referencia (para mostrar valores absolutos) */
  totalAmount: number;
  /** Umbral mínimo de ahorro para feedback positivo */
  savingsMinPercent: number;
  feedbackPositive: string;
  feedbackNegative: string;
}

// ─── Configuración del DocumentHotspot (Arquetipo D) ───

export interface HotspotZone {
  id: string;
  /** Coordenadas relativas 0-1 sobre la imagen */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Etiqueta de la zona (para aria) */
  label: string;
}

export interface DocumentHotspotConfig {
  instruction: string;
  /** Ruta a la imagen del documento */
  imageSrc: string;
  /** Alt text de la imagen */
  imageAlt: string;
  /** Todas las zonas interactivas */
  zones: HotspotZone[];
  /** ID de la zona correcta */
  correctZoneId: string;
  explanationCorrect: string;
  /** Pista al primer fallo */
  hintText: string;
  explanationWrong: string;
}

// ─── Configuración del AnimatedComparator (Arquetipo E) ───

export interface ComparatorSeries {
  id: string;
  label: string;
  /** Color de la línea: referencia a un token */
  colorToken: string;
  /** Datos de la serie [{x, y}, ...] */
  dataPoints: DataPoint[];
}

export interface AnimatedComparatorConfig {
  title: string;
  description: string;
  series: ComparatorSeries[];
  /** Etiqueta del eje X */
  xAxisLabel: string;
  /** Etiqueta del eje Y */
  yAxisLabel: string;
  /** Duración de la animación de dibujo en ms */
  animationDuration?: number;
  /** Unidad para formatear valores (COP, %, etc.) */
  valueUnit: string;
  /** Activa el modo predicción antes de revelar la serie */
  predictionMode?: {
    /** Qué serie se oculta hasta la predicción */
    seriesId: string;
    /** En qué punto del eje X se predice */
    atX: number;
    /** Diferencia (en %) respecto al valor real hasta la que se considera "cerca" */
    tolerancePercent: number;
    feedbackClose: string;
    feedbackFar: string;
  };
}

// ─── Tipos de lección ───

export type WidgetType =
  | 'ConsequenceSlider'
  | 'DragClassifier'
  | 'ProportionBuilder'
  | 'DocumentHotspot'
  | 'AnimatedComparator';

export type WidgetConfig =
  | ConsequenceSliderConfig
  | DragClassifierConfig
  | ProportionBuilderConfig
  | DocumentHotspotConfig
  | AnimatedComparatorConfig;

export interface LessonConfig {
  id: string;
  moduleId: string;
  lessonNumber: number;
  title: string;
  /** Gancho de la lección (primer paso) */
  hook: string;
  /** Concepto principal */
  concept: string;
  /** Ejemplo de la vida real */
  example: string;
  /** Tipo de widget para la aplicación práctica */
  widgetType: WidgetType;
  /** Configuración del widget */
  widgetConfig: WidgetConfig;
  /** Resumen de una línea (último paso) */
  summary: string;
}
