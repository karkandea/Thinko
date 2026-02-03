'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ChimpTestProps {
  onComplete: (level: number, maxStreak: number) => void;
  isPaused?: boolean;
}

// Level configuration - customize difficulty per level
const getLevelConfig = (level: number) => ({
  numberCount: Math.min(level + 3, 12), // Start with 4, max at 12
  previewTime: Math.max(2000 - (level * 100), 500), // Start 2s, decrease per level, min 0.5s
  gridCols: level <= 4 ? 5 : level <= 8 ? 6 : 7,
  gridRows: level <= 4 ? 4 : level <= 8 ? 5 : 6,
});

export default function ChimpTest({ onComplete, isPaused = false }: ChimpTestProps) {
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [maxLevel, setMaxLevel] = useState(1);
  const [numbers, setNumbers] = useState<{ id: number, x: number, y: number, val: number }[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [gameState, setGameState] = useState<'preview' | 'playing' | 'levelUp' | 'failed'>('preview');
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const config = getLevelConfig(level);
  const COLS = config.gridCols;
  const ROWS = config.gridRows;

  const startLevel = (targetLevel: number) => {
    const cfg = getLevelConfig(targetLevel);
    setGameState('preview');
    setNextNumber(1);
    setCountdown(Math.ceil(cfg.previewTime / 1000));
    
    // Generate distinct positions
    const positions: Set<string> = new Set();
    const newNumbers = [];
    
    while (newNumbers.length < cfg.numberCount) {
      const c = Math.floor(Math.random() * cfg.gridCols);
      const r = Math.floor(Math.random() * cfg.gridRows);
      const key = `${c},${r}`;
      
      if (!positions.has(key)) {
        positions.add(key);
        newNumbers.push({
          id: newNumbers.length + 1,
          x: c,
          y: r,
          val: newNumbers.length + 1
        });
      }
    }
    setNumbers(newNumbers);

    // Countdown timer for preview
    let count = Math.ceil(cfg.previewTime / 1000);
    timerRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timerRef.current!);
      }
    }, 1000);
  };

  useEffect(() => {
    startLevel(level);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBlockClick = (numVal: number) => {
    if (gameState === 'preview') {
      setGameState('playing');
      if (timerRef.current) clearInterval(timerRef.current);
    }

    if (gameState === 'levelUp' || gameState === 'failed') return;

    if (numVal === nextNumber) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      if (numVal === numbers.length) {
        // Level Complete
        const newLevel = level + 1;
        if (newLevel > maxLevel) setMaxLevel(newLevel);
        
        setGameState('levelUp');
        
        setTimeout(() => {
          if (level >= 15) {
            // Max level reached
            onComplete(level, maxStreak);
          } else {
            setLevel(newLevel);
            startLevel(newLevel);
          }
        }, 1500);
      } else {
        setNextNumber(n => n + 1);
      }
    } else {
      // Wrong click
      setStreak(0);
      const newLives = lives - 1;
      setLives(newLives);
      
      // Vibration feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
      
      if (newLives <= 0) {
        setGameState('failed');
        setTimeout(() => {
          onComplete(maxLevel, maxStreak);
        }, 1000);
      } else {
        // Restart same level
        setGameState('failed');
        setTimeout(() => {
          startLevel(level);
        }, 1000);
      }
    }
  };

  if (gameState === 'levelUp') {
    return (
      <div className="flex flex-col h-full items-center justify-center animate-in fade-in zoom-in duration-300">
        <div className="text-6xl mb-4">🧠</div>
        <h2 className="text-3xl font-black text-primary mb-2">Level {level} Clear!</h2>
        <p className="text-slate-500 text-lg">Level {level + 1} loading...</p>
        <div className="mt-4 text-sm text-slate-400">
          {config.numberCount} → {getLevelConfig(level + 1).numberCount} angka
        </div>
      </div>
    );
  }

  if (gameState === 'failed' && lives <= 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center animate-in fade-in duration-200">
        <div className="text-6xl mb-4">💀</div>
        <h2 className="text-3xl font-black text-red-500 mb-2">Game Over!</h2>
        <p className="text-slate-500 text-lg">Max Level: {maxLevel}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center justify-between pb-8 pt-4">
      {/* HUD */}
      <div className="w-full px-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
              Lv.<span className="text-primary text-xl">{level}</span>
            </div>
            <div className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
              {config.numberCount} angka
            </div>
          </div>
          <div className="text-xl font-bold text-red-500">
            {Array(3).fill(0).map((_, i) => (
              <span key={i} className={i < lives ? '' : 'opacity-30'}>❤️</span>
            ))}
          </div>
        </div>
        
        {/* Level Progress */}
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-teal-400 transition-all duration-300"
            style={{ width: `${((nextNumber - 1) / numbers.length) * 100}%` }}
          />
        </div>

        {streak >= 3 && (
          <div className="text-center mt-2 text-sm font-bold text-orange-500 animate-pulse">
            🔥 {streak} Streak!
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 w-full flex items-center justify-center px-2">
        <div 
          className="relative w-full max-w-[350px] bg-slate-100 dark:bg-slate-800 rounded-xl p-2"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${COLS}, 1fr)`, 
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            aspectRatio: `${COLS}/${ROWS}`,
            gap: '6px'
          }}
        >
          {numbers.map((cell) => {
            if (cell.val < nextNumber) return <div key={cell.id}></div>;
            
            return (
              <div 
                key={cell.id}
                className="flex items-center justify-center"
                style={{ gridColumn: cell.x + 1, gridRow: cell.y + 1 }}
              >
                <button
                  onPointerDown={(e) => { e.preventDefault(); handleBlockClick(cell.val); }}
                  className={`
                    w-full h-full rounded-lg shadow-sm font-bold text-lg sm:text-xl flex items-center justify-center 
                    transition-all select-none touch-manipulation active:scale-95
                    ${gameState === 'preview' 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-2 border-primary/50 shadow-primary/20 shadow-md' 
                      : 'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 hover:border-primary/50'
                    }
                  `}
                >
                  {gameState === 'preview' ? cell.val : '?'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="text-center mt-4 px-4">
        {gameState === 'preview' && (
          <div className="space-y-1">
            <p className="text-slate-400 text-sm">
              Hafalkan posisi angka! ({countdown}s)
            </p>
            <p className="text-xs text-primary font-medium">
              Tap angka 1 untuk mulai
            </p>
          </div>
        )}
        {gameState === 'playing' && (
          <p className="text-slate-400 text-sm">
            Tap angka <span className="font-bold text-primary">{nextNumber}</span> dari {numbers.length}
          </p>
        )}
      </div>
    </div>
  );
}
