'use client';

import { useId, useState, type CSSProperties, type FormEvent } from 'react';
import Link from 'next/link';
import { VERSION_POLITICA_ACTUAL } from '@/lib/suscripcion';

interface EmailPromptProps {
  /** Se respondió, con o sin correo. El correo no se guarda en el progreso. */
  onAnswer: () => void;
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

/** Pregunta opcional después del nombre; confirma sin esperar a la red. */
export default function EmailPrompt({ onAnswer }: EmailPromptProps) {
  const inputId = useId();
  const errorId = useId();
  const consentId = useId();
  const consentErrorId = useId();
  const [error, setError] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [value, setValue] = useState('');
  const [aceptaConsentimiento, setAceptaConsentimiento] = useState(false);
  const [answered, setAnswered] = useState<string | null>(null);

  const submit = (correo: string) => {
    if (answered !== null) return;
    setAnswered(correo);
    onAnswer();
    if (!correo) return;
    try {
      void fetch('/api/suscribir', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ correo, consentimiento: true, versionPolitica: VERSION_POLITICA_ACTUAL }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // La red nunca bloquea la confirmación ni el resto de la lección.
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const correo = value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError(true);
      return;
    }
    setError(false);
    if (!aceptaConsentimiento) {
      setConsentError(true);
      return;
    }
    setConsentError(false);
    submit(correo);
  };

  if (answered !== null) {
    return (
      <p role="status" style={{ margin: 0, color: 'var(--ink-secondary)', fontSize: 'var(--font-size-base)' }}>
        {answered ? 'Listo. Te escribo cuando esté.' : 'Sin problema.'}
      </p>
    );
  }

  return (
    <form
      noValidate
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
        ¿Te aviso cuando salga la siguiente?
      </label>
      <p style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--font-size-sm)', color: 'var(--ink-secondary)' }}>
        Nada más. Ni promociones ni recordatorios.
      </p>
      <input
        id={inputId}
        type="email"
        placeholder="correo@ejemplo.com"
        aria-invalid={error || undefined}
        aria-describedby={error ? errorId : undefined}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="email"
        autoCapitalize="none"
        enterKeyHint="done"
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
      {error && (
        <p id={errorId} role="alert" style={{ color: 'var(--ink-secondary)', fontSize: 'var(--font-size-sm)' }}>
          No parece un correo. Revísalo e intenta otra vez.
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
        <input
          id={consentId}
          type="checkbox"
          checked={aceptaConsentimiento}
          onChange={(e) => {
            setAceptaConsentimiento(e.target.checked);
            if (e.target.checked) setConsentError(false);
          }}
          aria-describedby={consentError ? consentErrorId : undefined}
          style={{
            width: 'var(--space-4)',
            height: 'var(--space-4)',
            minWidth: 'var(--space-4)',
            marginTop: '2px',
            cursor: 'pointer',
          }}
        />
        <label htmlFor={consentId} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--ink-secondary)' }}>
          Acepto que Bursa guarde mi correo para escribirme sobre mis lecciones, según la{' '}
          <Link href="/privacidad" style={{ color: 'var(--brand-700)', fontWeight: 'var(--font-weight-semibold)' }}>
            política de datos
          </Link>
          .
        </label>
      </div>
      {consentError && (
        <p id={consentErrorId} role="alert" style={{ margin: '0', marginTop: 'var(--space-2)', color: 'var(--ink-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Necesitamos que marques la casilla para poder avisarte.
        </p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
        <button
          type="submit"
          style={{
            ...buttonBase,
            color: 'var(--on-brand)',
            background: 'var(--brand-600)',
            border: 'none',
          }}
        >
          Avísame
        </button>
        <button
          type="button"
          onClick={() => submit('')}
          style={{ ...buttonBase, color: 'var(--ink-secondary)', background: 'transparent', border: '1px solid var(--border)' }}
        >
          No, gracias
        </button>
      </div>
    </form>
  );
}
