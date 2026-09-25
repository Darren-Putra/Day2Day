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
      <div className="p-4 rounded-2xl bg-gray-900/50 border border-gray-800/80 backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">Total Activities</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">
            {summary.activity_count}
          </span>
          <span className="text-xs text-gray-400 font-medium">scheduled</span>
        </div>
        <div className="mt-2 text-[11px] text-gray-400">
          Planned for this date
        </div>
      </div>

      {/* 2. Total Scheduled Time */}
      <div className="p-4 rounded-2xl bg-gray-900/50 border border-gray-800/80 backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">Scheduled Time</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-indigo-400 tracking-tight">
            {formatDuration(summary.scheduled_minutes)}
          </span>
          <span className="text-xs font-mono text-indigo-300/80">
            ({summary.scheduled_percentage}%)
          </span>
        </div>
        <div className="mt-2 text-[11px] text-gray-400">
          of 24-hour day
        </div>
      </div>

      {/* 3. Total Free Time */}
      <div className="p-4 rounded-2xl bg-gray-900/50 border border-gray-800/80 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">Free Time</span>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-cyan-400 tracking-tight">
            {formatDuration(summary.free_minutes)}
          </span>
          <span className="text-xs font-mono text-cyan-300/80">
            ({summary.free_percentage}%)
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">Available time</span>
          {onOpenFreeTimeModal && (
            <button
              onClick={onOpenFreeTimeModal}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-medium"
            >
              View slots
            </button>
          )}
        </div>
      </div>

      {/* 4. 24h Day Allocation */}
      <div className="p-4 rounded-2xl bg-gray-900/50 border border-gray-800/80 backdrop-blur-md relative overflow-hidden group hover:border-gray-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">Day Breakdown</span>
          <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400">
            <PieChart className="w-4 h-4" />
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-indigo-500 h-full transition-all duration-500"
              style={{ width: `${summary.scheduled_percentage}%` }}
              title={`Scheduled: ${summary.scheduled_percentage}%`}
            />
            <div
              className="bg-cyan-500 h-full transition-all duration-500 opacity-80"
              style={{ width: `${summary.free_percentage}%` }}
              title={`Free: ${summary.free_percentage}%`}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
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
