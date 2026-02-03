'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface CompletionScreenProps {
  scoreDisplay: string;
  gameSlug: string;
  onPlayAgain: () => void;
  extraStats?: { label: string; value: string }[];
  rating?: 'amazing' | 'good' | 'average' | 'tryAgain';
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
  rating = 'good'
}: CompletionScreenProps) {
  const [copy, setCopy] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Randomize content on mount
    const copies = UX_COPY[rating];
    setCopy(copies[Math.floor(Math.random() * copies.length)]);
    
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);
  }, [rating]);

  return (
    <div className={`
      flex flex-col items-center justify-center p-6 text-center
      transition-all duration-500 ease-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
    `}>
      {/* Big Emoji */}
      <div className={`
        text-7xl mb-6 transition-all duration-700 delay-100
        ${isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
      `}>
        {EMOJI_BY_RATING[rating]}
      </div>

      {/* Score Display */}
      <div className={`
        transition-all duration-500 delay-200
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}>
        <h2 className="text-5xl font-extrabold text-primary mb-2 tracking-tight">
          {scoreDisplay}
        </h2>
        
        {/* Extra Stats */}
        {extraStats.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mt-3 mb-4">
            {extraStats.map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm"
              >
                <span className="text-slate-500">{stat.label}: </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Motivational Text */}
      <p className={`
        text-lg font-medium text-slate-700 dark:text-slate-300 mb-8 max-w-[280px]
        transition-all duration-500 delay-300
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}>
        &ldquo;{copy}&rdquo;
      </p>

      {/* Action Buttons */}
      <div className={`
        flex flex-col gap-3 w-full max-w-xs
        transition-all duration-500 delay-400
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}>
        <button
          onClick={onPlayAgain}
          className="w-full py-4 px-6 bg-primary hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 text-lg flex items-center justify-center gap-2 border-b-4 border-teal-800/30"
        >
          <span>🔄</span>
          <span>Main Lagi</span>
        </button>
        
        <Link 
          href="/"
          className="w-full py-4 px-6 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 text-center flex items-center justify-center gap-2"
        >
          <span>🏠</span>
          <span>Pilih Game Lain</span>
        </Link>
      </div>

      {/* Share hint (optional future feature) */}
      <p className="text-xs text-slate-400 mt-6">
        💡 Tip: Main setiap hari biar otak makin tajam!
      </p>
    </div>
  );
}
