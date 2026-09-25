'use client';

import React from 'react';
import { FreeTimeSlot } from '@/types/schedule';
import { formatDuration } from '@/lib/schedule/date-utils';
import { X, Sparkles, Plus, Clock } from 'lucide-react';

interface FreeTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: FreeTimeSlot[];
  date: string;
  onSelectSlot?: (slot: FreeTimeSlot) => void;
}

export function FreeTimeModal({
  isOpen,
  onClose,
  slots,
  date,
  onSelectSlot,
}: FreeTimeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 bg-gray-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Available Free Time Slots
              </h3>
              <p className="text-xs text-gray-400">{date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slot List */}
        <div className="p-6 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {slots.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No free time slots available on this day.
            </div>
          ) : (
            slots.map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-950/70 border border-gray-800/80 hover:border-cyan-500/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold font-mono text-gray-100">
                      {slot.start} – {slot.end}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {formatDuration(slot.duration_minutes)} free
                    </div>
                  </div>
                </div>

                {onSelectSlot && (
                  <button
                    onClick={() => {
                      onSelectSlot(slot);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/30 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Fill Slot</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-950/40 border-t border-gray-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/60 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
