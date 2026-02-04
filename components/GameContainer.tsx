'use client';

import React from 'react';
import Link from 'next/link';
import GameControls from './GameControls';
import { ArrowLeft, Pause, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameContainerProps {
  title: string;
  children: React.ReactNode;
  // Game controls props
  showControls?: boolean;
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  showPauseButton?: boolean;
}

export default function GameContainer({ 
  title, 
  children, 
  showControls = false,
  isPaused = false,
  onPause,
  onResume,
  onStop,
  showPauseButton = true,
}: GameContainerProps) {
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-slate-50 dark:bg-slate-950 shadow-2xl overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[60px]" />
        <div className="absolute top-40 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-[50px]" />
      </div>

      <header className="flex items-center p-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
        <Link 
          href="/" 
          className="p-2.5 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
        </Link>
        
        <h1 className="text-lg font-bold truncate flex-1 text-center pr-2 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          {title}
        </h1>
        
        {showControls && onPause && onResume && onStop && (
          <div className="flex items-center gap-2">
            {showPauseButton && (
              <button
                onClick={isPaused ? onResume : onPause}
                className={cn(
                  "p-2.5 rounded-full transition-all active:scale-95 shadow-sm",
                  isPaused 
                    ? "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" 
                    : "bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                )}
              >
                {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
              </button>
            )}
            
            <button
              onClick={onStop}
              className="p-2.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-all active:scale-95 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>
      
      <main className="flex-1 p-4 flex flex-col relative z-20">
        {children}
      </main>
    </div>
  );
}
