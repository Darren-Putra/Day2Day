'use client';

import React, { useState } from 'react';
import { ScheduleOccurrence } from '@/types/schedule';
import { formatDuration } from '@/lib/schedule/date-utils';
import { Sparkles } from 'lucide-react';

interface SchedulePieChartProps {
  occurrences: ScheduleOccurrence[];
  totalMinutes?: number; // 1440
}

interface ChartSlice {
  id: string;
  title: string;
  duration_minutes: number;
  percentage: number;
  color: string;
  isFreeTime: boolean;
  timeRange?: string;
  category?: string;
}

const COLOR_PALETTE = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#f43f5e', // Rose
];

export function SchedulePieChart({
  occurrences,
  totalMinutes = 1440,
}: SchedulePieChartProps) {
  const [hoveredSlice, setHoveredSlice] = useState<ChartSlice | null>(null);

  // 1. Calculate total scheduled minutes
  const totalScheduledMinutes = occurrences.reduce(
    (acc, cur) => acc + cur.duration_minutes,
    0
  );

  const freeMinutes = Math.max(0, totalMinutes - totalScheduledMinutes);

  // 2. Build slices array
  const slices: ChartSlice[] = occurrences.map((item, index) => {
    const percentage = Number(
      ((item.duration_minutes / totalMinutes) * 100).toFixed(2)
    );
    return {
      id: item.id,
      title: item.title,
      duration_minutes: item.duration_minutes,
      percentage,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
      isFreeTime: false,
      timeRange: `${item.start}–${item.end}`,
      category: item.category,
    };
  });

  // Add Free Time slice
  if (freeMinutes > 0) {
    const freePercentage = Number(
      ((freeMinutes / totalMinutes) * 100).toFixed(2)
    );
    slices.push({
      id: 'free-time-slice',
      title: 'Free Time',
      duration_minutes: freeMinutes,
      percentage: freePercentage,
      color: '#0891b2', // Cyan-600
      isFreeTime: true,
    });
  }

  // 3. SVG Donut Arc calculations
  const size = 260;
  const hoverGrow = 6;
  const padding = hoverGrow; // extra space so hover stroke is never clipped
  const paddedSize = size + padding * 2;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-md flex flex-col md:flex-row items-center gap-8 transition-colors duration-300">
      {/* Donut Chart Visual */}
      <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: paddedSize, height: paddedSize }}>
        <svg
          width={paddedSize}
          height={paddedSize}
          viewBox={`${-padding} ${-padding} ${paddedSize} ${paddedSize}`}
          className="transform -rotate-90"
          style={{ overflow: 'visible' }}
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(31, 41, 55, 0.6)"
            strokeWidth={strokeWidth}
          />

          {slices.map((slice) => {
            const strokeDasharray = `${ (slice.percentage / 100) * circumference } ${circumference}`;
            const strokeDashoffset = `${ -(accumulatedPercentage / 100) * circumference }`;
            accumulatedPercentage += slice.percentage;

            const isHovered = hoveredSlice?.id === slice.id;

            return (
              <circle
                key={slice.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + hoverGrow : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSlice(slice)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            );
          })}
        </svg>

        {/* Center label inside Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {hoveredSlice ? (
            <div className="animate-in fade-in duration-150">
              <span className="text-[10px] uppercase tracking-widest font-medium text-zinc-500 truncate block max-w-[120px]">
                {hoveredSlice.title}
              </span>
              <span className="text-3xl font-medium text-zinc-900 dark:text-white font-mono mt-1">
                {hoveredSlice.percentage}%
              </span>
              <span className="text-xs text-zinc-400 block font-mono font-light mt-1">
                {formatDuration(hoveredSlice.duration_minutes)}
              </span>
            </div>
          ) : (
            <div>
              <span className="text-[10px] uppercase tracking-widest font-medium text-zinc-500 block">
                24 Hours
              </span>
              <span className="text-3xl font-medium text-zinc-900 dark:text-white font-mono mt-1">
                {((freeMinutes / totalMinutes) * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] uppercase tracking-widest font-medium text-[#3B82F6] flex items-center justify-center gap-1 mt-1">
                <Sparkles className="w-3 h-3" />
                Free Time
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Legend & Details */}
      <div className="flex-1 w-full space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800/50">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-white tracking-tight">
            24-Hour Time Distribution
          </h3>
          <span className="text-[10px] uppercase tracking-widest font-medium text-zinc-500">1440 min (100%)</span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {slices.map((slice) => (
            <div
              key={slice.id}
              onMouseEnter={() => setHoveredSlice(slice)}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`flex items-center justify-between p-2 rounded-2xl transition-all duration-300 cursor-pointer ${ hoveredSlice?.id === slice.id ? 'bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900/40 border border-transparent' }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200 truncate group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    {slice.title}
                  </div>
                  {slice.timeRange && (
                    <div className="text-[10px] uppercase tracking-widest font-medium text-zinc-500 font-mono mt-0.5">
                      {slice.timeRange}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-3">
                <div className="text-xs font-medium font-mono text-zinc-700 dark:text-zinc-200">
                  {formatDuration(slice.duration_minutes)}
                </div>
                <div className="text-[10px] font-medium font-mono text-[#3B82F6] mt-0.5">
                  {slice.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
