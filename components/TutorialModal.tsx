'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { TUTORIAL_CONTENT, TutorialData } from '@/data/tutorialContent';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isOpen, setIsOpen] = useState(true);
  const [lottieData, setLottieData] = useState<object | null>(null);

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
          console.log('Tutorial animation not found:', animationPath);
        });
    }
  }, [gameId]);

  const handleStart = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  const handleSkip = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  if (!content) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            onClick={handleSkip} // Click outside to close
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg relative border border-white/20 dark:border-slate-800 overflow-hidden flex flex-col z-10"
          >
            {/* Header / Animation Area */}
            <div className="relative">
              {lottieData ? (
                <div className="w-full aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center p-8">
                  <Lottie 
                    animationData={lottieData}
                    loop={true}
                    className="w-full h-full drop-shadow-lg"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                     <div>
                       <h2 className="text-3xl font-black text-white drop-shadow-md mb-1">
                        {content.title}
                       </h2>
                       <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white/90 text-sm font-bold border border-white/10">
                         <Clock className="w-3.5 h-3.5" />
                         {content.time}
                       </div>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-primary via-purple-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')] mix-blend-overlay" />
                   <div className="text-7xl animate-bounce drop-shadow-xl">🧠</div>
                   <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                      <h2 className="text-3xl font-black drop-shadow-md">{content.title}</h2>
                   </div>
                </div>
              )}

              {/* Close Button */}
              <button 
                onClick={handleSkip}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full transition-colors border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instructions Content */}
            <div className="p-6 flex-1 flex flex-col">
              {!lottieData && (
                 <div className="mb-4 flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 text-sm font-bold">
                       <Clock className="w-3.5 h-3.5" />
                       {content.time}
                    </div>
                 </div>
              )}

              <div className="space-y-4 mb-8">
                 <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-3">Cara Bermain</h3>
                 <div className="space-y-3">
                   {content.instructions.map((instruction, idx) => (
                     <motion.div 
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       key={idx} 
                       className="flex items-start gap-4"
                     >
                       <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mt-0.5">
                         {idx + 1}
                       </div>
                       <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                         {instruction}
                       </p>
                     </motion.div>
                   ))}
                 </div>
              </div>

              {/* Start Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                className="w-full py-4 mt-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 text-lg group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Play className="w-6 h-6 fill-current" />
                <span>{content.cta}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
