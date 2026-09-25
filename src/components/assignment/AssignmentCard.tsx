'use client';

import React from 'react';
import { AssignmentItem } from '@/types/assignment';
import { CATEGORY_DETAILS } from '@/types/schedule';
import { formatDuration } from '@/lib/schedule/date-utils';
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Edit2,
  Trash2,
  CalendarPlus,
} from 'lucide-react';
import Link from 'next/link';

interface AssignmentCardProps {
  assignment: AssignmentItem;
  onToggleStatus: (id: string, newStatus: 'PENDING' | 'COMPLETED') => void;
  onEdit: (assignment: AssignmentItem) => void;
  onDelete: (id: string) => void;
}

export function AssignmentCard({
  assignment,
  onToggleStatus,
  onEdit,
  onDelete,
}: AssignmentCardProps) {
  const cat = CATEGORY_DETAILS[assignment.category] || CATEGORY_DETAILS.IMPORTANT_NOT_URGENT;
  const isCompleted = assignment.status === 'COMPLETED';
  const isOverdue = assignment.is_overdue && !isCompleted;

  // Deadline display string
  const renderDueLabel = () => {
    if (isCompleted) {
      return (
        <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Completed</span>
        </span>
      );
    }

    if (isOverdue) {
      const days = Math.abs(assignment.days_remaining ?? 0);
      return (
        <span className="text-[11px] text-red-400 font-bold flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span>Overdue by {days === 0 ? 'today' : `${days} day(s)`} ({assignment.due_date} {assignment.due_time})</span>
        </span>
      );
    }

    const days = assignment.days_remaining ?? 0;
    if (days === 0) {
      return (
        <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Due Today at {assignment.due_time}</span>
        </span>
      );
    }
    if (days === 1) {
      return (
        <span className="text-[11px] text-cyan-400 font-medium flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Due Tomorrow at {assignment.due_time}</span>
        </span>
      );
    }

    return (
      <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
        <Calendar className="w-3.5 h-3.5 text-gray-400" />
        <span>Due {assignment.due_date} • {assignment.due_time} ({days} days left)</span>
      </span>
    );
  };

  return (
    <div
      className={`relative p-5 rounded-2xl border transition-all duration-200 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
        isCompleted
          ? 'bg-gray-950/40 border-gray-800/50 opacity-60'
          : isOverdue
          ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/50'
          : 'bg-gray-900/60 border-gray-800/80 hover:border-indigo-500/40'
      }`}
    >
      {/* Category accent bar on the left */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
        style={{ backgroundColor: isCompleted ? '#4b5563' : isOverdue ? '#ef4444' : cat.color }}
      />

      <div className="flex items-start gap-3.5 pl-2 min-w-0 flex-1">
        {/* Checkbox toggle */}
        <button
          onClick={() =>
            onToggleStatus(assignment.id, isCompleted ? 'PENDING' : 'COMPLETED')
          }
          className="mt-0.5 text-gray-400 hover:text-emerald-400 transition-colors flex-shrink-0"
          title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Circle className="w-5 h-5 text-gray-500 hover:text-gray-300" />
          )}
        </button>

        {/* Content details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              className={`text-sm sm:text-base font-semibold truncate ${
                isCompleted ? 'text-gray-400 line-through' : 'text-gray-100'
              }`}
            >
              {assignment.title}
            </h4>

            {assignment.course_name && (
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {assignment.course_name}
              </span>
            )}
          </div>

          {/* Deadline, Category, and Estimated Duration */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {renderDueLabel()}

            <span className="text-gray-600">•</span>

            {/* Estimated work duration */}
            <span className="text-[11px] font-mono text-indigo-300/90 flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>Est. {formatDuration(assignment.estimated_duration_minutes)}</span>
            </span>

            <span className="text-gray-600">•</span>

            {/* Eisenhower Category */}
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cat.badgeBg}`}
            >
              {cat.label}
            </span>
          </div>

          {assignment.notes && (
            <p className="text-xs text-gray-400 mt-2 line-clamp-1 italic">
              {assignment.notes}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
        {!isCompleted && (
          <Link
            href="/schedule"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/30 transition-all"
            title="Schedule study block for this task in 24h schedule"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Schedule Work</span>
          </Link>
        )}

        <button
          onClick={() => onEdit(assignment)}
          className="p-2 text-gray-400 hover:text-indigo-400 rounded-lg hover:bg-indigo-500/10 transition-colors"
          title="Edit assignment"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(assignment.id)}
          className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
          title="Delete assignment"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
