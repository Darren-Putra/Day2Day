'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import {
  formatDisplayDate,
  addDaysToDate,
  getTodayInTimezone,
} from '@/lib/schedule/date-utils';

interface ScheduleDatePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (newDate: string) => void;
}

export function ScheduleDatePicker({
  selectedDate,
  onDateChange,
}: ScheduleDatePickerProps) {
  const today = getTodayInTimezone();
  const isToday = selectedDate === today;

  const handlePreviousDay = () => {
    onDateChange(addDaysToDate(selectedDate, -1));
  };

  const handleNextDay = () => {
    onDateChange(addDaysToDate(selectedDate, 1));
  };

  const handleGoToToday = () => {
    onDateChange(today);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl backdrop-blur-md transition-colors duration-300">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handlePreviousDay}
          className="flex items-center gap-1 px-3 py-2 text-[11px] uppercase tracking-widest font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900/40 hover:bg-zinc-200 dark:hover:bg-zinc-900/80 rounded-full transition-colors duration-300 border border-zinc-200 dark:border-zinc-800/50"
          title="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous Day</span>
        </button>

        {!isToday && (
          <button
            onClick={handleGoToToday}
            className="px-4 py-2 text-[11px] uppercase tracking-widest font-medium text-[#3B82F6] hover:text-cyan-300 bg-[#1E3A8A]/25 hover:bg-zinc-900/50 border border-[#1E3A8A]/60 rounded-full transition-colors duration-300"
          >
            Today
          </button>
        )}
      </div>

      {/* Date Display */}
      <div className="flex items-center gap-3">
        <div className="text-center">
          <div className="text-base sm:text-lg font-medium text-zinc-900 dark:text-white flex items-center justify-center gap-2 tracking-tight">
            <span>{formatDisplayDate(selectedDate)}</span>
            {isToday && (
              <span className="text-[10px] uppercase font-medium tracking-widest px-2 py-0.5 rounded-full bg-[#1E3A8A]/25 text-[#3B82F6] border border-[#1E3A8A]/60">
                Today
              </span>
            )}
          </div>
        </div>

        {/* Hidden / Quick date input trigger */}
        <div className="relative">
          <label className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-[#3B82F6] rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900/50 cursor-pointer flex items-center justify-center transition-colors duration-300">
            <CalendarIcon className="w-4 h-4" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && onDateChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              title="Jump to date"
            />
          </label>
        </div>
      </div>

      {/* Next Day */}
      <div className="flex items-center">
        <button
          onClick={handleNextDay}
          className="flex items-center gap-1 px-3 py-2 text-[11px] uppercase tracking-widest font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900/40 hover:bg-zinc-200 dark:hover:bg-zinc-900/80 rounded-full transition-colors duration-300 border border-zinc-200 dark:border-zinc-800/50"
          title="Next Day"
        >
          <span className="hidden sm:inline">Next Day</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
