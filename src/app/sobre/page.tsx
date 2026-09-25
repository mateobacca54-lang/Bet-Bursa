import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

// ============================================================
// /sobre — quién hace Bursa, cómo enseña, qué no hace, y cómo contactarlo.
//
// Existe porque su ausencia descalificaba: "ni un nombre, ni una cara, ni un correo
// en todo el sitio" (teardown del 2026-09-21). Una institución que va a licenciar
// esto necesita saber a quién le está comprando.
//
// El bloque "qué NO hace" no es humildad: es el perímetro regulatorio, y es
// justamente lo que vuelve a Bursa licenciable a un banco (06-PRODUCTO.md §1).
// ============================================================

export const metadata: Metadata = {
  title: 'Sobre Bursa — quién lo hace y cómo enseña',
  description:
    'Bursa es un proyecto universitario colombiano que explica las finanzas con palabras sencillas y ejemplos cercanos.',
};

const CORREO = 'soy.bursa.co@gmail.com';

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
          Aprender sobre tu plata debería ser sencillo y estar al alcance de todos.
        </h1>

        <p style={{ ...parrafo, marginTop: 'var(--space-6)', fontSize: 'var(--font-size-lg)' }}>
          Bursa es un proyecto universitario hecho en Colombia para acercar la educación financiera a más personas.
          Usamos palabras claras y situaciones de la vida diaria para que puedas entender antes de decidir.
        </p>

        <Seccion titulo="Quién lo hace">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
            <Image
              src="/equipo/mateo-bacca.jpg"
              alt="Mateo Bacca Verjel"
              width={88}
              height={88}
              style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
            <div>
              <p style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--ink)' }}>
                Mateo Bacca Verjel
              </p>
              <p style={{ margin: 'var(--space-1) 0 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--ink-secondary)' }}>
                Creador de Bursa · Colombia
              </p>
              <a
                href={`mailto:${CORREO}`}
                style={{
                  display: 'inline-block',
                  marginTop: 'var(--space-2)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--brand-700)',
                }}
              >
                {CORREO}
              </a>
            </div>
          </div>
          <p style={parrafo}>
            Empezamos Bursa porque hablar de dinero suele sonar más complicado de lo que es.
            Queremos que cualquier persona pueda entender una cuota, un precio o una decisión de ahorro sin necesitar conocimientos previos.
          </p>
        </Seccion>

        <Seccion titulo="Cómo enseña">
          <p style={parrafo}>
            Cada lección explica una idea con un ejemplo cercano. Puedes probar qué pasaría,
            ver el resultado y entenderlo a tu ritmo. Si te equivocas, puedes volver a intentarlo.
          </p>
          <p style={parrafo}>
            Hablamos en pesos colombianos y usamos situaciones de acá: el pasaje, el arriendo,
            una compra a cuotas o el ahorro de cada mes.
          </p>
        </Seccion>

        <Seccion titulo="Qué no hace">
          <p style={parrafo}>
            Bursa <strong style={{ color: 'var(--ink)' }}>no recomienda dónde poner tu plata</strong>,
            no nombra bancos ni aplicaciones, y no promete ninguna rentabilidad. Enseña a entender para
            que decidas tú.
          </p>
          <p style={parrafo}>
            Nuestro trabajo es ayudarte a hacer mejores preguntas y entender las respuestas.
          </p>
        </Seccion>

        <Seccion titulo="Para instituciones">
          <p style={parrafo}>
            Si enseñas en un colegio, una universidad o una organización y quieres usar Bursa con tu grupo,
            escríbenos a {CORREO}. La experiencia para aprender es gratis.
          </p>
          <a
            href={`mailto:${CORREO}?subject=Bursa%20para%20instituciones`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 'var(--touch-min)',
              padding: 'var(--space-3) var(--space-8)',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--brand-600)',
              color: 'var(--on-brand)',
              fontWeight: 'var(--font-weight-semibold)',
              textDecoration: 'none',
            }}
          >
            Escríbeme
          </a>
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
          Bursa es contenido educativo. No es asesoría financiera ni una recomendación de inversión:
          aprender cómo funciona el dinero no es lo mismo que decidir qué hacer con el tuyo.
        </p>
      </div>
    </main>
  );
}
