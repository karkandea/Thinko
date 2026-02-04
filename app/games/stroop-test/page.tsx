'use client';

import React, { useState, useCallback, useEffect } from 'react';
import GameContainer from '@/components/GameContainer';
import GameLobby from '@/components/GameLobby';
import StroopTest from '@/games/StroopTest';
import CompletionScreen from '@/components/CompletionScreen';
import TutorialModal from '@/components/TutorialModal';
import Leaderboard from '@/components/Leaderboard';
import { PauseOverlay, StopConfirmModal } from '@/components/GameControls';
import { useAuth } from '@/lib/auth-context';
import { useBestScoreTracker } from '@/lib/useBestScoreTracker';
import { getOrCreateUserProfile, incrementGamesPlayed } from '@/lib/db';

export default function StroopTestPage() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'lobby' | 'tutorial' | 'playing' | 'completed'>('lobby');
  const [lastScore, setLastScore] = useState(0);
  const [lastAccuracy, setLastAccuracy] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  useEffect(() => {
    if (user && gameState === 'playing') {
      getOrCreateUserProfile(user.uid, user.displayName || 'Anonymous', user.email || '', user.photoURL || '');
    }
  }, [user, gameState]);

  const { personalBest, isNewRecord, reportScore, resetNewRecordFlag } = useBestScoreTracker({
    gameSlug: 'stroop-test',
    lowerIsBetter: false,
  });

  const handlePlay = () => {
    setGameState('tutorial');
    resetNewRecordFlag();
  };

  const handleTutorialClose = () => {
    setGameState('playing');
  };

  const handleScoreUpdate = useCallback((score: number, accuracy: number) => {
    reportScore(score, { accuracy });
  }, [reportScore]);

  const handleComplete = async (score: number, accuracy: number) => {
    setLastScore(score);
    setLastAccuracy(accuracy);
    setGameState('completed');
    reportScore(score, { accuracy });
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
    if (lastScore >= 150 && lastAccuracy >= 90) return 'amazing';
    if (lastScore >= 100 && lastAccuracy >= 80) return 'good';
    if (lastScore >= 50) return 'average';
    return 'tryAgain';
  };

  if (gameState === 'lobby') {
    return (
      <GameLobby
        gameSlug="stroop-test"
        gameTitle="Tes Stroop"
        gameDescription="Pilih warna tinta, bukan kata yang tertulis. Uji kemampuan fokus otakmu!"
        gameIcon="🎨"
        onPlay={handlePlay}
        scoreFormatter={(s) => `${s} poin`}
      />
    );
  }

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
          <StroopTest 
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
            gameSlug="stroop-test"
            scoreDisplay={`${lastScore} Poin`}
            onPlayAgain={handlePlayAgain}
            rating={getRating()}
            isNewRecord={isNewRecord}
            extraStats={[
              { label: 'Accuracy', value: `${lastAccuracy}%` },
              ...(personalBest ? [{ label: 'Best', value: `${personalBest} poin` }] : []),
            ]}
          />
          <Leaderboard gameSlug="stroop-test" gameTitle="Tes Stroop" scoreFormatter={(s) => `${s} poin`} />
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
