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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 bg-gray-950/50">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {editingAssignment ? 'Edit Assignment' : 'New Assignment / Deadline'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Track course deliverables, due dates, and work estimates
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Assignment Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Makalah Etika Profesi / Laporan Praktikum Lab 3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Course Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Course / Subject (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Algoritma & Pemrograman, Kalkulus II"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Due Date & Due Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Due Date (Tenggat)
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Due Time
              </label>
              <input
                type="time"
                required
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
              />
            </div>
          </div>

          {/* Estimated Work Duration */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Estimated Work Duration</span>
              <span className="text-[11px] text-indigo-400 font-mono">
                {parseFloat(estimatedHours || '0') * 60} minutes
              </span>
            </label>
            <select
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors"
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
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Priority Quadrant
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ScheduleCategory)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="IMPORTANT_URGENT">Important & Urgent (Q1: Do First)</option>
              <option value="IMPORTANT_NOT_URGENT">Important & Not Urgent (Q2: Plan Ahead)</option>
              <option value="NOT_IMPORTANT_URGENT">Not Important & Urgent (Q3: Delegate / Quick)</option>
              <option value="NOT_IMPORTANT_NOT_URGENT">Not Important & Not Urgent (Q4: Low Priority)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Notes & Submission Details (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Upload PDF to Canvas, format APA 7th, max 5 pages..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingAssignment ? 'Update Assignment' : 'Add Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
