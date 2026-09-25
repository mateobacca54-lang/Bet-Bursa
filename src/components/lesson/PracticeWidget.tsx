'use client';

import type { PracticeSpec } from '@/content/modulo-1/lecciones';
import type { WidgetState } from '@/lib/types';
import { ConsequenceSlider } from '@/components/widgets/ConsequenceSlider';
import { DragClassifier } from '@/components/widgets/DragClassifier';
import { AnimatedComparator } from '@/components/widgets/AnimatedComparator';
import { Elegir } from '@/components/widgets/Elegir';
import { ProportionBuilder } from '@/components/widgets/ProportionBuilder';
import { DocumentHotspot } from '@/components/widgets/DocumentHotspot';

interface PracticeWidgetProps {
  spec: PracticeSpec;
  onStateChange: (state: WidgetState) => void;
}

/** Monta el widget que corresponde a la lección (paso 4). */
export default function PracticeWidget({ spec, onStateChange }: PracticeWidgetProps) {
  switch (spec.kind) {
    case 'ProportionBuilder':
      return <ProportionBuilder config={spec.config} onStateChange={onStateChange} />;
    case 'DragClassifier':
      return <DragClassifier config={spec.config} onStateChange={onStateChange} />;
    case 'ConsequenceSlider':
      return <ConsequenceSlider config={spec.config} onStateChange={onStateChange} />;
    case 'AnimatedComparator':
      return <AnimatedComparator config={spec.config} onStateChange={onStateChange} />;
    case 'Elegir':
      return <Elegir config={spec.config} onStateChange={onStateChange} />;
    case 'DocumentHotspot':
      return <DocumentHotspot config={spec.config} onStateChange={onStateChange} />;
  }
}
