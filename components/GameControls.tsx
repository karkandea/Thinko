'use client';

import React from 'react';

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
  return (
    <div className="flex items-center gap-2">
      {showPause && (
        <button
          onClick={isPaused ? onResume : onPause}
          className={`
            p-2 rounded-lg transition-all active:scale-95
            ${isPaused 
              ? 'bg-primary text-white' 
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }
          `}
          title={isPaused ? 'Lanjutkan' : 'Pause'}
        >
          {isPaused ? (
            // Play icon
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          ) : (
            // Pause icon
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          )}
        </button>
      )}
      
      <button
        onClick={onStop}
        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all active:scale-95"
        title="Berhenti"
      >
        {/* Stop icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h12v12H6z"/>
        </svg>
      </button>
    </div>
  );
}

// Pause Overlay Component
export function PauseOverlay({ onResume }: { onResume: () => void }) {
  return (
    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-40 animate-in fade-in duration-200">
      <div className="text-center">
        <div className="text-6xl mb-4">⏸️</div>
        <h2 className="text-2xl font-bold text-white mb-2">Game Dipause</h2>
        <p className="text-slate-400 mb-6">Klik untuk lanjutkan</p>
        <button
          onClick={onResume}
          className="px-8 py-3 bg-primary hover:bg-teal-700 text-white font-bold rounded-xl transition-all active:scale-95"
        >
          Lanjutkan
        </button>
      </div>
    </div>
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
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🛑</div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            Berhenti Main?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Progress kamu di game ini akan hilang. Yakin mau berhenti?
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
          >
            Lanjut Main
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all active:scale-95"
          >
            Berhenti
          </button>
        </div>
      </div>
    </div>
  );
}
