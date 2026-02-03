'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import GameContainer from '@/components/GameContainer';
import VisualMemory from '@/games/VisualMemory';
import CompletionScreen from '@/components/CompletionScreen';
import TutorialModal from '@/components/TutorialModal';
import Leaderboard from '@/components/Leaderboard';
import { PauseOverlay, StopConfirmModal } from '@/components/GameControls';
import { useAuth } from '@/lib/auth-context';
import { saveGameScore, getOrCreateUserProfile, incrementGamesPlayed } from '@/lib/db';

export default function VisualMemoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'tutorial' | 'playing' | 'completed'>('tutorial');
  const [lastScore, setLastScore] = useState(0);
  const [lastLevel, setLastLevel] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleTutorialClose = () => {
    setGameState('playing');
  };

  const handleComplete = async (score: number, maxLevel: number) => {
    setLastScore(score);
    setLastLevel(maxLevel);
    setGameState('completed');

    if (user) {
      setIsSaving(true);
      try {
        await getOrCreateUserProfile(user.uid, user.displayName || 'Anonymous', user.email || '', user.photoURL || '');
        await saveGameScore(user.uid, 'visual-memory', score, maxLevel);
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
    if (lastLevel >= 12) return 'amazing';
    if (lastLevel >= 8) return 'good';
    if (lastLevel >= 4) return 'average';
    return 'tryAgain';
  };

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
          <VisualMemory onComplete={handleComplete} isPaused={isPaused} />
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
            extraStats={[{ label: 'Max Level', value: `${lastLevel}` }]}
          />
          {isSaving && <p className="text-center text-sm text-slate-500">Menyimpan skor...</p>}
          <Leaderboard gameSlug="visual-memory" gameTitle="Memori Visual" scoreFormatter={(s) => `${s} poin`} />
        </div>
      )}

      {showStopConfirm && <StopConfirmModal onConfirm={handleStopConfirm} onCancel={handleStopCancel} />}
    </GameContainer>
  );
}
