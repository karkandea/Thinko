'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Image from 'next/image';
import GlobalLeaderboard from './GlobalLeaderboard';
import { Trophy, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthButtonProps {
  onShowLeaderboard?: () => void;
}

export default function AuthButton({ onShowLeaderboard }: AuthButtonProps) {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showGlobalLeaderboard, setShowGlobalLeaderboard] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setShowDropdown(false);
    await signOut();
  };

  const handleShowLeaderboard = () => {
    setShowDropdown(false);
    if (onShowLeaderboard) {
      onShowLeaderboard();
    } else {
      setShowGlobalLeaderboard(true);
    }
  };

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
    );
  }

  if (user) {
    return (
      <>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || 'User'}
                width={36}
                height={36}
                className="rounded-full border-2 border-primary"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
              </div>
            )}
          </button>

          <AnimatePresence>
            {showDropdown && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setShowDropdown(false)}
                />
                
                {/* Dropdown */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-2 w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 dark:border-white/10 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-800 dark:text-white truncate flex items-center gap-2">
                       <UserIcon className="w-4 h-4 text-primary" />
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                  
                  <div className="p-2 space-y-1">
                    <button
                      onClick={handleShowLeaderboard}
                      className="w-full px-4 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors flex items-center gap-2.5 font-medium group"
                    >
                      <Trophy className="w-4 h-4 group-hover:text-amber-500 transition-colors" />
                      <span>Global Leaderboard</span>
                    </button>
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2.5 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2.5 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showGlobalLeaderboard && (
            <GlobalLeaderboard key="leaderboard" onClose={() => setShowGlobalLeaderboard(false)} />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isSigningIn}
      className={cn(
        "flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full",
        "hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50 shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-slate-200"
      )}
    >
      {isSigningIn ? (
        <div className="w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">
        {isSigningIn ? 'Loading...' : 'Login'}
      </span>
    </button>
  );
}
