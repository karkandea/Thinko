'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import GameContainer from '@/components/GameContainer';
import RapidMath from '@/games/RapidMath';
import CompletionScreen from '@/components/CompletionScreen';
import TutorialModal from '@/components/TutorialModal';
import Leaderboard from '@/components/Leaderboard';
import { PauseOverlay, StopConfirmModal } from '@/components/GameControls';
import { useAuth } from '@/lib/auth-context';
import { saveGameScore, getOrCreateUserProfile, incrementGamesPlayed } from '@/lib/db';

export default function RapidMathPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'tutorial' | 'playing' | 'completed'>('tutorial');
  const [lastScore, setLastScore] = useState(0);
  const [lastAccuracy, setLastAccuracy] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleTutorialClose = () => {
    setGameState('playing');
  };

  const handleComplete = async (score: number, accuracy: number) => {
    setLastScore(score);
    setLastAccuracy(accuracy);
    setGameState('completed');

    if (user) {
      setIsSaving(true);
      try {
        await getOrCreateUserProfile(user.uid, user.displayName || 'Anonymous', user.email || '', user.photoURL || '');
        await saveGameScore(user.uid, 'rapid-math', score, undefined, accuracy);
        await incrementGamesPlayed(user.uid);
      } catch (error) {
        console.error('Failed to save score:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handlePlayAgain = () => {
    setGameState('tutorial');
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
    router.push('/');
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
          <RapidMath onComplete={handleComplete} isPaused={isPaused} />
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
          />
          {isSaving && <p className="text-center text-sm text-slate-500">Menyimpan skor...</p>}
          <Leaderboard gameSlug="rapid-math" gameTitle="Hitung Cepat" scoreFormatter={(s) => `${s} benar`} />
        </div>
      )}

      {showStopConfirm && <StopConfirmModal onConfirm={handleStopConfirm} onCancel={handleStopCancel} />}
    </GameContainer>
  );
}
