import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MODULO_1, TEMARIO_MODULO_1 } from '@/content/modulo-1/temario';
import LessonRoute from './LessonRoute';

interface PageProps {
  params: Promise<{ n: string }>;
}

function parseLessonNumber(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= MODULO_1.lessonCount ? n : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const n = parseLessonNumber((await params).n);
  const entry = n ? TEMARIO_MODULO_1.find((l) => l.number === n) : undefined;
  return { title: entry ? `${entry.title} — Bursa` : 'Lección — Bursa' };
}

export default async function Page({ params }: PageProps) {
  const n = parseLessonNumber((await params).n);
  if (n === null) notFound();
  return <LessonRoute number={n} />;
}
