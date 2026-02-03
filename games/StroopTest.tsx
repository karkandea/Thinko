'use client';

import React, { useState, useEffect, useRef } from 'react';

interface StroopTestProps {
  onComplete: (score: number, accuracy: number) => void;
  isPaused?: boolean;
}

const COLORS = [
  { name: 'MERAH', value: 'red', hex: '#ef4444' },
  { name: 'BIRU', value: 'blue', hex: '#3b82f6' },
  { name: 'HIJAU', value: 'green', hex: '#22c55e' },
  { name: 'KUNING', value: 'yellow', hex: '#eab308' },
  { name: 'UNGU', value: 'purple', hex: '#a855f7' },
];

// Level configuration - difficulty increases
const getLevelConfig = (correctCount: number) => {
  const level = Math.floor(correctCount / 5) + 1;
  
  return {
    level,
    // Add more colors at higher levels
    colorCount: Math.min(4 + Math.floor(level / 2), COLORS.length),
    // Time decreases per level
    totalTime: Math.max(45 - (level * 3), 20),
    // Score multiplier increases
    multiplier: level,
  };
};

export default function StroopTest({ onComplete, isPaused = false }: StroopTestProps) {
  const [currentWord, setCurrentWord] = useState(COLORS[0]);
  const [inkColor, setInkColor] = useState(COLORS[1]);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isCongruent, setIsCongruent] = useState(false); // Track if word matches ink
  const startTimeRef = useRef<number>(0);

  const config = getLevelConfig(correct);
  const availableColors = COLORS.slice(0, config.colorCount);

  // Generate new round
  const nextRound = () => {
    const cfg = getLevelConfig(correct);
    const colors = COLORS.slice(0, cfg.colorCount);
    
    const randomWord = colors[Math.floor(Math.random() * colors.length)];
    
    // 30% chance of congruent (same word and ink) which is easier but rare
    const makeCongruent = Math.random() < 0.3;
    
    let randomInk;
    if (makeCongruent) {
      randomInk = randomWord;
      setIsCongruent(true);
    } else {
      // Ensure different ink color
      do {
        randomInk = colors[Math.floor(Math.random() * colors.length)];
      } while (randomInk.value === randomWord.value);
      setIsCongruent(false);
    }
    
    setCurrentWord(randomWord);
    setInkColor(randomInk);
    setFeedback(null);
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      const total = correct + wrong;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      onComplete(score, accuracy);
    }
  }, [isPlaying, timeLeft, onComplete, score, correct, wrong]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setIsPlaying(true);
    setTimeLeft(30);
    nextRound();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChoice = (colorValue: string) => {
    if (!isPlaying || feedback) return;

    const responseTime = Date.now() - startTimeRef.current;
    const isCorrect = colorValue === inkColor.value;

    if (isCorrect) {
      setFeedback('correct');
      setCorrect(c => c + 1);
      
      // Calculate score with bonuses
      let pointsEarned = 10 * config.multiplier;
      
      // Speed bonus
      if (responseTime < 1000) pointsEarned += 5;
      if (responseTime < 500) pointsEarned += 5;
      
      // Congruent gives less points (it's easier)
      if (isCongruent) pointsEarned = Math.floor(pointsEarned * 0.7);
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      
      // Streak bonus
      if (newStreak >= 5) pointsEarned += 10;
      
      setScore(s => s + pointsEarned);
      
      // Haptic
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20);
      }
    } else {
      setFeedback('wrong');
      setWrong(w => w + 1);
      setStreak(0);
      
      // Penalty
      setScore(s => Math.max(0, s - 5));
      
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([30, 30, 30]);
      }
    }

    setTimeout(() => {
      startTimeRef.current = Date.now();
      nextRound();
    }, 300);
  };

  const accuracy = (correct + wrong) > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;

  return (
    <div className="flex flex-col h-full items-center justify-between pb-8 pt-4">
      {/* HUD */}
      <div className="w-full px-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
              Lv.<span className="text-primary text-xl">{config.level}</span>
            </div>
            <div className="text-lg font-bold text-primary">
              {score} pts
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
            {timeLeft}s
          </div>
        </div>
        
        {/* Stats bar */}
        <div className="flex justify-between items-center text-sm">
          <div className="text-slate-500">
            ✓ <span className="text-green-500 font-bold">{correct}</span>
            {wrong > 0 && (
              <> · ✗ <span className="text-red-500 font-bold">{wrong}</span></>
            )}
          </div>
          <div className="text-slate-500">
            Accuracy: <span className="font-bold">{accuracy}%</span>
          </div>
        </div>

        {streak >= 3 && (
          <div className="text-center mt-2 text-sm font-bold text-orange-500 animate-pulse">
            🔥 {streak} Streak! +bonus
          </div>
        )}
      </div>

      {/* Main Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <p className="text-xs text-slate-400 mb-4 uppercase tracking-widest font-semibold">
          Pilih warna <span className="underline">tintanya</span>, bukan tulisannya!
        </p>
        
        <div 
          className={`
            text-5xl sm:text-6xl font-black tracking-wider transition-all duration-100
            ${feedback === 'correct' ? 'scale-110' : ''}
            ${feedback === 'wrong' ? 'animate-shake' : ''}
          `}
          style={{ color: inkColor.hex }}
        >
          {currentWord.name}
        </div>

        {feedback === 'correct' && (
          <div className="text-green-500 text-lg mt-3 font-bold animate-in fade-in zoom-in">
            ✓ Benar!
          </div>
        )}
        {feedback === 'wrong' && (
          <div className="text-red-500 text-lg mt-3 font-bold animate-in fade-in">
            ✗ Salah! Jawabannya {inkColor.name}
          </div>
        )}
      </div>

      {/* Color Buttons */}
      <div className={`grid gap-3 w-full max-w-[350px] ${availableColors.length > 4 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {availableColors.map((color) => (
          <button
            key={color.value}
            onPointerDown={(e) => { e.preventDefault(); handleChoice(color.value); }}
            disabled={!!feedback}
            className={`
              h-16 sm:h-20 rounded-2xl font-bold text-white shadow-sm transition-all touch-manipulation
              ${feedback ? 'opacity-70' : 'active:scale-95'}
              ${feedback === 'correct' && color.value === inkColor.value ? 'ring-4 ring-white ring-offset-2' : ''}
              ${feedback === 'wrong' && color.value === inkColor.value ? 'ring-4 ring-white ring-offset-2 animate-pulse' : ''}
            `}
            style={{ backgroundColor: color.hex }}
          >
            <span className="drop-shadow-md text-base sm:text-lg">{color.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
