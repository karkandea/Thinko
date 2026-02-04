'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, Home, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompletionScreenProps {
  scoreDisplay: string;
  gameSlug: string;
  onPlayAgain: () => void;
  extraStats?: { label: string; value: string }[];
  rating?: 'amazing' | 'good' | 'average' | 'tryAgain';
  isNewRecord?: boolean;
}

const UX_COPY: Record<string, string[]> = {
  amazing: [
    "GILA SIH LO! 🤯",
    "Otak lo udah ON nih kayaknya 🔥",
    "Brain cells: MAXIMUM POWER! ⚡",
    "Lo punya hidden talent ini boss 💎",
  ],
  good: [
    "Lumayan lah buat pemanasan 🔥",
    "Gaskeun kerja, bos! 💪",
    "Fokus mode: ACTIVATED ✅",
    "Not bad, not bad at all 😎",
  ],
  average: [
    "Udah bagus, terus latihan ya! 👍",
    "Practice makes perfect! 📈",
    "Tinggal polish dikit lagi 💪",
    "Keep grinding boss 🎯",
  ],
  tryAgain: [
    "Yuk coba lagi! 💪",
    "Next time pasti lebih baik 🙌",
    "Main lagi biar makin jago! 🎮",
    "Don't give up! 🔥",
  ],
};

const EMOJI_BY_RATING: Record<string, string> = {
  amazing: '🏆',
  good: '🎉',
  average: '👍',
  tryAgain: '💪',
};

export default function CompletionScreen({ 
  scoreDisplay, 
  gameSlug, 
  onPlayAgain,
  extraStats = [],
  rating = 'good',
  isNewRecord = false
}: CompletionScreenProps) {
  const [copy, setCopy] = useState('');
  
  useEffect(() => {
    // Randomize content on mount
    const copies = UX_COPY[rating];
    setCopy(copies[Math.floor(Math.random() * copies.length)]);
    
    // Trigger confetti for good results
    if (rating === 'amazing' || rating === 'good' || isNewRecord) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults, particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults, particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [rating, isNewRecord]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full max-w-md mx-auto relative z-10">
      
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="mb-6 relative"
      >
        <div className="text-8xl filter drop-shadow-2xl animate-float">
          {EMOJI_BY_RATING[rating]}
        </div>
        {/* Glow effect behind emoji */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/30 blur-[50px] -z-10 rounded-full" />
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full text-center"
      >
        <div className="glass-card rounded-2xl p-8 mb-8 border-t-4 border-t-primary/50 shadow-2xl relative overflow-hidden">
           {/* Background Shine */}
           <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] animate-shine pointer-events-none" />

          {isNewRecord && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg mb-4 animate-pulse"
            >
              <Trophy className="w-4 h-4" />
              NEW PERSONAL BEST!
            </motion.div>
          )}

          <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-primary to-slate-800 dark:from-white dark:via-primary dark:to-slate-300 tracking-tighter mb-2">
            {scoreDisplay}
          </h2>

          {extraStats.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-4 mb-2">
              {extraStats.map((stat, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-700/50"
                >
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{stat.label}: </span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{stat.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Motivational Text / Meme */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="mb-8"
        >
          <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200 italic leading-relaxed">
            &ldquo;{copy}&rdquo;
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3 w-full"
        >
          <button
            onClick={onPlayAgain}
            className="group w-full py-4 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] text-lg flex items-center justify-center gap-2 relative overflow-hidden"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span>Main Lagi</span>
            
            {/* Button Highlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </button>
          
          <Link 
            href="/"
            className="w-full py-4 px-6 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98] text-center flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span>Pilih Game Lain</span>
          </Link>
        </motion.div>

        <p className="text-xs text-slate-400 mt-8 flex items-center justify-center gap-1.5 opacity-60">
          <Sparkles className="w-3 h-3" />
          Tip: Main setiap hari biar otak makin tajam!
        </p>
      </motion.div>
    </div>
  );
}
