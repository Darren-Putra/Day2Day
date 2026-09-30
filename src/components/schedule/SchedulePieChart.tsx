'use client';

import React, { useState } from 'react';
import { ScheduleOccurrence } from '@/types/schedule';
import { formatDuration } from '@/lib/schedule/date-utils';
import { Sparkles, Clock } from 'lucide-react';

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

// A more premium color palette: vibrant accents that look great in both dark and light mode
const COLOR_PALETTE = [
  '#3b82f6', // Blue 500
  '#8b5cf6', // Violet 500
  '#ec4899', // Pink 500
  '#f43f5e', // Rose 500
  '#f59e0b', // Amber 500
  '#10b981', // Emerald 500
  '#06b6d4', // Cyan 500
  '#6366f1', // Indigo 500
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
      timeRange: `${item.start} - ${item.end}`,
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
      color: '#1e293b', // darker/muted for free time. Handled with currentColor below.
      isFreeTime: true,
    });
  }

  // 3. SVG Donut Arc calculations
  const size = 320; // slightly larger
  const strokeWidth = 28; // slightly thinner for elegance
  const hoverGrow = 8;
  const padding = hoverGrow + 16;
  const paddedSize = size + padding * 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div className="p-6 sm:p-8 rounded-[2rem] bg-white/60 dark:bg-[#0a0a0a]/60 border border-zinc-200/80 dark:border-zinc-800/60 backdrop-blur-xl flex flex-col lg:flex-row items-center gap-10 lg:gap-16 transition-colors duration-500 shadow-sm dark:shadow-2xl">
      {/* Donut Chart Visual */}
      <div 
        className="relative flex-shrink-0 flex items-center justify-center group" 
        style={{ width: paddedSize, height: paddedSize }}
      >
        {/* Decorative background glow behind the chart */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-full blur-3xl -z-10 transition-opacity duration-700 opacity-50 group-hover:opacity-100" />
        
        <svg
          width={paddedSize}
          height={paddedSize}
          viewBox={`${-padding} ${-padding} ${paddedSize} ${paddedSize}`}
          className="transform -rotate-90 drop-shadow-sm dark:drop-shadow-none"
          style={{ overflow: 'visible' }}
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-zinc-100 dark:text-zinc-800/50 transition-colors duration-500"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {slices.map((slice) => {
            // Create a small gap by reducing the slice's visual length
            const gap = 0.5; // 0.5% gap
            const visualPercentage = Math.max(0, slice.percentage - gap);
            const strokeDasharray = `${(visualPercentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = `${-(accumulatedPercentage / 100) * circumference}`;
            accumulatedPercentage += slice.percentage;

            const isHovered = hoveredSlice?.id === slice.id;

            return (
              <circle
                key={slice.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.isFreeTime ? "currentColor" : slice.color}
                className={`${slice.isFreeTime ? "text-zinc-200 dark:text-zinc-800" : ""} transition-all duration-300 ease-out cursor-pointer origin-center`}
                strokeWidth={isHovered ? strokeWidth + hoverGrow : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                onMouseEnter={() => setHoveredSlice(slice)}
                onMouseLeave={() => setHoveredSlice(null)}
                style={{
                  filter: isHovered && !slice.isFreeTime ? `drop-shadow(0 0 10px ${slice.color}60)` : 'none',
                  transform: isHovered ? `scale(1.02)` : 'scale(1)',
                }}
              />
            );
          })}
        </svg>

        {/* Center label inside Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
          <div className={`transition-all duration-300 absolute flex flex-col items-center justify-center ${hoveredSlice ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {hoveredSlice && (
              <>
                <div 
                  className="w-3.5 h-3.5 rounded-full mb-3" 
                  style={{ backgroundColor: hoveredSlice.isFreeTime ? '#a1a1aa' : hoveredSlice.color }} 
                />
                <span className="text-[11px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400 truncate block max-w-[150px] mb-1">
                  {hoveredSlice.title}
                </span>
                <span className="text-5xl font-semibold text-zinc-900 dark:text-white tracking-tighter">
                  {hoveredSlice.percentage}%
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium mt-2 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-full">
                  {formatDuration(hoveredSlice.duration_minutes)}
                </span>
              </>
            )}
          </div>
          
          <div className={`transition-all duration-300 absolute flex flex-col items-center justify-center ${hoveredSlice ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}>
            <span className="text-[11px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400 block mb-2">
              Daily Balance
            </span>
            <span className="text-5xl font-semibold text-zinc-900 dark:text-white tracking-tighter">
              {((freeMinutes / totalMinutes) * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#3B82F6] flex items-center justify-center gap-1.5 mt-3 bg-blue-50 dark:bg-blue-900/20 px-3.5 py-1.5 rounded-full border border-blue-100 dark:border-blue-800/30">
              <Sparkles className="w-3.5 h-3.5" />
              Free Time
            </span>
          </div>
        </div>
      </div>

      {/* Legend & Details */}
      <div className="flex-1 w-full flex flex-col h-full lg:max-h-[380px]">
        <div className="flex items-end justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800/60 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">
              Time Distribution
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              A breakdown of your 24-hour day
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
              1440 min
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-2.5">
          {slices.map((slice) => {
            const isHovered = hoveredSlice?.id === slice.id;
            
            return (
              <div
                key={slice.id}
                onMouseEnter={() => setHoveredSlice(slice)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`group flex items-center justify-between p-3 sm:p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                  isHovered 
                    ? 'bg-zinc-50 dark:bg-zinc-800/80 shadow-sm border border-zinc-200 dark:border-zinc-700' 
                    : 'bg-transparent hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div 
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
                    style={{ 
                      backgroundColor: slice.isFreeTime ? 'transparent' : `${slice.color}15`,
                      border: slice.isFreeTime ? '1px dashed currentColor' : 'none',
                      color: slice.isFreeTime ? 'var(--tw-prose-counters)' : slice.color
                    }}
                  >
                    {slice.isFreeTime ? (
                      <Sparkles className="w-4.5 h-4.5 text-zinc-400 dark:text-zinc-500" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: slice.color, filter: `drop-shadow(0 0 4px ${slice.color}80)` }} />
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <div className={`text-sm font-semibold truncate transition-colors ${
                        isHovered ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-200'
                      }`}>
                        {slice.title}
                      </div>
                      {slice.category && (
                         <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded md:rounded-md text-[9px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                           {slice.category.replace(/_/g, ' ')}
                         </span>
                      )}
                    </div>
                    
                    {slice.timeRange && !slice.isFreeTime && (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-1.5">
                        <Clock className="w-3 h-3" />
                        {slice.timeRange}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-4 flex flex-col items-end">
                  <div className={`text-sm font-semibold tabular-nums transition-colors ${
                    isHovered ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'
                  }`}>
                    {formatDuration(slice.duration_minutes)}
                  </div>
                  <div className={`text-[11px] font-bold tabular-nums mt-1 px-1.5 py-0.5 rounded-full ${
                    slice.isFreeTime 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {slice.percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
