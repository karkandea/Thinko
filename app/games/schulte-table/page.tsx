'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import GameContainer from '@/components/GameContainer';
import SchulteTable from '@/games/SchulteTable';
import CompletionScreen from '@/components/CompletionScreen';
import TutorialModal from '@/components/TutorialModal';
import Leaderboard from '@/components/Leaderboard';
import { PauseOverlay, StopConfirmModal } from '@/components/GameControls';
import { useAuth } from '@/lib/auth-context';
import { saveGameScore, getOrCreateUserProfile, incrementGamesPlayed } from '@/lib/db';

export default function SchulteTablePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'tutorial' | 'playing' | 'completed'>('tutorial');
  const [lastTime, setLastTime] = useState(0);
  const [lastLevel, setLastLevel] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleTutorialClose = () => {
    setGameState('playing');
  };

  const handleComplete = async (timeMs: number, level: number) => {
    setLastTime(timeMs);
    setLastLevel(level);
    setGameState('completed');

    // Save score to Firebase
    if (user) {
      setIsSaving(true);
      try {
        // Ensure user profile exists
        await getOrCreateUserProfile(
          user.uid,
          user.displayName || 'Anonymous',
          user.email || '',
          user.photoURL || ''
        );

        // Save score (lower time is better, so we use negative for ranking)
        // Actually, for time-based games, we want lowest time = best
        // So we'll store the actual time and sort ascending in leaderboard
        await saveGameScore(
          user.uid,
          'schulte-table',
          Math.round(timeMs), // Score is time in ms (lower is better)
          level,
          undefined,
          { avgPerLevel: `${(timeMs / 1000 / level).toFixed(1)}s` }
        );

        await incrementGamesPlayed(user.uid);
      } catch (error) {
        console.error('Failed to save score:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handlePlayAgain = () => {
    setGameState('tutorial'); // Show tutorial again
    setIsPaused(false);
  };

  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

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
    if (lastLevel >= 6) return 'amazing';
    if (lastLevel >= 4) return 'good';
    if (lastLevel >= 2) return 'average';
    return 'tryAgain';
  };

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
            isPaused={isPaused}
          />
          {isPaused && !showStopConfirm && (
            <PauseOverlay onResume={handleResume} />
          )}
        </>
      )}
      
      {gameState === 'completed' && (
        <div className="space-y-6">
          <CompletionScreen 
            gameSlug="schulte-table"
            scoreDisplay={`${(lastTime / 1000).toFixed(2)}s`}
            onPlayAgain={handlePlayAgain}
            rating={getRating()}
            extraStats={[
              { label: 'Level', value: `${lastLevel}/7` },
              { label: 'Avg/Level', value: `${(lastTime / 1000 / lastLevel).toFixed(1)}s` },
            ]}
          />
          {isSaving && (
            <p className="text-center text-sm text-slate-500">Menyimpan skor...</p>
          )}
          <Leaderboard 
            gameSlug="schulte-table" 
            gameTitle="Tabel Schulte"
            scoreFormatter={(score) => `${(score / 1000).toFixed(2)}s`}
            lowerIsBetter={true}
          />
        </div>
      )}

      {showStopConfirm && (
        <StopConfirmModal 
          onConfirm={handleStopConfirm}
          onCancel={handleStopCancel}
        />
      )}
    </GameContainer>
  );
}
