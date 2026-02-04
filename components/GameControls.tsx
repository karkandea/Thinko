'use client';

import React from 'react';
import { Play, Pause, Square, AlertOctagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GameControlsProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  showPause?: boolean;
}

export default function GameControls({ 
  isPaused, 
  onPause, 
  onResume, 
  onStop,
  showPause = true 
}: GameControlsProps) {
  // Logic moved to parent container for unified header controls
  return null;
}

// Pause Overlay Component
export function PauseOverlay({ onResume }: { onResume: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
           <Pause className="w-10 h-10 text-white fill-current" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Game Paused</h2>
        <p className="text-white/60 mb-8 font-medium">Take a breath, resume when ready</p>
        <button
          onClick={onResume}
          className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-2 mx-auto shadow-xl"
        >
          <Play className="w-5 h-5 fill-current" />
          RESUME
        </button>
      </motion.div>
    </motion.div>
  );
}

// Stop Confirmation Modal
export function StopConfirmModal({ 
  onConfirm, 
  onCancel 
}: { 
  onConfirm: () => void; 
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/20 dark:border-slate-800"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 dark:text-red-400">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Quit Game?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Your current progress will be lost. Are you sure you want to return to lobby?
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            Keep Playing
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/30"
          >
            Quit
          </button>
        </div>
      </motion.div>
    </div>
  );
}
