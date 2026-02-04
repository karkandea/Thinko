'use client';

import React, { useState, useCallback } from 'react';
import GameContainer from '@/components/GameContainer';
import GameLobby from '@/components/GameLobby';
import RapidMath from '@/games/RapidMath';
import CompletionScreen from '@/components/CompletionScreen';
import TutorialModal from '@/components/TutorialModal';
import Leaderboard from '@/components/Leaderboard';
import { PauseOverlay, StopConfirmModal } from '@/components/GameControls';
import { useAuth } from '@/lib/auth-context';
import { getOrCreateUserProfile, incrementGamesPlayed } from '@/lib/db';
import { useBestScoreTracker } from '@/lib/useBestScoreTracker';

export default function RapidMathPage() {
  const { user } = useAuth();
  const { reportScore, isNewRecord } = useBestScoreTracker({ gameSlug: 'rapid-math' });
  const [gameState, setGameState] = useState<'lobby' | 'tutorial' | 'playing' | 'completed'>('lobby');
  const [lastScore, setLastScore] = useState(0);
  const [lastAccuracy, setLastAccuracy] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Real-time score update handler
  const handleScoreUpdate = (score: number, accuracy: number) => {
    reportScore(score, { accuracy });
  };

  const handlePlay = () => {
    setGameState('tutorial');
  };

  const handleTutorialClose = () => {
    setGameState('playing');
  };

  const handleComplete = async (score: number, accuracy: number) => {
    setLastScore(score);
    setLastAccuracy(accuracy);
    setGameState('completed');

    // Report final score
    reportScore(score, { accuracy });

    if (user) {
      setIsSaving(true);
      try {
        await getOrCreateUserProfile(user.uid, user.displayName || 'Anonymous', user.email || '', user.photoURL || '');
        await incrementGamesPlayed(user.uid);
      } catch (error) {
        console.error('Failed to save:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handlePlayAgain = () => {
    setGameState('tutorial');
    setIsPaused(false);
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
    if (lastScore >= 30 && lastAccuracy >= 90) return 'amazing';
    if (lastScore >= 20 && lastAccuracy >= 80) return 'good';
    if (lastScore >= 10) return 'average';
    return 'tryAgain';
  };

  if (gameState === 'lobby') {
    return (
      <GameLobby
        gameSlug="rapid-math"
        gameTitle="Hitung Cepat"
        gameDescription="Selesaikan soal matematika secepat mungkin sebelum waktu habis."
        gameIcon="🔢"
        onPlay={handlePlay}
        scoreFormatter={(s) => `${s} benar`}
      />
    );
  }

  return (
    <GameContainer 
      title="Hitung Cepat"
      showControls={gameState === 'playing'}
      isPaused={isPaused}
      onPause={handlePause}
      onResume={handleResume}
      onStop={handleStop}
    >
      {gameState === 'tutorial' && (
        <TutorialModal gameId="math" onClose={handleTutorialClose} />
      )}
      
      {gameState === 'playing' && (
        <>
          <RapidMath onComplete={handleComplete} onScoreUpdate={handleScoreUpdate} isPaused={isPaused} />
          {isPaused && !showStopConfirm && <PauseOverlay onResume={handleResume} />}
        </>
      )}
      
      {gameState === 'completed' && (
        <div className="space-y-6">
          <CompletionScreen 
            gameSlug="rapid-math"
            scoreDisplay={`${lastScore} Benar`}
            onPlayAgain={handlePlayAgain}
            rating={getRating()}
            extraStats={[{ label: 'Accuracy', value: `${lastAccuracy}%` }]}
            isNewRecord={isNewRecord}
          />
          {isSaving && <p className="text-center text-sm text-slate-500">Menyimpan skor...</p>}
          <Leaderboard gameSlug="rapid-math" gameTitle="Hitung Cepat" scoreFormatter={(s) => `${s} benar`} />
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
