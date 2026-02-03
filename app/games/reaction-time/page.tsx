'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import GameContainer from '@/components/GameContainer';
import ReactionTime from '@/games/ReactionTime';
import CompletionScreen from '@/components/CompletionScreen';
import TutorialModal from '@/components/TutorialModal';
import Leaderboard from '@/components/Leaderboard';
import { StopConfirmModal } from '@/components/GameControls';
import { useAuth } from '@/lib/auth-context';
import { saveGameScore, getOrCreateUserProfile, incrementGamesPlayed } from '@/lib/db';

export default function ReactionTimePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'tutorial' | 'playing' | 'completed'>('tutorial');
  const [avgTime, setAvgTime] = useState(0);
  const [bestTime, setBestTime] = useState(0);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleTutorialClose = () => {
    setGameState('playing');
  };

  const handleComplete = async (avgMs: number, bestMs: number) => {
    setAvgTime(avgMs);
    setBestTime(bestMs);
    setGameState('completed');

    if (user) {
      setIsSaving(true);
      try {
        await getOrCreateUserProfile(user.uid, user.displayName || 'Anonymous', user.email || '', user.photoURL || '');
        // Lower is better for reaction time, so we use negative for sorting
        await saveGameScore(user.uid, 'reaction-time', Math.round(avgMs), undefined, undefined, { bestTime: bestMs });
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
  };

  // Reaction time doesn't have pause - just stop
  const handleStop = useCallback(() => {
    setShowStopConfirm(true);
  }, []);

  const handleStopConfirm = () => {
    setShowStopConfirm(false);
    router.push('/');
  };

  const handleStopCancel = () => {
    setShowStopConfirm(false);
  };

  const getRating = () => {
    if (avgTime < 220) return 'amazing';
    if (avgTime < 280) return 'good';
    if (avgTime < 350) return 'average';
    return 'tryAgain';
  };

  return (
    <GameContainer 
      title="Tes Reaksi"
      showControls={gameState === 'playing'}
      isPaused={false}
      onPause={() => {}}
      onResume={() => {}}
      onStop={handleStop}
      showPauseButton={false}
    >
      {gameState === 'tutorial' && (
        <TutorialModal gameId="reaction" onClose={handleTutorialClose} />
      )}
      
      {gameState === 'playing' && (
        <ReactionTime onComplete={handleComplete} />
      )}
      
      {gameState === 'completed' && (
        <div className="space-y-6">
          <CompletionScreen 
            gameSlug="reaction-time"
            scoreDisplay={`${Math.round(avgTime)}ms`}
            onPlayAgain={handlePlayAgain}
            rating={getRating()}
            extraStats={[{ label: 'Best', value: `${Math.round(bestTime)}ms` }]}
          />
          {isSaving && <p className="text-center text-sm text-slate-500">Menyimpan skor...</p>}
          <Leaderboard gameSlug="reaction-time" gameTitle="Tes Reaksi" scoreFormatter={(s) => `${s}ms`} lowerIsBetter={true} />
        </div>
      )}

      {showStopConfirm && <StopConfirmModal onConfirm={handleStopConfirm} onCancel={handleStopCancel} />}
    </GameContainer>
  );
}
