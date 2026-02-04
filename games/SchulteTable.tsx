'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface SchulteTableProps {
  onComplete: (timeMs: number, level: number) => void;
  onScoreUpdate?: (timeMs: number, level: number) => void; // Real-time score tracking
  isPaused?: boolean;
}

// Level configuration - grid size increases with level
const LEVEL_CONFIG = [
  { gridSize: 3, name: 'Warm Up' },      // Level 1: 3x3 = 9 numbers
  { gridSize: 4, name: 'Easy' },          // Level 2: 4x4 = 16 numbers  
  { gridSize: 5, name: 'Medium' },        // Level 3: 5x5 = 25 numbers
  { gridSize: 5, name: 'Medium+' },       // Level 4: 5x5 = 25 numbers (faster expected)
  { gridSize: 6, name: 'Hard' },          // Level 5: 6x6 = 36 numbers
  { gridSize: 6, name: 'Expert' },        // Level 6: 6x6 = 36 numbers (faster expected)
  { gridSize: 7, name: 'Master' },        // Level 7: 7x7 = 49 numbers
];

const MAX_LEVEL = LEVEL_CONFIG.length;

export default function SchulteTable({ onComplete, onScoreUpdate, isPaused = false }: SchulteTableProps) {
  const [pausedTime, setPausedTime] = useState(0);
  const pauseStartRef = useRef<number | null>(null);
  const [level, setLevel] = useState(1);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [wrongClick, setWrongClick] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const config = LEVEL_CONFIG[Math.min(level - 1, MAX_LEVEL - 1)];
  const GRID_SIZE = config.gridSize;
  const TOTAL_NUMBERS = GRID_SIZE * GRID_SIZE;

  // Initialize grid for current level
  const startLevel = useCallback(() => {
    const currentConfig = LEVEL_CONFIG[Math.min(level - 1, MAX_LEVEL - 1)];
    const gridSize = currentConfig.gridSize;
    const totalNumbers = gridSize * gridSize;
    
    const nums = Array.from({ length: totalNumbers }, (_, i) => i + 1);
    // Fisher-Yates shuffle
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    setNumbers(nums);
    setNextNumber(1);
    setIsPlaying(true);
    setStartTime(Date.now());
    setCurrentTime(0);
    setWrongClick(null);
  }, [level]);

  useEffect(() => {
    startLevel();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startLevel]);

  // Handle pause - track paused time
  useEffect(() => {
    if (isPaused && isPlaying) {
      // Start tracking pause time
      pauseStartRef.current = Date.now();
      if (timerRef.current) clearInterval(timerRef.current);
    } else if (!isPaused && pauseStartRef.current && isPlaying) {
      // Resume - add paused duration to total
      const pauseDuration = Date.now() - pauseStartRef.current;
      setPausedTime(prev => prev + pauseDuration);
      pauseStartRef.current = null;
    }
  }, [isPaused, isPlaying]);

  // Timer loop
  useEffect(() => {
    if (isPlaying && startTime && !isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentTime(Date.now() - startTime - pausedTime);
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, startTime, isPaused, pausedTime]);

  // Clear wrong click feedback
  useEffect(() => {
    if (wrongClick !== null) {
      const timeout = setTimeout(() => setWrongClick(null), 300);
      return () => clearTimeout(timeout);
    }
  }, [wrongClick]);

  const handleClick = (num: number) => {
    if (!isPlaying || isPaused) return;

    if (num === nextNumber) {
      setStreak(s => s + 1);
      
      if (num === TOTAL_NUMBERS) {
        // Level Complete!
        const levelTime = Date.now() - (startTime || 0);
        const newTotalTime = totalTime + levelTime;
        setTotalTime(newTotalTime);
        
        // Report score for real-time tracking
        if (onScoreUpdate) {
          onScoreUpdate(newTotalTime, level);
        }
        
        if (timerRef.current) clearInterval(timerRef.current);
        
        if (level >= MAX_LEVEL) {
          // Game Complete
          setIsPlaying(false);
          onComplete(newTotalTime, level);
        } else {
          // Next Level
          setIsPlaying(false);
          setShowLevelUp(true);
          setTimeout(() => {
            setShowLevelUp(false);
            setLevel(l => l + 1);
          }, 1500);
        }
      } else {
        setNextNumber(prev => prev + 1);
      }
    } else {
      // Wrong click - visual feedback
      setWrongClick(num);
      setStreak(0);
      // Vibration feedback for mobile
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 100);
    return `${seconds}.${milliseconds}s`;
  };

  const progress = ((nextNumber - 1) / TOTAL_NUMBERS) * 100;

  if (!isPlaying && numbers.length === 0) return null;

  // Level Up Animation
  if (showLevelUp) {
    return (
      <div className="flex flex-col h-full items-center justify-center animate-in fade-in zoom-in duration-300">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-black text-primary mb-2">Level {level} Complete!</h2>
        <p className="text-slate-500 text-lg">{formatTime(currentTime)}</p>
        <div className="mt-6 text-lg text-slate-600 dark:text-slate-400 animate-pulse">
          Level {level + 1}: {LEVEL_CONFIG[level]?.name || 'Final'} loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center justify-between pb-8">
      {/* HUD */}
      <div className="w-full px-2 mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Level {level}/{MAX_LEVEL} • <span className="text-primary">{config.name}</span>
          </div>
          <div className="text-xl font-bold font-mono text-primary">{formatTime(currentTime)}</div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-teal-400 transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-slate-500">
            Cari: <span className="font-bold text-slate-800 dark:text-white text-lg">{nextNumber}</span>
          </div>
          {streak >= 3 && (
            <div className="text-sm font-bold text-orange-500 animate-pulse">
              🔥 Streak {streak}!
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div 
        className="w-full max-w-[350px] aspect-square grid gap-1 sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
      >
        {numbers.map((num) => {
          const isClicked = num < nextNumber;
          const isWrong = wrongClick === num;
          
          return (
            <button
              key={num}
              onPointerDown={(e) => {
                e.preventDefault();
                handleClick(num);
              }}
              className={`
                flex items-center justify-center rounded-lg font-bold shadow-sm transition-all touch-manipulation select-none
                ${GRID_SIZE > 5 ? 'text-sm sm:text-lg' : 'text-lg sm:text-2xl'}
                ${isClicked 
                  ? 'bg-primary/20 text-primary/40 dark:bg-primary/10 dark:text-primary/30 pointer-events-none scale-95' 
                  : isWrong
                    ? 'bg-red-500 text-white animate-shake'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-b-4 border-slate-200 dark:border-slate-700 active:border-b-0 active:translate-y-1 active:scale-95'
                }
              `}
            >
              {num}
            </button>
          );
        })}
      </div>

      <div className="text-center px-4 mt-6">
        <p className="text-slate-400 text-sm">
          Tap angka 1 sampai {TOTAL_NUMBERS} secara berurutan.
        </p>
        {totalTime > 0 && (
          <p className="text-xs text-slate-400 mt-1">
            Total: {formatTime(totalTime + currentTime)}
          </p>
        )}
      </div>
    </div>
  );
}
