'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { TUTORIAL_CONTENT, TutorialData } from '@/data/tutorialContent';

// Dynamic import for Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface TutorialModalProps {
  gameId: string;
  onClose: () => void;
}

// Map game IDs to their Lottie animation files
const LOTTIE_ANIMATIONS: Record<string, string> = {
  'schulte': '/tutorial/shutle-table.json',
};

export default function TutorialModal({ gameId, onClose }: TutorialModalProps) {
  const content = TUTORIAL_CONTENT[gameId] as TutorialData | undefined;
  const [isOpen, setIsOpen] = useState(true); // Always open by default
  const [lottieData, setLottieData] = useState<object | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Load Lottie animation if available
    const animationPath = LOTTIE_ANIMATIONS[gameId];
    if (animationPath) {
      fetch(animationPath)
        .then(res => res.json())
        .then(data => {
          setLottieData(data);
        })
        .catch(() => {
          // Animation not found, continue without it
          console.log('Tutorial animation not found:', animationPath);
        });
    }
  }, [gameId]);

  const handleStart = () => {
    setIsAnimating(true);
    // No cookie - tutorial will show every time
    setTimeout(() => {
      setIsOpen(false);
      onClose();
    }, 150);
  };

  const handleSkip = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      onClose();
    }, 150);
  };

  if (!isOpen || !content) return null;

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm
        ${isAnimating ? 'animate-out fade-out duration-150' : 'animate-in fade-in duration-200'}
      `}
    >
      <div 
        className={`
          bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg relative
          border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col
          ${isAnimating ? 'animate-out zoom-out-95 duration-150' : 'animate-in zoom-in-95 duration-200'}
        `}
      >
        {/* Lottie Animation Header - Large */}
        {lottieData && (
          <div className="w-full aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center p-8 relative">
            <Lottie 
              animationData={lottieData}
              loop={true}
              className="w-full h-full drop-shadow-xl"
            />
            {/* Title Overlay on Gradient */}
            <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/50 to-transparent">
               <h2 className="text-2xl font-black text-white drop-shadow-md">
                {content.title}
              </h2>
               <div className="flex items-center gap-2 text-white/90 text-sm font-medium mt-1">
                  <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{content.time}</span>
                  </span>
                </div>
            </div>
          </div>
        )}
        
        {/* Fallback header without animation */}
        {!lottieData && (
          <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-teal-400/20 flex items-center justify-center">
            <div className="text-6xl">🧠</div>
          </div>
        )}
        
        {/* Close Button */}
        <button 
          onClick={handleSkip}
          className="absolute top-4 right-4 text-white hover:text-white/80 transition-colors bg-black/20 hover:bg-black/40 rounded-full p-2 backdrop-blur-sm z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Content */}
        <div className="p-6 pt-4 flex-1 flex flex-col">
          {/* Only show Title & Instructions if NO Animation */}
          {!lottieData && (
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                {content.title}
              </h2>
              
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-5">
                <span className="bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{content.time}</span>
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                <ul className="space-y-2.5">
                  {content.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex items-start text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary font-bold text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* CTA - Fixed at bottom */}
          <button
            onClick={handleStart}
            className="w-full py-4 mt-auto bg-primary hover:bg-teal-700 active:scale-[0.98] transition-all text-white font-bold rounded-2xl shadow-lg border-b-4 border-teal-800/30 text-xl flex items-center justify-center gap-2 group"
          >
            <span className="group-hover:scale-110 transition-transform">🎮</span>
            <span>{content.cta}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
