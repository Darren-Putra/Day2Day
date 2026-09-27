'use client';

import React from 'react';
import { ScheduleOccurrence, CATEGORY_DETAILS } from '@/types/schedule';
import { formatDuration } from '@/lib/schedule/date-utils';
import { Clock, Repeat, Edit2, Trash2 } from 'lucide-react';

interface ScheduleCardProps {
  activity: ScheduleOccurrence;
  onEdit?: (activity: ScheduleOccurrence) => void;
  onDelete?: (id: string) => void;
}

export function ScheduleCard({ activity, onEdit, onDelete }: ScheduleCardProps) {
  const cat = CATEGORY_DETAILS[activity.category] || CATEGORY_DETAILS.IMPORTANT_NOT_URGENT;

  const repeatLabels: Record<string, string> = {
    none: '',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    custom: 'Custom',
  };

  const repeatBadge = repeatLabels[activity.repeat_type];

  return (
    <div className="relative group p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 hover:border-gray-700/90 transition-all duration-200 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Category accent bar on the left */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
        style={{ backgroundColor: cat.color }}
      />

      <div className="flex items-start sm:items-center gap-4 pl-2 min-w-0">
        {/* Time block */}
        <div className="flex-shrink-0 text-left sm:text-center w-28">
          <div className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 tracking-tight">
            {activity.start} – {activity.end}
          </div>
          <div className="text-xs font-mono text-zinc-500 dark:text-zinc-500 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-zinc-500 dark:text-zinc-500" />
            <span>{formatDuration(activity.duration_minutes)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h4 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {activity.title}
          </h4>

          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {/* Eisenhower Category Badge */}
            <span
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${cat.badgeBg}`}
            >
              {cat.label}
            </span>

            {/* Recurrence tag if repeating */}
            {repeatBadge && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1E3A8A]/10 dark:bg-[#1E3A8A]/25 text-[#3B82F6] dark:text-[#3B82F6] border border-[#1E3A8A]/30 dark:border-[#1E3A8A]/60 flex items-center gap-1">
                <Repeat className="w-2.5 h-2.5" />
                {repeatBadge}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 self-end sm:self-center">
        {onEdit && (
          <button
            onClick={() => onEdit(activity)}
            className="p-2 text-zinc-500 dark:text-zinc-500 hover:text-[#3B82F6] hover:dark:text-[#3B82F6] rounded-2xl hover:bg-[#1E3A8A]/10 hover:dark:bg-[#1E3A8A]/25 transition-colors"
            title="Edit activity"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(activity.id)}
            className="p-2 text-zinc-500 dark:text-zinc-500 hover:text-red-400 rounded-2xl hover:bg-red-500/10 transition-colors"
            title="Delete activity"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
