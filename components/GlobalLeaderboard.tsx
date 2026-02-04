'use client';

import React, { useState, useEffect } from 'react';
import { getGameLeaderboard, GameScore } from '@/lib/db';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { X, Trophy, Medal, Grid3x3, Brain, Zap, Eye, Calculator, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  photoURL: string;
  score: number;
  gameSlug: string;
}

interface GlobalLeaderboardProps {
  onClose: () => void;
}

const GAMES = [
  { slug: 'schulte-table', name: 'Tabel Schulte', icon: Grid3x3, lowerIsBetter: true, formatter: (s: number) => `${(s/1000).toFixed(2)}s` },
  { slug: 'chimp-test', name: 'Tes Simpanse', icon: Brain, lowerIsBetter: false, formatter: (s: number) => `Level ${s}` },
  { slug: 'reaction-time', name: 'Tes Reaksi', icon: Zap, lowerIsBetter: true, formatter: (s: number) => `${s}ms` },
  { slug: 'visual-memory', name: 'Memori Visual', icon: Eye, lowerIsBetter: false, formatter: (s: number) => `${s} poin` },
  { slug: 'rapid-math', name: 'Hitung Cepat', icon: Calculator, lowerIsBetter: false, formatter: (s: number) => `${s} benar` },
  { slug: 'stroop-test', name: 'Tes Stroop', icon: Palette, lowerIsBetter: false, formatter: (s: number) => `${s} poin` },
];

export default function GlobalLeaderboard({ onClose }: GlobalLeaderboardProps) {
  const [selectedGame, setSelectedGame] = useState(GAMES[0].slug);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const currentGame = GAMES.find(g => g.slug === selectedGame) || GAMES[0];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const scores = await getGameLeaderboard(selectedGame, 20, currentGame.lowerIsBetter);
        
        const entriesWithProfiles = await Promise.all(
          scores.map(async (score, index) => {
            try {
              const userDoc = await getDoc(doc(db, 'users', score.userId));
              const userData = userDoc.exists() ? userDoc.data() : null;
              
              return {
                rank: index + 1,
                displayName: userData?.displayName || 'Anonymous',
                photoURL: userData?.photoURL || '',
                score: score.score,
                gameSlug: score.gameSlug,
              };
            } catch {
              return {
                rank: index + 1,
                displayName: 'Anonymous',
                photoURL: '',
                score: score.score,
                gameSlug: score.gameSlug,
              };
            }
          })
        );
        
        setEntries(entriesWithProfiles);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedGame, currentGame.lowerIsBetter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       <motion.div 
         initial={{ opacity: 0 }} 
         animate={{ opacity: 1 }} 
         exit={{ opacity: 0 }}
         className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
         onClick={onClose}
       />
       
       <motion.div 
         initial={{ scale: 0.9, opacity: 0, y: 20 }}
         animate={{ scale: 1, opacity: 1, y: 0 }}
         exit={{ scale: 0.9, opacity: 0, y: 20 }}
         className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/10 flex flex-col max-h-[85vh]"
       >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                <Trophy className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Leaderboard Global</h2>
                <p className="text-white/80 text-sm">Top players hall of fame</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game Tabs */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {GAMES.map((game) => {
              const Icon = game.icon;
              const isSelected = selectedGame === game.slug;
              return (
                <button
                  key={game.slug}
                  onClick={() => setSelectedGame(game.slug)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                    isSelected 
                      ? "bg-primary text-white shadow-lg shadow-primary/25" 
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isSelected ? "text-white" : "text-slate-500")} />
                  {game.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-950/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 text-sm font-medium">Loading scores...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-4xl grayscale opacity-50">
                🏆
              </div>
              <p className="text-slate-900 dark:text-white font-bold text-lg">Belum ada skor</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Jadilah yang pertama mencetak rekor!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={`${entry.rank}-${entry.displayName}`}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl transition-all border",
                    entry.rank === 1 
                      ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border-amber-200 dark:border-amber-500/30" 
                      : entry.rank === 2
                      ? "bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/30 dark:to-gray-800/30 border-slate-200 dark:border-slate-700"
                      : entry.rank === 3
                      ? "bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-900/10 dark:to-rose-900/10 border-orange-200 dark:border-orange-500/30"
                      : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-primary/50"
                  )}
                >
                  {/* Rank */}
                  <div className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm",
                    entry.rank === 1 ? "bg-yellow-400 text-yellow-900" :
                    entry.rank === 2 ? "bg-slate-300 text-slate-800" :
                    entry.rank === 3 ? "bg-orange-400 text-orange-900" :
                    "bg-slate-100 dark:bg-slate-700 text-slate-500"
                  )}>
                    {entry.rank <= 3 ? <Medal className="w-4 h-4" /> : entry.rank}
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                     {entry.photoURL ? (
                      <Image
                        src={entry.photoURL}
                        alt={entry.displayName}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold border-2 border-white dark:border-slate-700 shadow-sm">
                        {entry.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {entry.rank === 1 && (
                      <div className="absolute -top-2 -right-2 text-xl filter drop-shadow-md">👑</div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {entry.displayName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Rank #{entry.rank}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="font-black text-lg text-primary">
                      {currentGame.formatter(entry.score)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
