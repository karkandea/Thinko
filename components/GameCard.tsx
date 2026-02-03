'use client';

import { useRouter } from 'next/navigation';
import { GameProps } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

export default function GameCard({ game }: { game: GameProps }) {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    if (!user) {
      // Show login prompt if not logged in
      setShowLoginPrompt(true);
      return;
    }
    
    // User is logged in, go to game
    router.push(`/games/${game.slug}`);
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
      // After successful login, navigate to game
      router.push(`/games/${game.slug}`);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleClick}
        className="block w-full text-left p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-primary transition-all active:scale-[0.98]"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{game.icon}</div>
          <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
            {game.estimatedTime}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          {game.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
          {game.description}
        </p>
      </button>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔐</div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                Login Dulu, Bos!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Login buat simpan skor kamu dan lihat progress-mu dari waktu ke waktu.
              </p>
            </div>
            
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all active:scale-[0.98] disabled:opacity-50 mb-3"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {isLoggingIn ? 'Loading...' : 'Login dengan Google'}
              </span>
            </button>
            
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="w-full py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-sm"
            >
              Nanti aja deh
            </button>
          </div>
        </div>
      )}
    </>
  );
}
