'use client';

import React, { useState, useCallback, useEffect } from 'react';
import GameContainer from '@/components/GameContainer';
import GameLobby from '@/components/GameLobby';
import VisualMemory from '@/games/VisualMemory';
import CompletionScreen from '@/components/CompletionScreen';
import TutorialModal from '@/components/TutorialModal';
import Leaderboard from '@/components/Leaderboard';
import { PauseOverlay, StopConfirmModal } from '@/components/GameControls';
import { useAuth } from '@/lib/auth-context';
import { useBestScoreTracker } from '@/lib/useBestScoreTracker';
import { getOrCreateUserProfile, incrementGamesPlayed } from '@/lib/db';

export default function VisualMemoryPage() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'lobby' | 'tutorial' | 'playing' | 'completed'>('lobby');
  const [lastScore, setLastScore] = useState(0);
  const [lastLevel, setLastLevel] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  // Initialize profile on first play
  useEffect(() => {
    if (user && gameState === 'playing') {
      getOrCreateUserProfile(user.uid, user.displayName || 'Anonymous', user.email || '', user.photoURL || '');
    }
  }, [user, gameState]);

  // Real-time best score tracker - higher score is better
  const { personalBest, isNewRecord, reportScore, resetNewRecordFlag } = useBestScoreTracker({
    gameSlug: 'visual-memory',
    lowerIsBetter: false,
  });

  const handlePlay = () => {
    setGameState('tutorial');
    resetNewRecordFlag();
  };

  const handleTutorialClose = () => {
    setGameState('playing');
  };

  // Called during gameplay when score changes
  const handleScoreUpdate = useCallback((score: number, level: number) => {
    reportScore(score, { level });
  }, [reportScore]);

  const handleComplete = async (score: number, maxLevel: number) => {
    setLastScore(score);
    setLastLevel(maxLevel);
    setGameState('completed');

    // Final score save
    reportScore(score, { level: maxLevel });

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
    if (lastLevel >= 12) return 'amazing';
    if (lastLevel >= 8) return 'good';
    if (lastLevel >= 4) return 'average';
    return 'tryAgain';
  };

  if (gameState === 'lobby') {
    return (
      <GameLobby
        gameSlug="visual-memory"
        gameTitle="Memori Visual"
        gameDescription="Ingat pola kotak yang muncul dan klik posisi yang tepat."
        gameIcon="🧠"
        onPlay={handlePlay}
        scoreFormatter={(s) => `${s} poin`}
      />
    );
  }

  return (
    <GameContainer 
      title="Memori Visual"
      showControls={gameState === 'playing'}
      isPaused={isPaused}
      onPause={handlePause}
      onResume={handleResume}
      onStop={handleStop}
    >
      {gameState === 'tutorial' && (
        <TutorialModal gameId="visual" onClose={handleTutorialClose} />
      )}
      
      {gameState === 'playing' && (
        <>
          <VisualMemory 
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
            gameSlug="visual-memory"
            scoreDisplay={`${lastScore} Poin`}
            onPlayAgain={handlePlayAgain}
            rating={getRating()}
            isNewRecord={isNewRecord}
            extraStats={[
              { label: 'Max Level', value: `${lastLevel}` },
              ...(personalBest ? [{ label: 'Best', value: `${personalBest} poin` }] : []),
            ]}
          />
          <Leaderboard gameSlug="visual-memory" gameTitle="Memori Visual" scoreFormatter={(s) => `${s} poin`} />
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
