'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ReactionTimeProps {
  onComplete: (averageTimeMs: number, bestTimeMs: number) => void;
  onScoreUpdate?: (reactionMs: number) => void;
}

type Mode = 'waiting' | 'ready' | 'now' | 'clicked' | 'tooEarly';

// Level configuration - rounds get harder
const getLevelConfig = (round: number) => ({
  minDelay: Math.max(1500 - (round * 100), 800), // Min wait time decreases
  maxDelay: Math.max(4000 - (round * 200), 2000), // Max wait time decreases
});

export default function ReactionTime({ onComplete, onScoreUpdate }: ReactionTimeProps) {
  const [mode, setMode] = useState<Mode>('waiting');
  const [message, setMessage] = useState('Tap di mana aja buat mulai');
  const [startTime, setStartTime] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [currentReaction, setCurrentReaction] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number>(Infinity);
  const [tooEarlyCount, setTooEarlyCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const ROUNDS = 5;
  const currentRound = reactionTimes.length + 1;

  const startRound = () => {
    setMode('ready');
    setMessage('Tunggu warna hijau...');
    setCurrentReaction(null);
    
    const config = getLevelConfig(currentRound);
    const randomDelay = Math.floor(Math.random() * (config.maxDelay - config.minDelay)) + config.minDelay;
    
    timeoutRef.current = setTimeout(() => {
      setMode('now');
      setMessage('KLIK SEKARANG!');
      setStartTime(Date.now());
      
      // Vibrate to signal GO
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
    }, randomDelay);
  };

  const handleClick = () => {
    if (mode === 'waiting') {
      startRound();
      return;
    }

    if (mode === 'ready') {
      // Too early
      clearTimeout(timeoutRef.current!);
      setMode('tooEarly');
      setMessage('Kecepetan woy! 😅');
      setTooEarlyCount(c => c + 1);
      
      // Vibrate error
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
      
      setTimeout(() => {
        setMode('waiting');
        setMessage('Tap buat coba lagi');
      }, 1500);
      return;
    }

    if (mode === 'now') {
      const endTime = Date.now();
      const reaction = endTime - startTime;
      setCurrentReaction(reaction);
      
      const newTimes = [...reactionTimes, reaction];
      setReactionTimes(newTimes);
      
      if (reaction < bestTime) {
        setBestTime(reaction);
        // Report new best score for real-time tracking
        if (onScoreUpdate) {
          onScoreUpdate(reaction);
        }
      }
      
      if (newTimes.length >= ROUNDS) {
        // Finished all rounds
        const avg = newTimes.reduce((a, b) => a + b, 0) / newTimes.length;
        const best = Math.min(...newTimes);
        setMode('clicked');
        setMessage('Complete! 🎉');
        
        setTimeout(() => {
          onComplete(avg, best);
        }, 1500);
      } else {
        setMode('clicked');
        setMessage(`${reaction}ms!`);
      }
    }

    if (mode === 'clicked' && reactionTimes.length < ROUNDS) {
      startRound();
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getReactionRating = (ms: number) => {
    if (ms < 200) return { text: 'INSANE! 🚀', color: 'text-purple-500' };
    if (ms < 250) return { text: 'Amazing! 🔥', color: 'text-green-500' };
    if (ms < 300) return { text: 'Great!', color: 'text-blue-500' };
    if (ms < 400) return { text: 'Good', color: 'text-yellow-500' };
    return { text: 'Keep trying', color: 'text-slate-500' };
  };

  const avg = reactionTimes.length > 0 
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) 
    : 0;

  return (
    <div 
      className={`
        absolute inset-0 flex flex-col items-center justify-center text-center p-6 cursor-pointer touch-manipulation select-none transition-colors duration-200
        ${mode === 'waiting' || mode === 'clicked' ? 'bg-slate-100 dark:bg-slate-800' : ''}
        ${mode === 'tooEarly' ? 'bg-orange-500' : ''}
        ${mode === 'ready' ? 'bg-red-500' : ''}
        ${mode === 'now' ? 'bg-green-500' : ''}
      `}
      onPointerDown={handleClick}
    >
      {/* Round Progress */}
      {reactionTimes.length > 0 && mode !== 'now' && mode !== 'ready' && (
        <div className="absolute top-6 left-0 right-0 px-6">
          <div className="flex justify-center gap-2 mb-2">
            {Array(ROUNDS).fill(0).map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full transition-all ${
                  i < reactionTimes.length 
                    ? 'bg-primary scale-100' 
                    : 'bg-slate-300 dark:bg-slate-600 scale-75'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Round {Math.min(currentRound, ROUNDS)}/{ROUNDS}
          </p>
        </div>
      )}

      {/* Status Icons */}
      {mode === 'ready' && (
        <div className="text-7xl mb-4 animate-pulse">🔴</div>
      )}
      {mode === 'now' && (
        <div className="text-7xl mb-4 animate-bounce">🟢</div>
      )}
      {mode === 'tooEarly' && (
        <div className="text-7xl mb-4 animate-shake">⚠️</div>
      )}
      {mode === 'clicked' && currentReaction && (
        <div className="text-7xl mb-4">⚡</div>
      )}

      {/* Main Message */}
      <h2 className={`text-3xl sm:text-4xl font-bold mb-2 ${
        mode === 'now' || mode === 'ready' || mode === 'tooEarly' 
          ? 'text-white' 
          : 'text-slate-800 dark:text-white'
      }`}>
        {message}
      </h2>
      
      {/* Reaction Rating */}
      {mode === 'clicked' && currentReaction && (
        <p className={`text-lg font-bold ${getReactionRating(currentReaction).color} mb-4`}>
          {getReactionRating(currentReaction).text}
        </p>
      )}

      {/* Stats */}
      {reactionTimes.length > 0 && mode !== 'now' && mode !== 'ready' && mode !== 'tooEarly' && (
        <div className="mt-6 space-y-2">
          <div className="flex gap-6 justify-center text-sm">
            <div className="text-slate-500 dark:text-slate-400">
              Avg: <span className="font-bold text-slate-700 dark:text-slate-200">{avg}ms</span>
            </div>
            {bestTime < Infinity && (
              <div className="text-slate-500 dark:text-slate-400">
                Best: <span className="font-bold text-green-500">{bestTime}ms</span>
              </div>
            )}
          </div>
          
          {tooEarlyCount > 0 && (
            <p className="text-xs text-orange-500">
              False starts: {tooEarlyCount}
            </p>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-10 text-sm px-6">
        {mode === 'waiting' && reactionTimes.length === 0 && (
          <p className="text-slate-400">
            Tes refleks lo. Tap secepetnya pas layar jadi hijau!
          </p>
        )}
        {mode === 'clicked' && reactionTimes.length < ROUNDS && (
          <p className="text-slate-400 animate-pulse">
            Tap untuk lanjut ke round {reactionTimes.length + 1}
          </p>
        )}
      </div>
    </div>
  );
}
