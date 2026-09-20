'use client';

import { useId, useState, type CSSProperties, type FormEvent } from 'react';

interface NamePromptProps {
  /** Nombre escrito, o '' si la persona prefiere no dar uno */
  onAnswer: (name: string) => void;
}

const buttonBase: CSSProperties = {
  fontFamily: 'var(--font-family)',
  fontSize: 'var(--font-size-base)',
  fontWeight: 'var(--font-weight-semibold)',
  minHeight: 'var(--touch-min)',
  borderRadius: 'var(--radius-pill)',
  padding: 'var(--space-3) var(--space-6)',
  cursor: 'pointer',
};

/**
 * NamePrompt — se pide el nombre DESPUÉS de la primera lección, no antes: primero
 * la persona recibe valor. Es opcional y se pregunta una sola vez (PLAN §5.5).
 */
export default function NamePrompt({ onAnswer }: NamePromptProps) {
  const inputId = useId();
  const [value, setValue] = useState('');
  const [answered, setAnswered] = useState<string | null>(null);

  const submit = (name: string) => {
    setAnswered(name);
    onAnswer(name);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const name = value.trim();
    if (name) submit(name);
  };

  if (answered !== null) {
    return (
      <p role="status" style={{ margin: 0, color: 'var(--ink-secondary)', fontSize: 'var(--font-size-base)' }}>
        {answered ? `Listo, ${answered}. Así te saludaremos.` : 'Sin problema. Puedes seguir sin nombre.'}
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--surface-raised)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
      }}
    >
      <label
        htmlFor={inputId}
        style={{ display: 'block', fontWeight: 'var(--font-weight-semibold)', color: 'var(--ink)', marginBottom: 'var(--space-1)' }}
      >
        ¿Cómo te llamas?
      </label>
      <p style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--font-size-sm)', color: 'var(--ink-secondary)' }}>
        Es opcional. Solo sirve para saludarte por tu nombre.
      </p>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="given-name"
        autoCapitalize="words"
        enterKeyHint="done"
        maxLength={40}
        style={{
          width: '100%',
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--font-size-base)' /* ≥16 px: iOS no hace zoom al enfocar */,
          minHeight: 'var(--touch-min)',
          padding: 'var(--space-2) var(--space-3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--surface)',
          color: 'var(--ink)',
          boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
        <button
          type="submit"
          disabled={!value.trim()}
          style={{
            ...buttonBase,
            color: 'var(--on-brand)',
            background: 'var(--brand-600)',
            border: 'none',
            opacity: value.trim() ? 1 : 0.5,
            cursor: value.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={() => submit('')}
          style={{ ...buttonBase, color: 'var(--ink-secondary)', background: 'transparent', border: '1px solid var(--border)' }}
        >
          Prefiero sin nombre
        </button>
      </div>
    </form>
  );
}
