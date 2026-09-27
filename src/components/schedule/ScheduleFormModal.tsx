'use client';

import React, { useState, useEffect } from 'react';
import {
  ScheduleCategory,
  RepeatType,
  DayOfWeek,
  ScheduleOccurrence,
  ScheduleItem,
  CATEGORY_DETAILS,
} from '@/types/schedule';
import { checkScheduleConflict } from '@/lib/schedule/conflict';
import { getDayOfWeekName } from '@/lib/schedule/date-utils';
import { X, AlertTriangle, Clock, Calendar, Repeat, Sparkles, Info } from 'lucide-react';

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDate: string; // YYYY-MM-DD
  existingSchedules: ScheduleItem[]; // For instant client-side conflict checking
  editingActivity?: ScheduleOccurrence | null;
}

const ALL_DAYS: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export function ScheduleFormModal({
  isOpen,
  onClose,
  onSuccess,
  defaultDate,
  existingSchedules,
  editingActivity,
}: ScheduleFormModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ScheduleCategory>('IMPORTANT_NOT_URGENT');
  const [date, setDate] = useState(defaultDate);
  const [start, setStart] = useState('08:00');
  const [end, setEnd] = useState('10:00');
  const [repeatType, setRepeatType] = useState<RepeatType>('none');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [repeatUntil, setRepeatUntil] = useState<string>('');

  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (editingActivity) {
      setTitle(editingActivity.title);
      setCategory(editingActivity.category);
      setDate(editingActivity.date || defaultDate);
      setStart(editingActivity.start);
      setEnd(editingActivity.end);
      setRepeatType(editingActivity.repeat_type || 'none');
    } else {
      setTitle('');
      setCategory('IMPORTANT_NOT_URGENT');
      setDate(defaultDate);
      setStart('08:00');
      setEnd('10:00');
      setRepeatType('none');
      setSelectedDays([]);
      setRepeatUntil('');
    }
    setConflictWarning(null);
    setApiError(null);
  }, [editingActivity, defaultDate, isOpen]);

  // Client-side real-time conflict checking
  useEffect(() => {
    if (!start || !end || !date || start >= end) {
      setConflictWarning(null);
      return;
    }

    const conflict = checkScheduleConflict(
      {
        id: editingActivity?.id,
        title: title || 'New Activity',
        date,
        start,
        end,
        repeat_type: repeatType,
        repeat_config: {
          interval: 1,
          days: selectedDays.length > 0 ? selectedDays : undefined,
          until: repeatUntil || null,
        },
      },
      existingSchedules,
      editingActivity?.id
    );

    if (conflict.hasConflict && conflict.conflictingItem) {
      setConflictWarning(
        `This activity overlaps with:\n${conflict.conflictingItem.title}\n${conflict.conflictingItem.start}–${conflict.conflictingItem.end}`
      );
    } else {
      setConflictWarning(null);
    }
  }, [title, date, start, end, repeatType, selectedDays, repeatUntil, existingSchedules, editingActivity]);

  if (!isOpen) return null;

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if ((repeatType === 'weekly' || repeatType === 'custom') && selectedDays.length <= 1) {
      try {
        setSelectedDays([getDayOfWeekName(newDate)]);
      } catch {
        // ignore invalid date strings during typing
      }
    }
  };

  const handleRepeatChange = (newType: RepeatType) => {
    setRepeatType(newType);
    if ((newType === 'weekly' || newType === 'custom') && selectedDays.length === 0) {
      try {
        setSelectedDays([getDayOfWeekName(date)]);
      } catch {
        // ignore
      }
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!title.trim()) {
      setApiError('Activity title cannot be empty.');
      return;
    }

    if (start >= end) {
      setApiError('End time must be after start time.');
      return;
    }

    if (conflictWarning) {
      setApiError('Cannot save schedule due to conflict with existing activity.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        category,
        date,
        start,
        end,
        repeat: {
          type: repeatType,
          interval: 1,
          days: selectedDays.length > 0 ? selectedDays : undefined,
          until: repeatUntil || null,
        },
      };

      const url = editingActivity
        ? `/api/schedules/${editingActivity.id}`
        : '/api/schedules';

      const method = editingActivity ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setConflictWarning(data.error?.message || 'Schedule Conflict detected.');
        } else {
          setApiError(data.error?.message || 'Failed to save schedule.');
        }
        return;
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setApiError('Network error or server unavailable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800/50 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-300 dark:border-zinc-800/50 bg-gray-950/50">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              {editingActivity ? 'Edit Activity' : 'Create Activity'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
              Add college task, lecture, or study session
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-3xl hover:bg-zinc-200 hover:dark:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Conflict Warning Box */}
          {conflictWarning && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-red-300 uppercase tracking-wide text-[10px]">
                  Schedule Conflict
                </div>
                <div className="whitespace-pre-line mt-1 text-red-200">
                  {conflictWarning}
                </div>
              </div>
            </div>
          )}

          {/* General API Error */}
          {apiError && (
            <div className="p-3 rounded-3xl bg-red-900/30 border border-red-800 text-red-400 text-xs">
              {apiError}
            </div>
          )}

          {/* Activity Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Activity Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Belajar Next.js / Kuliah Algoritma"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-3xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800/50 text-sm text-zinc-900 dark:text-zinc-100 placeholder-gray-500 focus:outline-none focus:border-[#1E3A8A] focus:dark:border-[#1E3A8A] transition-colors"
            />
          </div>

          {/* Category (Eisenhower Matrix) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Category (Eisenhower Matrix)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ScheduleCategory)}
              className="w-full px-4 py-2.5 rounded-3xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800/50 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#1E3A8A] focus:dark:border-[#1E3A8A] transition-colors"
            >
              <option value="IMPORTANT_URGENT">Important & Urgent (Q1: Do First)</option>
              <option value="IMPORTANT_NOT_URGENT">Important & Not Urgent (Q2: Schedule)</option>
              <option value="NOT_IMPORTANT_URGENT">Not Important & Urgent (Q3: Delegate)</option>
              <option value="NOT_IMPORTANT_NOT_URGENT">Not Important & Not Urgent (Q4: Eliminate)</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-3xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800/50 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#1E3A8A] focus:dark:border-[#1E3A8A] transition-colors"
              />
            </div>
          </div>

          {/* Start and End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full px-4 py-2.5 rounded-3xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800/50 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#1E3A8A] focus:dark:border-[#1E3A8A] transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <input
                type="time"
                required
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full px-4 py-2.5 rounded-3xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800/50 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#1E3A8A] focus:dark:border-[#1E3A8A] transition-colors font-mono"
              />
            </div>
          </div>

          {/* Repeat */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Repeat
            </label>
            <select
              value={repeatType}
              onChange={(e) => handleRepeatChange(e.target.value as RepeatType)}
              className="w-full px-4 py-2.5 rounded-3xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800/50 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#1E3A8A] focus:dark:border-[#1E3A8A] transition-colors"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Every day</option>
              <option value="weekly">Every week</option>
              <option value="monthly">Every month</option>
              <option value="yearly">Every year</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Weekly day checkboxes */}
          {(repeatType === 'weekly' || repeatType === 'custom') && (
            <div className="p-3 rounded-3xl bg-gray-950/60 border border-zinc-300 dark:border-zinc-800/50 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block">
                Repeat on Days:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ALL_DAYS.map((d) => {
                  const isSelected = selectedDays.includes(d);
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={`px-2.5 py-1 text-xs rounded-2xl font-medium transition-colors ${ isSelected ? 'bg-[#1D4ED8] dark:bg-[#1D4ED8] text-zinc-900 dark:text-white font-bold' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 hover:dark:text-zinc-200' }`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  );
                })}
              </div>

              {selectedDays.length > 0 && !selectedDays.includes(getDayOfWeekName(date)) && (
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2 mt-2 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    Tanggal <strong>{date}</strong> adalah hari <strong>{getDayOfWeekName(date)}</strong>. Karena dipilih berulang pada hari <strong>{selectedDays.join(', ')}</strong>, jadwal ini baru akan muncul di tanggal <strong>{selectedDays.join(', ')}</strong> berikutnya dan <strong>tidak tampil pada tanggal {date}</strong>.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Repeat Until Date */}
          {repeatType !== 'none' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                Repeat Until (Optional)
              </label>
              <input
                type="date"
                value={repeatUntil}
                onChange={(e) => setRepeatUntil(e.target.value)}
                className="w-full px-4 py-2 rounded-3xl bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800/50 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#1E3A8A] focus:dark:border-[#1E3A8A]"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-300 dark:border-zinc-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-3xl hover:bg-zinc-200 hover:dark:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Boolean(conflictWarning)}
              className="px-5 py-2.5 text-xs font-bold text-zinc-900 dark:text-white bg-[#1D4ED8] dark:bg-[#1D4ED8] hover:bg-[#1E3A8A] hover:dark:bg-[#1E3A8A] rounded-3xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : editingActivity ? 'Save Changes' : 'Create Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
