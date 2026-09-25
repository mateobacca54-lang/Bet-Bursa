const INK = 'var(--ink)';

const line = { stroke: INK, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const thin = { ...line, strokeWidth: 3 };

export function Presupuesto() {
  return (
    <g>
      <rect x={40} y={40} width={240} height={160} rx={12} fill="var(--surface-raised)" {...line} />
      <path d="M160 40v160" fill="none" {...line} />
      <path d="M180 80h80M180 120h80M180 160h80" fill="none" {...thin} />
      <path d="M70 76l12 14 24-28M70 116l12 14 24-28M70 156l12 14 24-28" fill="none" {...line} />
      <g transform="translate(190 130) rotate(-45)">
        <path d="M0 0l-24 8 24 8z" fill="none" {...line} />
        <rect x={0} y={0} width={80} height={16} fill="var(--gold-300)" {...line} />
        <rect x={80} y={0} width={16} height={16} rx={4} fill="var(--brand-200)" {...line} />
      </g>
    </g>
  );
}

export function Banco() {
  return (
    <g>
      <path d="M50 86 L160 30 L270 86 Z" fill="var(--brand-200)" {...line} />
      <rect x={60} y={86} width={200} height={16} fill="var(--sand-200)" {...line} />
      <rect x={72} y={102} width={16} height={70} fill="var(--sand-200)" {...line} />
      <rect x={112} y={102} width={16} height={70} fill="var(--sand-200)" {...line} />
      <rect x={192} y={102} width={16} height={70} fill="var(--sand-200)" {...line} />
      <rect x={232} y={102} width={16} height={70} fill="var(--sand-200)" {...line} />
      <rect x={140} y={126} width={40} height={46} rx={4} fill="var(--brand-200)" {...line} />
      <circle cx={160} cy={114} r={10} fill="var(--gold-300)" {...line} />
      <rect x={50} y={172} width={220} height={16} fill="var(--brand-200)" {...line} />
      <rect x={40} y={188} width={240} height={16} fill="var(--brand-200)" {...line} />
    </g>
  );
}

export function Birrete() {
  return (
    <g>
      <rect x={64} y={128} width={192} height={72} rx={12} fill="var(--sand-200)" {...line} />
      <path d="M80 152h160M80 176h160" fill="none" {...thin} />
      <path d="M125 70 V85 C125 100, 195 100, 195 85 V70" fill="var(--brand-200)" {...line} />
      <path d="M160 36 L230 56 L160 76 L90 56 Z" fill="var(--brand-200)" {...line} />
      <circle cx={160} cy={56} r={4} fill={INK} />
      <path d="M160 56 Q 206 56, 206 76 L 206 90" fill="none" {...line} />
      <circle cx={206} cy={95} r={5} fill="var(--gold-300)" {...line} />
      <path d="M210 128v52l-12-8-12 8v-52" fill="var(--brand-200)" {...line} />
    </g>
  );
}

export function Semilla() {
  return (
    <g>
      <circle cx={160} cy={140} r={40} fill="var(--gold-300)" {...line} />
      <circle cx={160} cy={140} r={26} fill="none" {...thin} />
      <path d="M30 206 Q 160 130 290 206 Z" fill="var(--sand-200)" {...line} />
      <path d="M90 184 Q 160 156 230 184" fill="none" {...thin} strokeDasharray="4 12" />
      <path d="M160 100 Q 146 70, 158 46" fill="none" {...line} />
      <path d="M152 70 Q 110 40, 100 70 Q 110 100, 152 70 Z" fill="var(--brand-200)" {...line} />
      <path d="M158 46 Q 190 20, 210 40 Q 190 70, 158 46 Z" fill="var(--brand-200)" {...line} />
    </g>
  );
}
