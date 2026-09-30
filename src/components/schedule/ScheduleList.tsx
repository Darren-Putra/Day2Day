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
            className="h-24 rounded-2xl bg-zinc-900/20 border border-zinc-800/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 px-6 rounded-2xl bg-zinc-900/20 border border-zinc-800/50 backdrop-blur-md">
        <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A]/10 border border-[#1E3A8A]/30 text-[#3B82F6] mx-auto flex items-center justify-center mb-4">
          <CalendarX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-medium text-white tracking-tight">
          No activities scheduled.
        </h3>
        <p className="text-xs font-light text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Your entire day is free.
        </p>

        <div className="mt-6">
          <button
            onClick={onAddClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-medium text-xs shadow-xl shadow-blue-900/20 active:scale-95 transition-all duration-300"
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
