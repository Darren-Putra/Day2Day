'use client';

import React from 'react';
import { DailySummary } from '@/types/schedule';
import { formatDuration } from '@/lib/schedule/date-utils';
import { CalendarCheck, Clock, Sparkles, PieChart } from 'lucide-react';

interface ScheduleSummaryProps {
  summary: DailySummary;
  onOpenFreeTimeModal?: () => void;
}

export function ScheduleSummary({ summary, onOpenFreeTimeModal }: ScheduleSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Activities Count */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md relative overflow-hidden group hover:bg-white dark:hover:bg-zinc-900/50 hover:border-blue-200 dark:hover:border-[#1E3A8A]/60 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-widest font-medium text-zinc-500">Total Activities</span>
          <div className="w-8 h-8 rounded-full bg-[#1E3A8A]/25 border border-[#1E3A8A]/60 flex items-center justify-center text-[#3B82F6] transition-transform duration-300 group-hover:scale-110">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-medium text-zinc-900 dark:text-white tracking-tight">
            {summary.activity_count}
          </span>
          <span className="text-[11px] uppercase tracking-widest font-medium text-zinc-500">scheduled</span>
        </div>
        <div className="mt-2 text-xs font-light text-zinc-400">
          Planned for this date
        </div>
      </div>

      {/* 2. Total Scheduled Time */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md relative overflow-hidden group hover:bg-white dark:hover:bg-zinc-900/50 hover:border-blue-200 dark:hover:border-[#1E3A8A]/60 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-widest font-medium text-[#3B82F6]">Scheduled Time</span>
          <div className="w-8 h-8 rounded-full bg-[#1E3A8A]/25 border border-[#1E3A8A]/60 flex items-center justify-center text-[#3B82F6] transition-transform duration-300 group-hover:scale-110">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-medium text-zinc-900 dark:text-white tracking-tight font-mono">
            {formatDuration(summary.scheduled_minutes)}
          </span>
          <span className="text-xs font-mono text-[#3B82F6]">
            ({summary.scheduled_percentage}%)
          </span>
        </div>
        <div className="mt-2 text-xs font-light text-zinc-400">
          of 24-hour day
        </div>
      </div>

      {/* 3. Total Free Time */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md relative overflow-hidden group hover:bg-white dark:hover:bg-zinc-900/50 hover:border-cyan-400/40 dark:hover:border-cyan-500/40 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-widest font-medium text-cyan-600 dark:text-cyan-300">Free Time</span>
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 transition-transform duration-300 group-hover:scale-110">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-medium text-zinc-900 dark:text-white tracking-tight font-mono">
            {formatDuration(summary.free_minutes)}
          </span>
          <span className="text-xs font-mono text-cyan-400">
            ({summary.free_percentage}%)
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-light text-zinc-400">Available time</span>
          {onOpenFreeTimeModal && (
            <button
              onClick={onOpenFreeTimeModal}
              className="text-[10px] uppercase tracking-widest text-[#3B82F6] hover:text-cyan-300 font-medium transition-colors duration-300"
            >
              View slots
            </button>
          )}
        </div>
      </div>

      {/* 4. 24h Day Allocation */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md relative overflow-hidden group hover:bg-white dark:hover:bg-zinc-900/50 hover:border-blue-200 dark:hover:border-[#1E3A8A]/60 transition-all duration-300">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-widest font-medium text-zinc-500">Day Breakdown</span>
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 transition-transform duration-300 group-hover:scale-110">
            <PieChart className="w-4 h-4" />
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-zinc-200 dark:bg-zinc-900 h-2.5 rounded-full overflow-hidden flex border border-zinc-300 dark:border-zinc-800/50">
            <div
              className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] h-full transition-all duration-500"
              style={{ width: `${summary.scheduled_percentage}%` }}
              title={`Scheduled: ${summary.scheduled_percentage}%`}
            />
            <div
              className="bg-zinc-300 dark:bg-zinc-800 h-full transition-all duration-500"
              style={{ width: `${summary.free_percentage}%` }}
              title={`Free: ${summary.free_percentage}%`}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-widest font-medium text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] inline-block" />
              Scheduled ({summary.scheduled_percentage}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-800 inline-block" />
              Free ({summary.free_percentage}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
