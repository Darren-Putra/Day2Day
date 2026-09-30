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
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/50 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#3B82F6] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-medium text-white tracking-tight">
                Available Free Time Slots
              </h3>
              <p className="text-[11px] uppercase tracking-widest font-medium text-zinc-500 mt-0.5">{date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800/50 transition-colors duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slot List */}
        <div className="p-6 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {slots.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm font-light">
              No free time slots available on this day.
            </div>
          ) : (
            slots.map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-900/60 hover:border-cyan-500/40 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-cyan-500/10 text-[#3B82F6] flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium font-mono text-white tracking-tight">
                      {slot.start} – {slot.end}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest font-medium text-[#3B82F6] font-mono mt-0.5">
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E3A8A]/25 hover:bg-[#1E3A8A] text-[#3B82F6] hover:text-white text-xs font-medium border border-[#1E3A8A]/60 transition-all duration-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Fill Slot</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-zinc-900/20 border-t border-zinc-800/50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 text-[11px] uppercase tracking-widest font-medium text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800/50 transition-colors duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
