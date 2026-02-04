'use client';

import React, { useState, useCallback, useEffect } from 'react';
import GameContainer from '@/components/GameContainer';
import GameLobby from '@/components/GameLobby';
import ReactionTime from '@/games/ReactionTime';
import CompletionScreen from '@/components/CompletionScreen';
import TutorialModal from '@/components/TutorialModal';
import Leaderboard from '@/components/Leaderboard';
import { StopConfirmModal } from '@/components/GameControls';
import { useAuth } from '@/lib/auth-context';
import { useBestScoreTracker } from '@/lib/useBestScoreTracker';
import { getOrCreateUserProfile, incrementGamesPlayed } from '@/lib/db';

export default function ReactionTimePage() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'lobby' | 'tutorial' | 'playing' | 'completed'>('lobby');
  const [avgTime, setAvgTime] = useState(0);
  const [bestTime, setBestTime] = useState(0);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  // Initialize profile on first play
  useEffect(() => {
    if (user && gameState === 'playing') {
      getOrCreateUserProfile(user.uid, user.displayName || 'Anonymous', user.email || '', user.photoURL || '');
    }
  }, [user, gameState]);

  // Real-time best score tracker - lower time is better
  const { personalBest, isNewRecord, reportScore, resetNewRecordFlag } = useBestScoreTracker({
    gameSlug: 'reaction-time',
    lowerIsBetter: true,
  });

  const handlePlay = () => {
    setGameState('tutorial');
    resetNewRecordFlag();
  };

  const handleTutorialClose = () => {
    setGameState('playing');
  };

  // Called during gameplay when a reaction time is recorded
  const handleScoreUpdate = useCallback((reactionMs: number) => {
    reportScore(Math.round(reactionMs));
  }, [reportScore]);

  const handleComplete = async (avgMs: number, bestMs: number) => {
    setAvgTime(avgMs);
    setBestTime(bestMs);
    setGameState('completed');

    // Final score save - use best time
    reportScore(Math.round(bestMs));

    if (user) {
      await incrementGamesPlayed(user.uid);
    }
  };

  const handlePlayAgain = () => {
    setGameState('tutorial');
    resetNewRecordFlag();
  };

  const handleBackToLobby = () => {
    setGameState('lobby');
  };

  const handleStop = useCallback(() => {
    setShowStopConfirm(true);
  }, []);

  const handleStopConfirm = () => {
    setShowStopConfirm(false);
    setGameState('lobby');
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

  if (gameState === 'lobby') {
    return (
      <GameLobby
        gameSlug="reaction-time"
        gameTitle="Tes Reaksi"
        gameDescription="Ukur seberapa cepat refleks kamu merespon perubahan warna."
        gameIcon="⚡"
        onPlay={handlePlay}
        scoreFormatter={(s) => `${s}ms`}
        lowerIsBetter={true}
      />
    );
  }

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
        <ReactionTime 
          onComplete={handleComplete}
          onScoreUpdate={handleScoreUpdate}
        />
      )}
      
      {gameState === 'completed' && (
        <div className="space-y-6">
          <CompletionScreen 
            gameSlug="reaction-time"
            scoreDisplay={`${Math.round(avgTime)}ms`}
            onPlayAgain={handlePlayAgain}
            rating={getRating()}
            isNewRecord={isNewRecord}
            extraStats={[
              { label: 'Best', value: `${Math.round(bestTime)}ms` },
              ...(personalBest ? [{ label: 'Record', value: `${personalBest}ms` }] : []),
            ]}
          />
          <Leaderboard gameSlug="reaction-time" gameTitle="Tes Reaksi" scoreFormatter={(s) => `${s}ms`} lowerIsBetter={true} />
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
