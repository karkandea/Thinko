'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface RapidMathProps {
  onComplete: (score: number, accuracy: number) => void;
  onScoreUpdate?: (score: number, accuracy: number) => void;
  isPaused?: boolean;
}

type Operation = '+' | '-' | '*' | '/';

// Level configuration - difficulty increases every 5 correct answers
const getLevelConfig = (correctCount: number) => {
  const level = Math.floor(correctCount / 5) + 1;
  
  return {
    level,
    maxNumber: Math.min(10 + (level * 3), 50), // Numbers get bigger
    operations: level >= 3 ? ['+', '-', '*'] as Operation[] : ['+', '-'] as Operation[], // Add multiplication at level 3
    timePerQuestion: Math.max(5000 - (level * 300), 2000), // Time decreases (5s -> 2s min)
  };
};

export default function RapidMath({ onComplete, onScoreUpdate, isPaused = false }: RapidMathProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5); // Per question timer
  const [totalTime, setTotalTime] = useState(60); // Game timer
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const config = getLevelConfig(correct);

  const generateQuestion = useCallback(() => {
    const cfg = getLevelConfig(correct);
    const op = cfg.operations[Math.floor(Math.random() * cfg.operations.length)];
    let a = Math.floor(Math.random() * cfg.maxNumber) + 1;
    let b = Math.floor(Math.random() * cfg.maxNumber) + 1;

    // Keep multiplication simple (single digits)
    if (op === '*') {
      a = Math.floor(Math.random() * 9) + 2;
      b = Math.floor(Math.random() * 9) + 2;
    }
    
    // Prevent negative for subtraction
    if (op === '-' && a < b) [a, b] = [b, a];

    setQuestion(`${a} ${op} ${b}`);
    // eslint-disable-next-line no-eval
    setAnswer(eval(`${a} ${op} ${b}`));
    setUserAnswer('');
    setTimeLeft(Math.ceil(cfg.timePerQuestion / 1000));
    setTotalQuestions(t => t + 1);
    setFeedback(null);
  }, [correct]);

  // Game timer
  useEffect(() => {
    if (isPlaying && totalTime > 0) {
      const timer = setInterval(() => setTotalTime(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (totalTime === 0 && isPlaying) {
      setIsPlaying(false);
      const accuracy = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
      onComplete(correct, accuracy);
    }
  }, [isPlaying, totalTime, onComplete, correct, totalQuestions]);

  // Per-question timer
  useEffect(() => {
    if (isPlaying && timeLeft > 0 && !feedback) {
      questionTimerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up for this question
            setFeedback('wrong');
            setWrong(w => w + 1);
            setStreak(0);
            
            setTimeout(() => {
              generateQuestion();
            }, 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      };
    }
  }, [isPlaying, timeLeft, feedback, generateQuestion]);

  const startGame = () => {
    setCorrect(0);
    setWrong(0);
    setTotalQuestions(0);
    setTotalTime(60);
    setStreak(0);
    setMaxStreak(0);
    setIsPlaying(true);
    generateQuestion();
  };

  useEffect(() => {
    startGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = (num: number) => {
    if (feedback) return; // Prevent input during feedback
    
    const newVal = userAnswer + num.toString();
    setUserAnswer(newVal);
    
    const numVal = parseInt(newVal);
    
    if (numVal === answer) {
      // Correct!
      setFeedback('correct');
      setCorrect(c => {
        const newCorrect = c + 1;
        // Report score for real-time tracking
        if (onScoreUpdate) {
          const newAccuracy = (totalQuestions + 1) > 0 ? Math.round((newCorrect / (totalQuestions + 1)) * 100) : 0;
          onScoreUpdate(newCorrect, newAccuracy);
        }
        return newCorrect;
      });
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      
      // Haptic feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20);
      }
      
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      
      setTimeout(() => {
        generateQuestion();
      }, 400);
    } else if (newVal.length >= answer.toString().length || 
               (answer < 0 && newVal.length >= answer.toString().length) ||
               numVal > answer) {
      // Wrong - too many digits or number exceeded
      setFeedback('wrong');
      setWrong(w => w + 1);
      setStreak(0);
      
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([30, 30, 30]);
      }
      
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      
      setTimeout(() => {
        generateQuestion();
      }, 600);
    }
  };

  const handleClear = () => {
    if (feedback) return;
    setUserAnswer('');
  };

  const handleNegative = () => {
    if (feedback) return;
    if (userAnswer.startsWith('-')) {
      setUserAnswer(userAnswer.slice(1));
    } else {
      setUserAnswer('-' + userAnswer);
    }
  };

  const accuracy = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
  const timeProgress = (timeLeft / Math.ceil(getLevelConfig(correct).timePerQuestion / 1000)) * 100;

  return (
    <div className="flex flex-col h-full items-center justify-between pb-4">
      {/* HUD */}
      <div className="w-full px-4 mb-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
              Lv.<span className="text-primary text-xl">{config.level}</span>
            </div>
            <div className="text-lg font-bold text-primary">
              ✓ {correct}
            </div>
            {wrong > 0 && (
              <div className="text-lg font-bold text-red-500">
                ✗ {wrong}
              </div>
            )}
          </div>
          <div className={`text-2xl font-bold font-mono ${totalTime < 10 ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
            {totalTime}s
          </div>
        </div>
        
        {/* Question Time Bar */}
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${
              timeLeft <= 2 ? 'bg-red-500' : 'bg-gradient-to-r from-primary to-teal-400'
            }`}
            style={{ width: `${timeProgress}%` }}
          />
        </div>

        {streak >= 3 && (
          <div className="text-center mt-1 text-sm font-bold text-orange-500">
            🔥 {streak} Streak!
          </div>
        )}
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full mb-4">
        <div className={`
          text-5xl sm:text-6xl font-bold tracking-wider transition-all duration-200
          ${feedback === 'correct' ? 'text-green-500 scale-110' : ''}
          ${feedback === 'wrong' ? 'text-red-500 shake' : ''}
          ${!feedback ? 'text-slate-800 dark:text-white' : ''}
        `}>
          {question}
        </div>
        
        <div className="mt-4 text-xs text-slate-400">
          = ?
        </div>
        
        <div className={`
          h-16 text-5xl font-mono font-medium min-w-[140px] text-center mt-2
          border-b-4 rounded transition-colors
          ${feedback === 'correct' ? 'text-green-500 border-green-500' : ''}
          ${feedback === 'wrong' ? 'text-red-500 border-red-500' : ''}
          ${!feedback ? 'text-primary border-slate-200 dark:border-slate-700' : ''}
        `}>
          {userAnswer || <span className="text-slate-300 dark:text-slate-600">_</span>}
        </div>
        
        {feedback === 'wrong' && (
          <div className="text-red-500 text-lg mt-2 animate-in fade-in">
            Jawaban: {answer}
          </div>
        )}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-[300px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button 
            key={n}
            onPointerDown={(e) => { e.preventDefault(); handleInput(n); }}
            disabled={!!feedback}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl text-2xl font-bold shadow-sm border border-slate-200 dark:border-slate-700 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 transition-all touch-manipulation disabled:opacity-50"
          >
            {n}
          </button>
        ))}
        <button 
          onPointerDown={(e) => { e.preventDefault(); handleNegative(); }}
          disabled={!!feedback}
          className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 p-4 rounded-xl text-xl font-bold flex items-center justify-center active:bg-slate-200 dark:active:bg-slate-600 touch-manipulation disabled:opacity-50"
        >
          +/-
        </button>
        <button 
          onPointerDown={(e) => { e.preventDefault(); handleInput(0); }}
          disabled={!!feedback}
          className="bg-white dark:bg-slate-800 p-4 rounded-xl text-2xl font-bold shadow-sm border border-slate-200 dark:border-slate-700 active:bg-slate-100 dark:active:bg-slate-700 active:scale-95 transition-all touch-manipulation disabled:opacity-50"
        >
          0
        </button>
        <button 
          onPointerDown={(e) => { e.preventDefault(); handleClear(); }}
          disabled={!!feedback}
          className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-xl text-xl font-bold flex items-center justify-center active:bg-red-100 dark:active:bg-red-900/40 touch-manipulation disabled:opacity-50"
        >
          ⌫
        </button>
      </div>

      {/* Accuracy footer */}
      <div className="mt-3 text-xs text-slate-400">
        Accuracy: {accuracy}%
      </div>
    </div>
  );
}
