#!/usr/bin/env node
// ============================================================
// secuencia-celulares.mjs — convierte public/landing/celulares.mp4 en una
// secuencia de imágenes para el canvas de "Así se aprende en Bursa." en celular.
//
// Por qué: en iPhone, cada evento de scroll hacía un seek en el H.264 (un cuadro clave
// cada 0,5 s → hasta 11 cuadros a decodificar por seek, y iOS los encola). Resultado:
// tirones. Una secuencia de WebP no tiene ese costo: cada cuadro es una imagen
// independiente que el componente dibuja en un <canvas> con createImageBitmap.
//
// Qué hace:
//   1. Recorta el cuadrado central que usa el celular en el video 1920×1080
//      (crop=1080:1080:420:0 — el celular ya está centrado ahí).
//   2. Escala a 720×720 con Lanczos (suficiente para el ancho real en pantalla,
//      con margen para pantallas de alta densidad).
//   3. Baja de 24 a 12 fps (el ojo no distingue más en un scrub lento).
//   4. Codifica cada cuadro como WebP (libwebp) en public/landing/celulares-movil/.
//
// Uso:
//   node scripts/secuencia-celulares.mjs [--calidad 72]
//
// Necesita ffmpeg con libwebp (ya instalado en este entorno). Objetivo de peso:
// ≤ 5 MB en total. El script avisa si se pasa; si eso ocurre, vuelve a correr con
// --calidad 65 (probado: 185 cuadros a calidad 72 pesan ~5,2 MB; a 65, ~4,8 MB).
// ============================================================

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ORIGEN = path.join(root, 'public/landing/celulares.mp4');
const DESTINO = path.join(root, 'public/landing/celulares-movil');
const FPS = 12;
const LADO_RECORTE = 1080; // cuadrado central del video 1920×1080
const OFFSET_X = 420; // (1920 - 1080) / 2
const LADO_SALIDA = 720;
const LIMITE_BYTES = 5 * 1024 * 1024;

function parseArgs(argv) {
  const out = { calidad: 72 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--calidad') out.calidad = Number(argv[++i]);
  }
  return out;
}

async function generar(calidad) {
  await rm(DESTINO, { recursive: true, force: true });
  await mkdir(DESTINO, { recursive: true });

  const filtro = `crop=${LADO_RECORTE}:${LADO_RECORTE}:${OFFSET_X}:0,scale=${LADO_SALIDA}:${LADO_SALIDA}:flags=lanczos,fps=${FPS}`;
  await run('ffmpeg', [
    '-y',
    '-i', ORIGEN,
    '-vf', filtro,
    '-c:v', 'libwebp',
    '-q:v', String(calidad),
    '-compression_level', '6',
    '-an',
    path.join(DESTINO, '%04d.webp'),
  ]);

  const archivos = (await readdir(DESTINO)).filter((f) => f.endsWith('.webp')).sort();
  let bytes = 0;
  for (const f of archivos) bytes += (await stat(path.join(DESTINO, f))).size;
  return { total: archivos.length, bytes };
}

async function main() {
  const { calidad } = parseArgs(process.argv.slice(2));
  let resultado = await generar(calidad);
  let calidadUsada = calidad;

  if (resultado.bytes > LIMITE_BYTES && calidad > 65) {
    console.log(
      `calidad ${calidad}: ${resultado.total} cuadros, ${(resultado.bytes / 1024 / 1024).toFixed(2)} MB — se pasa de 5 MB, reintentando a calidad 65…`
    );
    resultado = await generar(65);
    calidadUsada = 65;
  }

  const mb = (resultado.bytes / 1024 / 1024).toFixed(2);
  console.log(`secuencia-celulares: ${resultado.total} cuadros, ${mb} MB total, calidad ${calidadUsada}, en ${DESTINO}`);
  if (resultado.bytes > LIMITE_BYTES) {
    console.warn('Sigue por encima de 5 MB incluso a calidad 65: revisar a mano.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
