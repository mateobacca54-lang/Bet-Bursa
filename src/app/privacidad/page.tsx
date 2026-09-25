import type { Metadata } from 'next';
import Link from 'next/link';
import { VERSION_POLITICA_ACTUAL } from '@/lib/suscripcion';

// ============================================================
// /privacidad — política de tratamiento de datos personales.
//
// Borrador: cubre lo que pide la Ley 1581 de 2012 y el Decreto 1377 de 2013
// (responsable, qué datos, para qué, derechos del titular, menores de edad),
// pero todavía no la revisó un abogado. No se publica como definitiva.
// ============================================================

export const metadata: Metadata = {
  title: 'Política de datos — Bursa',
  description:
    'Cómo Bursa trata tu correo y tu progreso guardado, y cuáles son tus derechos sobre esos datos.',
};

const CORREO_CONTACTO = '[correo de contacto]';

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 'var(--space-12)' }}>
      <h2
        style={{
          margin: '0 0 var(--space-4) 0',
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-bold)',
          lineHeight: 'var(--line-height-tight)',
          color: 'var(--ink)',
        }}
      >
        {titulo}
      </h2>
      {children}
    </section>
  );
}

const parrafo: React.CSSProperties = {
  margin: '0 0 var(--space-4) 0',
  fontSize: 'var(--font-size-base)',
  lineHeight: 'var(--line-height-normal)',
  color: 'var(--ink-secondary)',
};

export default function Page() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--sand-50, var(--surface))',
        padding: 'var(--space-12) var(--space-4)',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginBottom: 'var(--space-8)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--brand-700)',
          }}
        >
          ← Bursa
        </Link>

        <p
          style={{
            display: 'inline-block',
            margin: '0 0 var(--space-4) 0',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--ink-secondary)',
          }}
        >
          Borrador — pendiente de revisión legal
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            lineHeight: 'var(--line-height-tight)',
            color: 'var(--ink)',
            textWrap: 'balance',
          }}
        >
          Política de tratamiento de datos
        </h1>

        <p style={{ ...parrafo, marginTop: 'var(--space-6)', fontSize: 'var(--font-size-lg)' }}>
          Aquí te contamos, en palabras simples, qué información tuya guarda Bursa, para qué la usamos
          y qué puedes hacer si quieres cambiarla o borrarla. Esto existe porque en Colombia una ley
          (la Ley 1581 de 2012, sobre <em>protección de datos personales</em>: la información con la que se
          te puede identificar, como tu correo) obliga a cualquiera que guarde tus datos a explicarte esto.
        </p>

        <Seccion titulo="Quién es responsable de tus datos">
          <p style={parrafo}>
            Bursa es responsable de los datos que recoge esta aplicación. Si tienes cualquier duda o
            quieres ejercer tus derechos, escríbenos a {CORREO_CONTACTO}.
          </p>
        </Seccion>

        <Seccion titulo="Qué datos guardamos">
          <p style={parrafo}>
            <strong style={{ color: 'var(--ink)' }}>Tu correo</strong>, solo si tú decides dárnoslo (por
            ejemplo, cuando aceptas que te avisemos de una nueva lección), y solo después de que marques
            la casilla de aceptación.
          </p>
          <p style={parrafo}>
            <strong style={{ color: 'var(--ink)' }}>Tu progreso en las lecciones</strong> (qué lecciones ya
            hiciste), guardado únicamente en el navegador de tu propio celular o computador
            (<em>localStorage</em>: un espacio de memoria del navegador). Ese progreso no sale de tu
            dispositivo ni lo vemos nosotros.
          </p>
        </Seccion>

        <Seccion titulo="Para qué usamos tu correo">
          <p style={parrafo}>
            Únicamente para avisarte cuando salga una nueva lección. Nada de promociones ni de
            recordatorios que no pediste.
          </p>
        </Seccion>

        <Seccion titulo="Tus derechos sobre tus datos">
          <p style={parrafo}>
            La misma Ley 1581 de 2012 (artículo 8) te da estos derechos sobre cualquier dato tuyo que
            guardemos:
          </p>
          <ul style={{ ...parrafo, paddingLeft: 'var(--space-6)' }}>
            <li><strong style={{ color: 'var(--ink)' }}>Conocer</strong> qué datos tenemos de ti.</li>
            <li><strong style={{ color: 'var(--ink)' }}>Actualizar</strong> tu correo si cambió.</li>
            <li><strong style={{ color: 'var(--ink)' }}>Rectificar</strong> un dato si está mal escrito o equivocado.</li>
            <li><strong style={{ color: 'var(--ink)' }}>Suprimir</strong> (borrar) tu correo de nuestros registros.</li>
            <li><strong style={{ color: 'var(--ink)' }}>Revocar</strong> (retirar) tu aceptación en cualquier momento, sin que eso te cueste nada.</li>
          </ul>
          <p style={parrafo}>
            Para cualquiera de estos, escríbenos a {CORREO_CONTACTO} y lo resolvemos.
          </p>
        </Seccion>

        <Seccion titulo="Si eres menor de edad">
          <p style={parrafo}>
            Si tienes menos de 18 años, solo podemos guardar tu correo si tu papá, tu mamá o tu
            representante legal lo autoriza (Decreto 1377 de 2013, artículo 12). Sin esa autorización, no
            aceptes la casilla de consentimiento: puedes seguir usando las lecciones de Bursa sin dar tu
            correo.
          </p>
        </Seccion>

        <Seccion titulo="Con quién compartimos tus datos">
          <p style={parrafo}>
            Con nadie. No vendemos ni transferimos tu correo ni tu progreso a ningún tercero.
          </p>
        </Seccion>

        <Seccion titulo="Vigencia">
          <p style={parrafo}>
            Esta política puede actualizarse. La versión vigente hoy es la del{' '}
            <strong style={{ color: 'var(--ink)' }}>{VERSION_POLITICA_ACTUAL}</strong>.
          </p>
        </Seccion>

        <p
          style={{
            marginTop: 'var(--space-12)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--border-warm, var(--border))',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 'var(--line-height-normal)',
            color: 'var(--ink-secondary)',
          }}
        >
          Este texto es un borrador y todavía no lo revisó un abogado. No lo tomes como asesoría legal.
        </p>
      </div>
    </main>
  );
}
