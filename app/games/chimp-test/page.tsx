'use client';

import React, { useState, useCallback, useEffect } from 'react';
import GameContainer from '@/components/GameContainer';
import GameLobby from '@/components/GameLobby';
import ChimpTest from '@/games/ChimpTest';
import CompletionScreen from '@/components/CompletionScreen';
import TutorialModal from '@/components/TutorialModal';
import Leaderboard from '@/components/Leaderboard';
import { PauseOverlay, StopConfirmModal } from '@/components/GameControls';
import { useAuth } from '@/lib/auth-context';
import { useBestScoreTracker } from '@/lib/useBestScoreTracker';
import { getOrCreateUserProfile, incrementGamesPlayed } from '@/lib/db';

export default function ChimpTestPage() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'lobby' | 'tutorial' | 'playing' | 'completed'>('lobby');
  const [lastLevel, setLastLevel] = useState(0);
  const [lastStreak, setLastStreak] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  // Initialize profile on first play
  useEffect(() => {
    if (user && gameState === 'playing') {
      getOrCreateUserProfile(user.uid, user.displayName || 'Anonymous', user.email || '', user.photoURL || '');
    }
  }, [user, gameState]);

  // Real-time best score tracker - higher level is better
  const { personalBest, isNewRecord, reportScore, resetNewRecordFlag } = useBestScoreTracker({
    gameSlug: 'chimp-test',
    lowerIsBetter: false,
  });

  const handlePlay = () => {
    setGameState('tutorial');
    resetNewRecordFlag();
  };

  const handleTutorialClose = () => {
    setGameState('playing');
  };

  // Called during gameplay when level changes
  const handleScoreUpdate = useCallback((level: number, maxStreak: number) => {
    reportScore(level, { level, extraStats: { maxStreak } });
  }, [reportScore]);

  const handleComplete = async (level: number, maxStreak: number) => {
    setLastLevel(level);
    setLastStreak(maxStreak);
    setGameState('completed');

    // Final score save
    reportScore(level, { level, extraStats: { maxStreak } });

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
    if (lastLevel >= 10) return 'amazing';
    if (lastLevel >= 7) return 'good';
    if (lastLevel >= 5) return 'average';
    return 'tryAgain';
  };

  if (gameState === 'lobby') {
    return (
      <GameLobby
        gameSlug="chimp-test"
        gameTitle="Tes Simpanse"
        gameDescription="Uji memori kerja dengan mengingat posisi angka yang muncul sekilas."
        gameIcon="🐒"
        onPlay={handlePlay}
        scoreFormatter={(s) => `Level ${s}`}
      />
    );
  }

  return (
    <GameContainer 
      title="Tes Simpanse"
      showControls={gameState === 'playing'}
      isPaused={isPaused}
      onPause={handlePause}
      onResume={handleResume}
      onStop={handleStop}
    >
      {gameState === 'tutorial' && (
        <TutorialModal gameId="chimp" onClose={handleTutorialClose} />
      )}
      
      {gameState === 'playing' && (
        <>
          <ChimpTest 
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
            gameSlug="chimp-test"
            scoreDisplay={`Level ${lastLevel}`}
            onPlayAgain={handlePlayAgain}
            rating={getRating()}
            isNewRecord={isNewRecord}
            extraStats={[
              { label: 'Max Streak', value: `${lastStreak}` },
              ...(personalBest ? [{ label: 'Best', value: `Level ${personalBest}` }] : []),
            ]}
          />
          <Leaderboard gameSlug="chimp-test" gameTitle="Tes Simpanse" scoreFormatter={(s) => `Level ${s}`} />
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
