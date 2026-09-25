'use client';

import React, { useState, useEffect } from 'react';
import { Menu, LogOut, Clock, User, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface NavbarProps {
  onMenuToggle: () => void;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
}

export function AppNavbar({
  onMenuToggle,
  userEmail = 'darren@student.ac.id',
  userName = 'Darren',
  userAvatar,
}: NavbarProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignored if using dev session
    } finally {
      document.cookie = 'd2d_session=; path=/; max-age=0';
      router.push('/auth/login');
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/60 lg:hidden focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-gray-400 bg-gray-900/60 border border-gray-800 px-3 py-1.5 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentTime ? `${currentTime} WITA` : 'Loading...'}</span>
          <span className="text-[10px] text-gray-400 font-sans">
            (Asia/Makassar)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User profile pill */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-800/80">
          <div className="flex items-center gap-2.5">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/20">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-gray-200 leading-tight">
                {userName}
              </div>
              <div className="text-[11px] text-gray-400 leading-tight">
                {userEmail}
              </div>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Log Out"
            className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
