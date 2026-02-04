'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  photoURL: string;
  score: number;
  userId: string;
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
        // Fetch from best_scores collection (real-time tracked best scores)
        const q = query(
          collection(db, 'best_scores'),
          where('gameSlug', '==', gameSlug),
          orderBy('score', lowerIsBetter ? 'asc' : 'desc'),
          limit(10)
        );
        
        const snapshot = await getDocs(q);
        
        // Fetch user profiles for each score
        const entriesWithProfiles = await Promise.all(
          snapshot.docs.map(async (scoreDoc, index) => {
            const scoreData = scoreDoc.data();
            
            try {
              const userDoc = await getDoc(doc(db, 'users', scoreData.userId));
              const userData = userDoc.exists() ? userDoc.data() : null;
              
              return {
                rank: index + 1,
                displayName: userData?.displayName || 'Anonymous',
                photoURL: userData?.photoURL || '',
                score: scoreData.score,
                userId: scoreData.userId,
              };
            } catch {
              return {
                rank: index + 1,
                displayName: 'Anonymous',
                photoURL: '',
                score: scoreData.score,
                userId: scoreData.userId,
              };
            }
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
  }, [gameSlug, lowerIsBetter]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <div className="text-left">
            <h3 className="font-bold">Leaderboard</h3>
            <p className="text-xs text-white/80">{gameTitle}</p>
          </div>
        </div>
        <svg 
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Leaderboard List */}
      {isExpanded && (
        <div className="p-4 max-h-80 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">🎮</p>
              <p className="text-slate-500">Belum ada skor</p>
              <p className="text-slate-400 text-sm">Jadilah yang pertama!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    entry.rank <= 3 
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200' 
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                    entry.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                    entry.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {entry.rank === 1 ? '👑' : entry.rank}
                  </div>

                  {/* Avatar */}
                  {entry.photoURL ? (
                    <Image
                      src={entry.photoURL}
                      alt={entry.displayName}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {entry.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate text-sm">{entry.displayName}</p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="font-bold text-amber-600 text-sm">{scoreFormatter(entry.score)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
