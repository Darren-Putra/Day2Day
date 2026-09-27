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
      <div className="p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md relative overflow-hidden group hover:border-[#1E3A8A]/40 hover:dark:border-[#1E3A8A]/60 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-500">Total Activities</span>
          <div className="w-8 h-8 rounded-2xl bg-[#1E3A8A]/10 dark:bg-[#1E3A8A]/25 border border-[#1E3A8A]/30 dark:border-[#1E3A8A]/60 flex items-center justify-center text-[#3B82F6] dark:text-[#3B82F6]">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {summary.activity_count}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">scheduled</span>
        </div>
        <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-500">
          Planned for this date
        </div>
      </div>

      {/* 2. Total Scheduled Time */}
      <div className="p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md relative overflow-hidden group hover:border-[#1E3A8A]/40 hover:dark:border-[#1E3A8A]/60 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-500">Scheduled Time</span>
          <div className="w-8 h-8 rounded-2xl bg-[#1E3A8A]/10 dark:bg-[#1E3A8A]/25 border border-[#1E3A8A]/30 dark:border-[#1E3A8A]/60 flex items-center justify-center text-[#3B82F6] dark:text-[#3B82F6]">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#3B82F6] dark:text-[#3B82F6] tracking-tight">
            {formatDuration(summary.scheduled_minutes)}
          </span>
          <span className="text-xs font-mono text-indigo-300/80">
            ({summary.scheduled_percentage}%)
          </span>
        </div>
        <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-500">
          of 24-hour day
        </div>
      </div>

      {/* 3. Total Free Time */}
      <div className="p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-500">Free Time</span>
          <div className="w-8 h-8 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[#3B82F6] dark:text-[#3B82F6]">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#3B82F6] dark:text-[#3B82F6] tracking-tight">
            {formatDuration(summary.free_minutes)}
          </span>
          <span className="text-xs font-mono text-cyan-300/80">
            ({summary.free_percentage}%)
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-500">Available time</span>
          {onOpenFreeTimeModal && (
            <button
              onClick={onOpenFreeTimeModal}
              className="text-[11px] text-[#3B82F6] dark:text-[#3B82F6] hover:text-cyan-300 underline underline-offset-2 font-medium"
            >
              View slots
            </button>
          )}
        </div>
      </div>

      {/* 4. 24h Day Allocation */}
      <div className="p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md relative overflow-hidden group hover:border-zinc-300 hover:dark:border-zinc-800/50 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-500">Day Breakdown</span>
          <div className="w-8 h-8 rounded-2xl bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-800/50 flex items-center justify-center text-zinc-500 dark:text-zinc-500">
            <PieChart className="w-4 h-4" />
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-[#1E3A8A] dark:bg-[#1E3A8A] h-full transition-all duration-500"
              style={{ width: `${summary.scheduled_percentage}%` }}
              title={`Scheduled: ${summary.scheduled_percentage}%`}
            />
            <div
              className="bg-cyan-500 h-full transition-all duration-500 opacity-80"
              style={{ width: `${summary.free_percentage}%` }}
              title={`Free: ${summary.free_percentage}%`}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1E3A8A] dark:bg-[#1E3A8A] inline-block" />
              Scheduled ({summary.scheduled_percentage}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
              Free ({summary.free_percentage}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
