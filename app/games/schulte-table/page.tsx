'use client';

import React, { useState, useCallback, useEffect } from 'react';
import GameContainer from '@/components/GameContainer';
import GameLobby from '@/components/GameLobby';
import SchulteTable from '@/games/SchulteTable';
import CompletionScreen from '@/components/CompletionScreen';
import TutorialModal from '@/components/TutorialModal';
import Leaderboard from '@/components/Leaderboard';
import { PauseOverlay, StopConfirmModal } from '@/components/GameControls';
import { useAuth } from '@/lib/auth-context';
import { useBestScoreTracker } from '@/lib/useBestScoreTracker';
import { getOrCreateUserProfile, incrementGamesPlayed } from '@/lib/db';

export default function SchulteTablePage() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'lobby' | 'tutorial' | 'playing' | 'completed'>('lobby');
  const [lastTime, setLastTime] = useState(0);
  const [lastLevel, setLastLevel] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  // Initialize profile on first play
  useEffect(() => {
    if (user && gameState === 'playing') {
      getOrCreateUserProfile(user.uid, user.displayName || 'Anonymous', user.email || '', user.photoURL || '');
    }
  }, [user, gameState]);

  // Real-time best score tracker - lower time is better
  const { personalBest, isNewRecord, reportScore, resetNewRecordFlag } = useBestScoreTracker({
    gameSlug: 'schulte-table',
    lowerIsBetter: true,
  });

  const handlePlay = () => {
    setGameState('tutorial');
    resetNewRecordFlag();
  };

  const handleTutorialClose = () => {
    setGameState('playing');
  };

  // Called during gameplay when level is completed
  const handleScoreUpdate = useCallback((timeMs: number, level: number) => {
    // Only report final time (when all levels complete or highest level reached)
    // For Schulte Table, we track the time to complete current level run
    reportScore(timeMs, { level });
  }, [reportScore]);

  const handleComplete = async (timeMs: number, level: number) => {
    setLastTime(timeMs);
    setLastLevel(level);
    setGameState('completed');

    // Final score save
    reportScore(timeMs, { level });

    if (user) {
      await incrementGamesPlayed(user.uid);
    }
  };

  const handlePlayAgain = () => {
    setGameState('tutorial');
    setIsPaused(false);
    resetNewRecordFlag();
  };

  const handleBackToLobby = () => {
    setGameState('lobby');
    setIsPaused(false);
  };

  const handlePause = useCallback(() => setIsPaused(true), []);
  const handleResume = useCallback(() => setIsPaused(false), []);
  const handleStop = useCallback(() => {
    setIsPaused(true);
    setShowStopConfirm(true);
  }, []);

  const handleStopConfirm = () => {
    setShowStopConfirm(false);
    setGameState('lobby');
  };

  const handleStopCancel = () => {
    setShowStopConfirm(false);
    setIsPaused(false);
  };

  const getRating = () => {
    const seconds = lastTime / 1000;
    if (seconds < 25) return 'amazing';
    if (seconds < 40) return 'good';
    if (seconds < 60) return 'average';
    return 'tryAgain';
  };

  // Lobby state
  if (gameState === 'lobby') {
    return (
      <GameLobby
        gameSlug="schulte-table"
        gameTitle="Tabel Schulte"
        gameDescription="Latih fokus dan kecepatan mata dengan menemukan angka 1-25 secara berurutan."
        gameIcon="🔢"
        onPlay={handlePlay}
        scoreFormatter={(s) => `${(s / 1000).toFixed(2)}s`}
        lowerIsBetter={true}
      />
    );
  }

  return (
    <GameContainer 
      title="Tabel Schulte"
      showControls={gameState === 'playing'}
      isPaused={isPaused}
      onPause={handlePause}
      onResume={handleResume}
      onStop={handleStop}
    >
      {gameState === 'tutorial' && (
        <TutorialModal gameId="schulte" onClose={handleTutorialClose} />
      )}
      
      {gameState === 'playing' && (
        <>
          <SchulteTable 
            onComplete={handleComplete} 
            onScoreUpdate={handleScoreUpdate}
            isPaused={isPaused} 
          />
          {isPaused && !showStopConfirm && <PauseOverlay onResume={handleResume} />}
        </>
      )}
      
      {gameState === 'completed' && (
        <div className="space-y-6">
          <CompletionScreen 
            gameSlug="schulte-table"
            scoreDisplay={`${(lastTime / 1000).toFixed(2)} detik`}
            onPlayAgain={handlePlayAgain}
            rating={getRating()}
            isNewRecord={isNewRecord}
            extraStats={[
              { label: 'Level', value: `${lastLevel}` },
              ...(personalBest ? [{ label: 'Best', value: `${(personalBest / 1000).toFixed(2)}s` }] : []),
            ]}
          />
          <Leaderboard 
            gameSlug="schulte-table" 
            gameTitle="Tabel Schulte"
            scoreFormatter={(score) => `${(score / 1000).toFixed(2)}s`}
            lowerIsBetter={true}
          />
          <button
            onClick={handleBackToLobby}
            className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors"
          >
            ← Kembali ke Lobby
          </button>
        </div>
      )}

      {showStopConfirm && <StopConfirmModal onConfirm={handleStopConfirm} onCancel={handleStopCancel} />}
    </GameContainer>
  );
}
