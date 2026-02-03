'use client';

import React from 'react';
import GameCard from '@/components/GameCard';
import AuthButton from '@/components/AuthButton';
import { GameProps } from '@/types';

const GAMES: GameProps[] = [
  {
    id: 'schulte',
    title: 'Tabel Schulte',
    description: 'Temukan angka 1-25 secara berurutan secepat mungkin.',
    estimatedTime: '2-3 menit',
    icon: '🔢',
    slug: 'schulte-table',
  },
  {
    id: 'chimp',
    title: 'Tes Simpanse',
    description: 'Ingat urutan angka sebelum mereka menghilang.',
    estimatedTime: '3-5 menit',
    icon: '🐵',
    slug: 'chimp-test',
  },
  {
    id: 'reaction',
    title: 'Tes Reaksi',
    description: 'Klik secepatnya saat layar berubah warna hijau.',
    estimatedTime: '1 menit',
    icon: '⚡',
    slug: 'reaction-time',
  },
  {
    id: 'visual',
    title: 'Memori Visual',
    description: 'Ingat pola kotak yang menyala.',
    estimatedTime: '3-4 menit',
    icon: '🧠',
    slug: 'visual-memory',
  },
  {
    id: 'math',
    title: 'Hitung Cepat',
    description: 'Selesaikan soal matematika sederhana dengan cepat.',
    estimatedTime: '2 menit',
    icon: '➕',
    slug: 'rapid-math',
  },
  {
    id: 'stroop',
    title: 'Tes Stroop',
    description: 'Pilih warna tintanya, bukan baca tulisannya.',
    estimatedTime: '2 menit',
    icon: '🎨',
    slug: 'stroop-test',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-md mx-auto">
      <header className="mb-8 pt-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
              Muscle Brain 💪
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Pemanasan otak sebelum kerja.
            </p>
          </div>
          <AuthButton />
        </div>
        <p className="text-sm text-slate-500">
          Pilih game di bawah ini buat mulai.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 pb-12">
        {GAMES.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      <footer className="text-center pb-8 border-t border-slate-200 dark:border-slate-800 pt-8 mt-4">
        <p className="text-slate-400 text-sm">Muscle Brain © 2026</p>
      </footer>
    </main>
  );
}
