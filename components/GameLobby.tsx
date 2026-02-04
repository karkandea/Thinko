'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Leaderboard from '@/components/Leaderboard';
import { useAuth } from '@/lib/auth-context';
import { getUserBestScore } from '@/lib/db';
import { ArrowLeft, Play, Trophy, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GameLobbyProps {
  gameSlug: string;
  gameTitle: string;
  gameDescription: string;
  gameIcon: React.ReactNode;
  onPlay: () => void;
  scoreFormatter?: (score: number) => string;
  lowerIsBetter?: boolean;
}

export default function GameLobby({
  gameSlug,
  gameTitle,
  gameDescription,
  gameIcon,
  onPlay,
  scoreFormatter = (s) => `${s}`,
  lowerIsBetter = false,
}: GameLobbyProps) {
  const { user } = useAuth();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [loadingBest, setLoadingBest] = useState(false);

  useEffect(() => {
    const fetchBestScore = async () => {
      if (!user) return;
      setLoadingBest(true);
      try {
        const best = await getUserBestScore(user.uid, gameSlug);
        if (best) {
          setBestScore(best.score);
        }
      } catch (error) {
        console.error('Failed to fetch best score:', error);
      } finally {
        setLoadingBest(false);
      }
    };

    fetchBestScore();
  }, [user, gameSlug]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[100px] opacity-30 animate-pulse" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 px-4 py-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-800 group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:-translate-x-1 transition-transform" />
        </Link>
        
        {user && (
           <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Online</span>
           </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-6 py-6 flex flex-col relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex p-6 bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-[2rem] shadow-2xl mb-6 ring-1 ring-white/50 dark:ring-slate-700/50 relative group">
            <div className="text-6xl text-primary drop-shadow-lg scale-110 group-hover:scale-125 transition-transform duration-500">
               {gameIcon}
            </div>
            {/* Icon Halo */}
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-primary to-slate-800 dark:from-white dark:via-primary dark:to-slate-300 mb-2 tracking-tight">
            {gameTitle}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
            {gameDescription}
          </p>
        </motion.div>

        {/* Stats Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-800 shadow-xl mb-6"
        >
          {user ? (
             <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Best Score
                  </p>
                  {loadingBest ? (
                    <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  ) : bestScore !== null ? (
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {scoreFormatter(bestScore)}
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-slate-400 italic">Belum ada skor</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                    Personal Best
                  </span>
                </div>
             </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Login buat simpan skor & liat rank!
              </p>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-3 pb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPlay}
            className="group relative w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 hover:shadow-2xl transition-all overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-indigo-500/20 to-purple-500/20" />
            
            <div className="relative flex items-center justify-center gap-2">
              <Play className="w-5 h-5 fill-current" />
              <span>MAIN SEKARANG</span>
            </div>
            
            {/* Button Shine */}
            <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-shine" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="w-full py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <Trophy className={cn("w-5 h-5", showLeaderboard ? "text-amber-500" : "text-slate-400")} />
            <span>{showLeaderboard ? 'Tutup Leaderboard' : 'Lihat Leaderboard'}</span>
          </motion.button>
        </div>

        {/* Leaderboard Section - Animated Expand */}
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mb-8">
                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                   <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     <Trophy className="w-4 h-4 text-amber-500" />
                     Top Players
                   </h3>
                   <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Updates Live</span>
                 </div>
                 <div className="p-2">
                    <Leaderboard 
                      gameSlug={gameSlug} 
                      gameTitle={gameTitle}
                      scoreFormatter={scoreFormatter}
                      lowerIsBetter={lowerIsBetter}
                    />
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
