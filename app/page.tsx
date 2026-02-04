'use client';

import React from 'react';
import GameCard from '@/components/GameCard';
import AuthButton from '@/components/AuthButton';
import { GameProps } from '@/types';
import { 
  Grid3x3, 
  Brain, 
  Zap, 
  Eye, 
  Calculator, 
  Palette,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const GAMES: GameProps[] = [
  {
    id: 'schulte',
    title: 'Tabel Schulte',
    description: 'Temukan angka 1-25 secara berurutan secepat mungkin.',
    estimatedTime: '2-3 menit',
    icon: <Grid3x3 className="w-6 h-6" />,
    slug: 'schulte-table',
  },
  {
    id: 'chimp',
    title: 'Tes Simpanse',
    description: 'Ingat urutan angka sebelum mereka menghilang.',
    estimatedTime: '3-5 menit',
    icon: <Brain className="w-6 h-6" />,
    slug: 'chimp-test',
  },
  {
    id: 'reaction',
    title: 'Tes Reaksi',
    description: 'Klik secepatnya saat layar berubah warna hijau.',
    estimatedTime: '1 menit',
    icon: <Zap className="w-6 h-6" />,
    slug: 'reaction-time',
  },
  {
    id: 'visual',
    title: 'Memori Visual',
    description: 'Ingat pola kotak yang menyala.',
    estimatedTime: '3-4 menit',
    icon: <Eye className="w-6 h-6" />,
    slug: 'visual-memory',
  },
  {
    id: 'math',
    title: 'Hitung Cepat',
    description: 'Selesaikan soal matematika sederhana dengan cepat.',
    estimatedTime: '2 menit',
    icon: <Calculator className="w-6 h-6" />,
    slug: 'rapid-math',
  },
  {
    id: 'stroop',
    title: 'Tes Stroop',
    description: 'Pilih warna tintanya, bukan baca tulisannya.',
    estimatedTime: '2 menit',
    icon: <Palette className="w-6 h-6" />,
    slug: 'stroop-test',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-lg mx-auto overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -right-[20%] w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-50 animate-float" />
        <div className="absolute top-[40%] -left-[20%] w-[500px] h-[500px] bg-secondary/20 blur-[100px] rounded-full opacity-40 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <header className="mb-8 pt-6">
        <div className="flex items-start justify-between mb-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg text-white shadow-lg shadow-primary/25">
                <Brain className="w-6 h-6" />
              </span>
              <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">
                Muscle Brain
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Upgrade otak lo sekarang!
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AuthButton />
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative group p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 overflow-hidden"
        >
          <div className="relative z-10 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Daily Challenge</span>
            <p className="font-bold text-lg">Siap push rank otak hari ini?</p>
          </div>
          
          {/* Shine Effect */}
          <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-shine" />
        </motion.div>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 pb-12"
      >
        {GAMES.map((game, index) => (
          <GameCard key={game.id} game={game} index={index} />
        ))}
      </motion.div>

      <footer className="text-center pb-8 pt-8 mt-4 border-t border-slate-200/50 dark:border-slate-800/50">
        <p className="text-slate-400 text-xs font-medium">
          Dibuat dengan ☕ & 🧠 di Jakarta <br/>
          Muscle Brain © 2026
        </p>
      </footer>
    </main>
  );
}
