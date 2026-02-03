'use client';

import React from 'react';
import Link from 'next/link';
import GameControls from './GameControls';

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
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-slate-50 dark:bg-slate-900">
      <header className="flex items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <Link href="/" className="p-2 mr-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-lg font-bold truncate flex-1">{title}</h1>
        
        {showControls && onPause && onResume && onStop && (
          <GameControls
            isPaused={isPaused}
            onPause={onPause}
            onResume={onResume}
            onStop={onStop}
            showPause={showPauseButton}
          />
        )}
      </header>
      
      <main className="flex-1 p-4 flex flex-col relative">
        {children}
      </main>
    </div>
  );
}
