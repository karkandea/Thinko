'use client';

import { useRouter } from 'next/navigation';
import { GameProps } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Clock, Trophy } from 'lucide-react';

import dynamic from 'next/dynamic';
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import { motion, AnimatePresence } from 'framer-motion';
import loginAnimation from '@/public/login.json';

export default function GameCard({ game, index }: { game: GameProps; index?: number }) {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    
    router.push(`/games/${game.slug}`);
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
      router.push(`/games/${game.slug}`);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <motion.button 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index ? index * 0.1 : 0 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={cn(
          "group relative flex flex-col w-full text-left p-6 rounded-2xl overflow-hidden",
          "bg-white/80 dark:bg-slate-900/60 backdrop-blur-md",
          "border border-white/20 dark:border-white/10",
          "shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
        )}
      >
        {/* Hover Highlight Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 w-full">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl text-primary group-hover:scale-110 transition-transform duration-300">
              {game.icon}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-full text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                {game.estimatedTime}
              </span>
            </div>
          </div>

          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 mb-2 group-hover:text-primary transition-colors">
            {game.title}
          </h3>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {game.description}
          </p>
          
          <div className="flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
            PLAY NOW <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </motion.button>

      {/* Login Prompt Modal */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setShowLoginPrompt(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 border border-white/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              {/* Background Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[60px] rounded-full pointing-events-none" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/20 blur-[60px] rounded-full pointing-events-none" />

              <div className="relative text-center mb-8">
                <div className="w-40 h-40 mx-auto -mt-4 -mb-4">
                  <Lottie animationData={loginAnimation} loop={true} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  Eits, Login Dulu! 🚀
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Login biar skor keren lo kesimpen & bisa pamer ke leaderboard global.
                </p>
              </div>
              
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full group relative flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>{isLoggingIn ? 'Logging in...' : 'Gas Login Google'}</span>
                
                {/* Button Shine Effect */}
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                   <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:animate-shine" />
                </div>
              </button>
              
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full mt-4 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-sm font-medium"
              >
                Nanti dulu deh
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
