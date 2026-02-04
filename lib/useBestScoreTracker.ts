'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth-context';

interface UseBestScoreTrackerOptions {
  gameSlug: string;
  lowerIsBetter?: boolean; // For time-based games like Schulte Table
}

interface BestScoreData {
  score: number;
  level?: number;
  accuracy?: number;
  extraStats?: Record<string, string | number>;
  updatedAt: Date;
}

/**
 * Real-time best score tracker hook
 * Automatically saves to Firestore when player beats their best score DURING gameplay
 */
export function useBestScoreTracker({ gameSlug, lowerIsBetter = false }: UseBestScoreTrackerOptions) {
  const { user } = useAuth();
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastSavedScore = useRef<number | null>(null);
  const saveInProgress = useRef(false);

  // Fetch personal best on mount
  useEffect(() => {
    const fetchBest = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const bestRef = doc(db, 'best_scores', `${user.uid}_${gameSlug}`);
        const bestSnap = await getDoc(bestRef);
        
        if (bestSnap.exists()) {
          const data = bestSnap.data();
          setPersonalBest(data.score);
          lastSavedScore.current = data.score;
        }
      } catch (error) {
        console.error('Failed to fetch personal best:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBest();
  }, [user, gameSlug]);

  // Check if score is better than personal best
  const isBetterScore = useCallback((newScore: number, currentBest: number | null): boolean => {
    if (currentBest === null) return true;
    
    if (lowerIsBetter) {
      return newScore < currentBest;
    }
    return newScore > currentBest;
  }, [lowerIsBetter]);

  // Report score update during gameplay - call this frequently
  const reportScore = useCallback(async (
    score: number,
    extraData?: { level?: number; accuracy?: number; extraStats?: Record<string, string | number> }
  ) => {
    if (!user || saveInProgress.current) return;

    // Check if this is a new best
    if (!isBetterScore(score, personalBest)) {
      return;
    }

    // Avoid saving the same score multiple times
    if (lastSavedScore.current !== null) {
      if (!isBetterScore(score, lastSavedScore.current)) {
        return;
      }
    }

    saveInProgress.current = true;

    try {
      const bestRef = doc(db, 'best_scores', `${user.uid}_${gameSlug}`);
      
      await setDoc(bestRef, {
        userId: user.uid,
        gameSlug,
        score,
        level: extraData?.level || null,
        accuracy: extraData?.accuracy || null,
        extraStats: extraData?.extraStats || null,
        updatedAt: serverTimestamp(),
      });

      setPersonalBest(score);
      lastSavedScore.current = score;
      setIsNewRecord(true);

      console.log(`🏆 New best score saved: ${score} for ${gameSlug}`);
    } catch (error) {
      console.error('Failed to save best score:', error);
    } finally {
      saveInProgress.current = false;
    }
  }, [user, gameSlug, personalBest, isBetterScore]);

  // Reset new record flag (call when showing completion screen)
  const resetNewRecordFlag = useCallback(() => {
    setIsNewRecord(false);
  }, []);

  return {
    personalBest,
    isNewRecord,
    loading,
    reportScore,
    resetNewRecordFlag,
  };
}

/**
 * Fetch global best score for a game (for leaderboard comparison)
 */
export async function getGlobalBestScore(gameSlug: string): Promise<number | null> {
  try {
    const globalRef = doc(db, 'global_best', gameSlug);
    const globalSnap = await getDoc(globalRef);
    
    if (globalSnap.exists()) {
      return globalSnap.data().score;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch global best:', error);
    return null;
  }
}

/**
 * Update global best if player beats the global record
 */
export async function updateGlobalBest(
  gameSlug: string, 
  score: number, 
  userId: string,
  displayName: string,
  lowerIsBetter: boolean = false
): Promise<boolean> {
  try {
    const globalRef = doc(db, 'global_best', gameSlug);
    const globalSnap = await getDoc(globalRef);
    
    const currentBest = globalSnap.exists() ? globalSnap.data().score : null;
    
    // Check if new score is better
    const isBetter = currentBest === null || 
      (lowerIsBetter ? score < currentBest : score > currentBest);

    if (isBetter) {
      await setDoc(globalRef, {
        score,
        userId,
        displayName,
        gameSlug,
        updatedAt: serverTimestamp(),
      });
      console.log(`🌟 New GLOBAL best score: ${score} for ${gameSlug} by ${displayName}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to update global best:', error);
    return false;
  }
}
