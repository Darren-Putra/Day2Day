'use client';

import React, { useState, useEffect } from 'react';
import { AssignmentItem } from '@/types/assignment';
import { ScheduleCategory } from '@/types/schedule';
import { X, BookOpen, Clock, Calendar, AlertCircle } from 'lucide-react';
import { getTodayInTimezone } from '@/lib/schedule/date-utils';

interface AssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingAssignment?: AssignmentItem | null;
}

export function AssignmentFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingAssignment,
}: AssignmentFormModalProps) {
  const [title, setTitle] = useState('');
  const [courseName, setCourseName] = useState('');
  const [dueDate, setDueDate] = useState(() => getTodayInTimezone());
  const [dueTime, setDueTime] = useState('23:59');
  const [estimatedHours, setEstimatedHours] = useState('2');
  const [category, setCategory] = useState<ScheduleCategory>('IMPORTANT_URGENT');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingAssignment) {
      setTitle(editingAssignment.title);
      setCourseName(editingAssignment.course_name || '');
      setDueDate(editingAssignment.due_date);
      setDueTime(editingAssignment.due_time || '23:59');
      setEstimatedHours(
        (editingAssignment.estimated_duration_minutes / 60).toString()
      );
      setCategory(editingAssignment.category);
      setNotes(editingAssignment.notes || '');
    } else {
      setTitle('');
      setCourseName('');
      setDueDate(getTodayInTimezone());
      setDueTime('23:59');
      setEstimatedHours('2');
      setCategory('IMPORTANT_URGENT');
      setNotes('');
    }
    setErrorMessage(null);
  }, [editingAssignment, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Assignment title cannot be empty.');
      return;
    }

    const estimatedMinutes = Math.round(parseFloat(estimatedHours || '2') * 60);

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        title: title.trim(),
        course_name: courseName.trim() || null,
        due_date: dueDate,
        due_time: dueTime,
        estimated_duration_minutes: estimatedMinutes,
        category,
        notes: notes.trim() || null,
      };

      const url = editingAssignment
        ? `/api/assignments/${editingAssignment.id}`
        : '/api/assignments';

      const method = editingAssignment ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error?.message || 'Failed to save assignment.');
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setErrorMessage('Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/40">
          <div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white tracking-tight">
              {editingAssignment ? 'Edit Assignment' : 'New Assignment / Deadline'}
            </h3>
            <p className="text-[11px] uppercase tracking-widest font-medium text-zinc-600 dark:text-zinc-400 mt-1">
              Track course deliverables, due dates, and work estimates
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs font-light flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Assignment Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Makalah Etika Profesi / Laporan Praktikum Lab 3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          {/* Course Name */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Course / Subject (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Algoritma & Pemrograman, Kalkulus II"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* Due Date & Due Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Due Date (Tenggat)
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Due Time
              </label>
              <input
                type="time"
                required
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#3B82F6]/10 font-mono transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* Estimated Work Duration */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Estimated Work Duration</span>
              <span className="text-[11px] text-[#3B82F6] font-mono">
                {parseFloat(estimatedHours || '0') * 60} minutes
              </span>
            </label>
            <select
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all [color-scheme:light] dark:[color-scheme:dark]"
            >
              <option value="0.5">30 minutes (Quick review / quiz)</option>
              <option value="1">1 hour (Short homework / questions)</option>
              <option value="2">2 hours (Standard problem set / essay)</option>
              <option value="3">3 hours (In-depth paper / analysis)</option>
              <option value="4">4 hours (Extensive lab report / code)</option>
              <option value="6">6 hours (Major course project milestone)</option>
            </select>
          </div>

          {/* Priority (Eisenhower Matrix) */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Priority Quadrant
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ScheduleCategory)}
              className="w-full px-4 py-2.5 rounded-full bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all [color-scheme:light] dark:[color-scheme:dark]"
            >
              <option value="IMPORTANT_URGENT">Important & Urgent (Q1: Do First)</option>
              <option value="IMPORTANT_NOT_URGENT">Important & Not Urgent (Q2: Plan Ahead)</option>
              <option value="NOT_IMPORTANT_URGENT">Not Important & Urgent (Q3: Delegate / Quick)</option>
              <option value="NOT_IMPORTANT_NOT_URGENT">Not Important & Not Urgent (Q4: Low Priority)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Notes & Submission Details (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Upload PDF to Canvas, format APA 7th, max 5 pages..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all resize-none [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-medium text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800/50 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-[#1E40AF] rounded-full shadow-lg shadow-blue-900/20 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : editingAssignment ? 'Update Assignment' : 'Add Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
