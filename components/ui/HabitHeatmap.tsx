'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './cn';

export interface HeatmapEntry {
  date: string;   // ISO date string, e.g. "2025-01-15"
  level: 0 | 1 | 2 | 3 | 4 | 5;
}

interface HeatmapProps {
  data: HeatmapEntry[];
  className?: string;
  weeks?: number;   // default 52
}

// Monochrome intensity levels (darkest → brightest)
const LEVEL_COLORS: Record<0 | 1 | 2 | 3 | 4 | 5, string> = {
  0: '#141414',
  1: '#2A2A2A',
  2: '#4A4A4A',
  3: '#787878',
  4: '#B0B0B0',
  5: '#F5F5F5',
};

const LEVEL_LABELS: Record<0 | 1 | 2 | 3 | 4 | 5, string> = {
  0: 'No activity',
  1: 'Very low',
  2: 'Low',
  3: 'Moderate',
  4: 'High',
  5: 'Max',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function buildGrid(data: HeatmapEntry[], totalWeeks: number) {
  const map = new Map<string, HeatmapEntry['level']>();
  data.forEach((d) => map.set(d.date, d.level));

  // Build from today backwards for `totalWeeks` weeks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from the Sunday of the week `totalWeeks` ago
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - today.getDay() - (totalWeeks - 1) * 7);

  const weeks: Array<Array<{ date: string; level: 0 | 1 | 2 | 3 | 4 | 5; isFuture: boolean }>> = [];

  for (let w = 0; w < totalWeeks; w++) {
    const week: typeof weeks[0] = [];
    for (let d = 0; d < 7; d++) {
      const cell = new Date(startDate);
      cell.setDate(startDate.getDate() + w * 7 + d);
      const iso = cell.toISOString().split('T')[0];
      week.push({
        date: iso,
        level: (map.get(iso) ?? 0) as HeatmapEntry['level'],
        isFuture: cell > today,
      });
    }
    weeks.push(week);
  }

  return { weeks, startDate };
}

function getMonthMarkers(
  weeks: ReturnType<typeof buildGrid>['weeks'],
) {
  const markers: Array<{ weekIdx: number; month: string }> = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const d = new Date(week[0].date);
    const m = d.getMonth();
    if (m !== lastMonth) {
      markers.push({ weekIdx: wi, month: MONTH_LABELS[m] });
      lastMonth = m;
    }
  });
  return markers;
}

interface TooltipState {
  date: string;
  level: 0 | 1 | 2 | 3 | 4 | 5;
  x: number;
  y: number;
}

export function HabitHeatmap({ data, className, weeks: totalWeeks = 52 }: HeatmapProps) {
  const { weeks } = buildGrid(data, totalWeeks);
  const monthMarkers = getMonthMarkers(weeks);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const CELL = 13;
  const GAP = 2;
  const STEP = CELL + GAP;

  return (
    <div className={cn('relative font-sans', className)}>
      <div className="overflow-x-auto pb-2">
        <div style={{ minWidth: totalWeeks * STEP + 32 }}>
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {weeks.map((_, wi) => {
              const marker = monthMarkers.find((m) => m.weekIdx === wi);
              return (
                <div
                  key={wi}
                  style={{ width: STEP, flexShrink: 0 }}
                  className="text-[9px] text-[#555555]"
                >
                  {marker?.month ?? ''}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col mr-1" style={{ gap: GAP }}>
              {DAY_LABELS.map((day, di) => (
                <div
                  key={day}
                  style={{ height: CELL, width: 28 }}
                  className="text-[9px] text-[#555555] flex items-center justify-end pr-1"
                >
                  {/* Show only Mon / Wed / Fri */}
                  {di % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex" style={{ gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                  {week.map((cell) => (
                    <motion.div
                      key={cell.date}
                      style={{
                        width: CELL,
                        height: CELL,
                        backgroundColor: cell.isFuture
                          ? 'transparent'
                          : LEVEL_COLORS[cell.level],
                        borderWidth: cell.isFuture ? 1 : 0,
                        borderColor: 'rgba(255,255,255,0.06)',
                        borderStyle: 'solid',
                      }}
                      className="rounded-[2px] cursor-default"
                      whileHover={cell.isFuture ? {} : { scale: 1.3, zIndex: 10 }}
                      transition={{ duration: 0.12 }}
                      onMouseEnter={(e) => {
                        if (!cell.isFuture) {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setTooltip({
                            date: cell.date,
                            level: cell.level,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      aria-label={
                        cell.isFuture
                          ? undefined
                          : `${cell.date}: ${LEVEL_LABELS[cell.level]}`
                      }
                      role={cell.isFuture ? undefined : 'img'}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 ml-8">
            <span className="text-[10px] text-[#555555] mr-1">Less</span>
            {([0, 1, 2, 3, 4, 5] as const).map((lvl) => (
              <div
                key={lvl}
                style={{ width: CELL, height: CELL, backgroundColor: LEVEL_COLORS[lvl] }}
                className="rounded-[2px]"
                aria-label={LEVEL_LABELS[lvl]}
              />
            ))}
            <span className="text-[10px] text-[#555555] ml-1">More</span>
          </div>
        </div>
      </div>

      {/* Floating tooltip — rendered in document flow at fixed position */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="fixed z-50 pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y - 8, transform: 'translate(-50%, -100%)' }}
          >
            <div className="bg-[#1a1a1a] border border-white/12 rounded-lg px-3 py-2 text-[11px] font-sans text-[#F5F5F5] shadow-card whitespace-nowrap">
              <span className="text-[#A0A0A0]">{tooltip.date}</span>
              <span className="mx-2 text-[#333]">·</span>
              {LEVEL_LABELS[tooltip.level]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
