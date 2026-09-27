'use client';

import React from 'react';
import { ScheduleOccurrence } from '@/types/schedule';
import { ScheduleCard } from './ScheduleCard';
import { Plus, CalendarX, Sparkles } from 'lucide-react';

interface ScheduleListProps {
  activities: ScheduleOccurrence[];
  isLoading?: boolean;
  onAddClick: () => void;
  onEditActivity: (activity: ScheduleOccurrence) => void;
  onDeleteActivity: (id: string) => void;
}

export function ScheduleList({
  activities,
  isLoading = false,
  onAddClick,
  onEditActivity,
  onDeleteActivity,
}: ScheduleListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-20 rounded-2xl bg-white/50 dark:bg-zinc-900/20 border border-gray-800/60 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 px-6 rounded-2xl bg-white/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-[#3B82F6] dark:text-[#3B82F6] mx-auto flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/10">
          <CalendarX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
          No activities scheduled.
        </h3>
        <p className="text-sm text-cyan-400/90 font-medium mt-1 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Your entire day is free.
        </p>

        <div className="mt-6">
          <button
            onClick={onAddClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-3xl bg-[#1D4ED8] dark:bg-[#1D4ED8] hover:bg-[#1E3A8A] hover:dark:bg-[#1E3A8A] text-zinc-900 dark:text-white font-medium text-xs shadow-lg shadow-indigo-600/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((item) => (
        <ScheduleCard
          key={item.id}
          activity={item}
          onEdit={onEditActivity}
          onDelete={onDeleteActivity}
        />
      ))}
    </div>
  );
}
