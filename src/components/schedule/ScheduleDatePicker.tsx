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
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-900/60 border border-gray-800/80 rounded-2xl backdrop-blur-md">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handlePreviousDay}
          className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white bg-gray-800/70 hover:bg-gray-700/80 rounded-xl transition-colors border border-gray-700/50"
          title="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous Day</span>
        </button>

        {!isToday && (
          <button
            onClick={handleGoToToday}
            className="px-3 py-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl transition-colors"
          >
            Today
          </button>
        )}
      </div>

      {/* Date Display */}
      <div className="flex items-center gap-3">
        <div className="text-center">
          <div className="text-base sm:text-lg font-bold text-gray-100 flex items-center justify-center gap-2">
            <span>{formatDisplayDate(selectedDate)}</span>
            {isToday && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                Today
              </span>
            )}
          </div>
        </div>

        {/* Hidden / Quick date input trigger */}
        <div className="relative">
          <label className="p-2 text-gray-400 hover:text-indigo-400 rounded-lg hover:bg-gray-800/70 cursor-pointer flex items-center justify-center transition-colors">
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
          className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white bg-gray-800/70 hover:bg-gray-700/80 rounded-xl transition-colors border border-gray-700/50"
          title="Next Day"
        >
          <span className="hidden sm:inline">Next Day</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
