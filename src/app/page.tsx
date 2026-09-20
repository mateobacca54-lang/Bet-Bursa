import Link from 'next/link';

export default function Home() {
  return (
    <main
      style={{
        background: 'var(--surface)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: 480,
        }}
      >
        {/* Wordmark */}
        <h1
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--brand-600)',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase' as const,
            margin: '0 0 var(--space-4) 0',
          }}
        >
          BURSA
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-lg)',
            color: 'var(--ink-secondary)',
            lineHeight: 'var(--line-height-normal)',
            margin: '0 0 var(--space-8) 0',
          }}
        >
          Aprende finanzas personales con ejercicios interactivos.
          <br />
          El Duolingo de las finanzas para jóvenes colombianos.
        </p>

        <Link
          href="/modulo/1"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--on-brand)',
            background: 'var(--brand-600)',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            padding: 'var(--space-3) var(--space-8)',
            textDecoration: 'none',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase' as const,
            boxShadow: 'var(--shadow-sm)',
            minHeight: 'var(--touch-min)',
            transition: 'background var(--transition-fast)',
          }}
        >
          Ir al Módulo 1 →
        </Link>

        <p
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--ink-secondary)',
            marginTop: 'var(--space-12)',
          }}
        >
          Módulo 1 · Fundamentos del Dinero · En desarrollo ·{' '}
          <Link href="/dev/widgets" style={{ color: 'inherit' }}>
            Ver widgets
          </Link>
        </p>
      </div>
    </main>
  );
}
