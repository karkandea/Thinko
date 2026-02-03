'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import GameContainer from '@/components/GameContainer';
import StroopTest from '@/games/StroopTest';
import CompletionScreen from '@/components/CompletionScreen';
import TutorialModal from '@/components/TutorialModal';
import Leaderboard from '@/components/Leaderboard';
import { PauseOverlay, StopConfirmModal } from '@/components/GameControls';
import { useAuth } from '@/lib/auth-context';
import { saveGameScore, getOrCreateUserProfile, incrementGamesPlayed } from '@/lib/db';

export default function StroopTestPage() {
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
        await saveGameScore(user.uid, 'stroop-test', score, undefined, accuracy);
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
    if (lastScore >= 150 && lastAccuracy >= 90) return 'amazing';
    if (lastScore >= 100 && lastAccuracy >= 80) return 'good';
    if (lastScore >= 50) return 'average';
    return 'tryAgain';
  };

  return (
    <GameContainer 
      title="Tes Stroop"
      showControls={gameState === 'playing'}
      isPaused={isPaused}
      onPause={handlePause}
      onResume={handleResume}
      onStop={handleStop}
    >
      {gameState === 'tutorial' && (
        <TutorialModal gameId="stroop" onClose={handleTutorialClose} />
      )}
      
      {gameState === 'playing' && (
        <>
          <StroopTest onComplete={handleComplete} isPaused={isPaused} />
          {isPaused && !showStopConfirm && <PauseOverlay onResume={handleResume} />}
        </>
      )}
      
      {gameState === 'completed' && (
        <div className="space-y-6">
          <CompletionScreen 
            gameSlug="stroop-test"
            scoreDisplay={`${lastScore} Poin`}
            onPlayAgain={handlePlayAgain}
            rating={getRating()}
            extraStats={[{ label: 'Accuracy', value: `${lastAccuracy}%` }]}
          />
          {isSaving && <p className="text-center text-sm text-slate-500">Menyimpan skor...</p>}
          <Leaderboard gameSlug="stroop-test" gameTitle="Tes Stroop" scoreFormatter={(s) => `${s} poin`} />
        </div>
      )}

      {showStopConfirm && <StopConfirmModal onConfirm={handleStopConfirm} onCancel={handleStopCancel} />}
    </GameContainer>
  );
}
