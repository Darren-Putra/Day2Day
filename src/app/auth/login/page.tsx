'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  CalendarClock,
  ShieldAlert,
  ArrowRight,
  Code2,
  PieChart,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const origin = window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      setErrorMessage('Failed to initialize Google OAuth sign in.');
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    // Set development session cookie for browser access
    document.cookie = 'd2d_session=dev_user_darren; path=/; max-age=86400; SameSite=Lax';
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1E3A8A] via-indigo-500 to-cyan-400 mx-auto flex items-center justify-center shadow-xl shadow-indigo-600/30">
            <Sparkles className="w-6 h-6 text-zinc-900 dark:text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Day2Day
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-500">
            Personal College Management & 24h Schedule System
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-3xl bg-gray-900/70 border border-gray-800/90 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Welcome Back</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Sign in with your Google account to access your personalized schedule
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-3xl bg-red-950/50 border border-red-800 text-red-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-semibold text-xs sm:text-sm shadow-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {/* Google SVG Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-zinc-300 dark:border-zinc-800/50" />
            <span className="flex-shrink mx-3 text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono">
              OR
            </span>
            <div className="flex-grow border-t border-zinc-300 dark:border-zinc-800/50" />
          </div>

          {/* Dev Demo Mode */}
          <button
            onClick={handleDemoAccess}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-zinc-800/50 hover:bg-gray-700/80 border border-zinc-300 dark:border-zinc-800/50 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
          >
            <span>Enter Workspace Preview (Demo Mode)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Feature Highlights */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/50 grid grid-cols-2 gap-3 text-left">
            <div className="p-2.5 rounded-3xl bg-gray-950/60 border border-gray-800/60">
              <CalendarClock className="w-3.5 h-3.5 text-[#3B82F6] dark:text-[#3B82F6] mb-1" />
              <div className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">24h Schedule</div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-600">Recurrence & free time</div>
            </div>
            <div className="p-2.5 rounded-3xl bg-gray-950/60 border border-gray-800/60">
              <ShieldAlert className="w-3.5 h-3.5 text-[#3B82F6] dark:text-[#3B82F6] mb-1" />
              <div className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">Conflict Engine</div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-600">Prevents overlapping</div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-600">
          Day2Day • Timezone: <span className="text-[#3B82F6] dark:text-[#3B82F6] font-mono">Asia/Makassar</span>
        </p>
      </div>
    </div>
  );
}
