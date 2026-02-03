'use client';

import React, { useState, useEffect, useRef } from 'react';

interface VisualMemoryProps {
  onComplete: (score: number, maxLevel: number) => void;
  isPaused?: boolean;
}

// Level configuration - difficulty increases
const getLevelConfig = (level: number) => {
  // Grid size increases every few levels
  let gridSize = 3;
  if (level > 10) gridSize = 5;
  else if (level > 5) gridSize = 4;
  
  // Tiles to remember increases with level
  const tileCount = Math.min(Math.floor(level / 2) + 2, gridSize * gridSize - 1);
  
  // Preview time decreases with level
  const previewTime = Math.max(2000 - (level * 80), 800);
  
  return { gridSize, tileCount, previewTime };
};

export default function VisualMemory({ onComplete, isPaused = false }: VisualMemoryProps) {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userClicks, setUserClicks] = useState<number[]>([]);
  const [wrongClicks, setWrongClicks] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'countdown' | 'showing' | 'playing' | 'correct' | 'wrong'>('countdown');
  const [lives, setLives] = useState(3);
  const [maxLevel, setMaxLevel] = useState(1);
  const [countdown, setCountdown] = useState(0);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const config = getLevelConfig(level);
  const { gridSize, tileCount, previewTime } = config;

  const startLevel = (currentLevel: number) => {
    const cfg = getLevelConfig(currentLevel);
    
    setGameState('countdown');
    setUserClicks([]);
    setWrongClicks([]);
    
    // Pick random unique tiles
    const newSequence: number[] = [];
    const totalTiles = cfg.gridSize * cfg.gridSize;
    
    while (newSequence.length < cfg.tileCount) {
      const r = Math.floor(Math.random() * totalTiles);
      if (!newSequence.includes(r)) newSequence.push(r);
    }
    
    setSequence(newSequence);

    // Short countdown before showing
    setCountdown(3);
    let count = 3;
    
    timerRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(timerRef.current!);
        setGameState('showing');
        
        // Then hide after preview time
        setTimeout(() => {
          setGameState('playing');
        }, cfg.previewTime);
      }
    }, 500);
  };

  useEffect(() => {
    startLevel(1);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing') return;
    
    // If already clicked correctly, ignore
    if (userClicks.includes(index)) return;
    
    // Check if clicked tile is in sequence
    if (sequence.includes(index)) {
      const newClicks = [...userClicks, index];
      setUserClicks(newClicks);
      setStreak(s => s + 1);
      
      // Haptic feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20);
      }
      
      // Check if all found
      if (newClicks.length === sequence.length) {
        const levelBonus = level * 10;
        const streakBonus = streak >= 5 ? 20 : 0;
        setScore(s => s + levelBonus + streakBonus);
        
        const newLevel = level + 1;
        if (newLevel > maxLevel) setMaxLevel(newLevel);
        
        setGameState('correct');
        
        setTimeout(() => {
          setLevel(newLevel);
          startLevel(newLevel);
        }, 1000);
      }
    } else {
      // Wrong tile!
      setWrongClicks(prev => [...prev, index]);
      setStreak(0);
      setLives(l => l - 1);
      setGameState('wrong');
      
      // Vibrate error
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
      
      setTimeout(() => {
        if (lives <= 1) {
          onComplete(score, maxLevel);
        } else {
          // Retry same level with new pattern
          startLevel(level);
        }
      }, 1200);
    }
  };

  const getTileClass = (index: number) => {
    const isInSequence = sequence.includes(index);
    const isClicked = userClicks.includes(index);
    const isWrong = wrongClicks.includes(index);
    
    if (gameState === 'showing' && isInSequence) {
      return 'bg-white dark:bg-white border-4 border-primary/50 shadow-lg shadow-primary/30 scale-95';
    }
    
    if (gameState === 'correct' && isInSequence) {
      return 'bg-primary border-primary animate-pulse';
    }
    
    if (gameState === 'wrong') {
      if (isWrong) return 'bg-red-500 border-red-500 animate-shake';
      if (isInSequence) return 'bg-primary/50 border-primary/50';
    }
    
    if (isClicked) {
      return 'bg-primary border-primary shadow-inner';
    }
    
    return 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-primary/50 active:scale-95';
  };

  if (gameState === 'countdown') {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="text-8xl font-black text-primary animate-pulse">
          {countdown > 0 ? countdown : '👀'}
        </div>
        <p className="text-slate-500 mt-4 text-lg">Get ready!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center justify-between pb-8 pt-4">
      {/* HUD */}
      <div className="w-full px-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
              Lv.<span className="text-primary text-xl">{level}</span>
            </div>
            <div className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
              {tileCount} tiles
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold text-primary">
              {score} pts
            </div>
            <div className="text-xl">
              {Array(3).fill(0).map((_, i) => (
                <span key={i} className={`transition-opacity ${i < lives ? 'opacity-100' : 'opacity-30'}`}>❤️</span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Progress */}
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-teal-400 transition-all duration-300"
            style={{ width: `${(userClicks.length / sequence.length) * 100}%` }}
          />
        </div>

        {streak >= 5 && (
          <div className="text-center mt-2 text-sm font-bold text-orange-500 animate-pulse">
            🔥 {streak} Streak Bonus!
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 w-full flex items-center justify-center">
        <div 
          className="grid gap-2 bg-slate-200 dark:bg-slate-800 p-3 rounded-xl"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            width: `${Math.min(320, 70 * gridSize)}px`,
            height: `${Math.min(320, 70 * gridSize)}px`
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => (
            <button
              key={i}
              onPointerDown={(e) => { e.preventDefault(); handleTileClick(i); }}
              disabled={gameState !== 'playing' || userClicks.includes(i)}
              className={`
                rounded-lg border-2 transition-all duration-200 touch-manipulation select-none
                ${getTileClass(i)}
              `}
            />
          ))}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="text-center mt-4 px-4">
        {gameState === 'showing' && (
          <p className="text-slate-600 dark:text-slate-400 text-sm animate-pulse">
            👀 Hafalkan {tileCount} kotak yang menyala!
          </p>
        )}
        {gameState === 'playing' && (
          <p className="text-slate-400 text-sm">
            Tap {sequence.length - userClicks.length} kotak lagi
          </p>
        )}
        {gameState === 'correct' && (
          <p className="text-green-500 text-lg font-bold">
            ✨ Perfect!
          </p>
        )}
        {gameState === 'wrong' && (
          <p className="text-red-500 text-lg font-bold">
            ❌ Salah!
          </p>
        )}
      </div>
    </div>
  );
}
