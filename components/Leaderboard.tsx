'use client';

import React, { useEffect, useState } from 'react';
import { getGameLeaderboard, GameScore } from '@/lib/db';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LeaderboardEntry extends GameScore {
  displayName?: string;
  photoURL?: string;
}

interface LeaderboardProps {
  gameSlug: string;
  gameTitle: string;
  scoreFormatter?: (score: number) => string;
  lowerIsBetter?: boolean;
}

export default function Leaderboard({ 
  gameSlug, 
  gameTitle,
  scoreFormatter = (score) => `${score}`,
  lowerIsBetter = false
}: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const scores = await getGameLeaderboard(gameSlug, 10, lowerIsBetter);
        
        // Fetch user profiles for each score
        const entriesWithProfiles = await Promise.all(
          scores.map(async (score) => {
            try {
              const userDoc = await getDoc(doc(db, 'users', score.userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                return {
                  ...score,
                  displayName: userData.displayName || 'Anonymous',
                  photoURL: userData.photoURL,
                };
              }
            } catch {
              // User profile not found
            }
            return { ...score, displayName: 'Anonymous' };
          })
        );
        
        setEntries(entriesWithProfiles);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [gameSlug]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return null; // Don't show if no entries
  }

  const displayEntries = isExpanded ? entries : entries.slice(0, 3);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span>🏆</span>
          <span>Leaderboard - {gameTitle}</span>
        </h3>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {displayEntries.map((entry, index) => (
          <div 
            key={entry.id} 
            className={`flex items-center gap-3 px-4 py-3 ${
              index === 0 ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
            }`}
          >
            {/* Rank */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${index === 0 ? 'bg-amber-400 text-white' : ''}
              ${index === 1 ? 'bg-slate-300 dark:bg-slate-500 text-white' : ''}
              ${index === 2 ? 'bg-amber-600 text-white' : ''}
              ${index > 2 ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : ''}
            `}>
              {index + 1}
            </div>
            
            {/* Avatar */}
            {entry.photoURL ? (
              <img 
                src={entry.photoURL} 
                alt="" 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {entry.displayName?.charAt(0) || '?'}
              </div>
            )}
            
            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 dark:text-white truncate text-sm">
                {entry.displayName}
              </p>
            </div>
            
            {/* Score */}
            <div className="font-bold text-primary text-sm">
              {scoreFormatter(entry.score)}
            </div>
          </div>
        ))}
      </div>
      
      {entries.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 text-sm text-primary hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          {isExpanded ? 'Lihat lebih sedikit' : `Lihat semua (${entries.length})`}
        </button>
      )}
    </div>
  );
}
