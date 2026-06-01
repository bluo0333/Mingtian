import { motion } from 'framer-motion';
import { ChevronDown, Sun, Sunrise } from 'lucide-react';
import { useState } from 'react';

interface StreakTrailProps {
  streak: number;
  completedDates: Set<string>;
}

interface TrailDay {
  stamp: string;
  label: string;
  dayOfMonth: string;
  isToday: boolean;
  isComplete: boolean;
  isFuture: boolean;
  isCurrentMonth: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_HEADER_HEIGHT = 18;
const REVEAL_OFFSET = 124;
const TRAIL_ROW_HEIGHT = 56;
const COLLAPSED_TRAIL_HEIGHT = WEEKDAY_HEADER_HEIGHT + TRAIL_ROW_HEIGHT;
const EXPANDED_TRAIL_HEIGHT = WEEKDAY_HEADER_HEIGHT + REVEAL_OFFSET + TRAIL_ROW_HEIGHT;
const smoothTransition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] };

const dayStamp = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekStart = (date: Date): Date => {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  return weekStart;
};

const buildTrailDays = (completedDates: Set<string>, startDate?: Date, length = 7): TrailDay[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStamp = dayStamp(today);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const weekStart = startDate ? new Date(startDate) : getWeekStart(today);
  weekStart.setHours(0, 0, 0, 0);

  return Array.from({ length }, (_, index) => {
    const date = new Date(weekStart.getTime() + index * DAY_MS);
    const stamp = dayStamp(date);

    return {
      stamp,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayOfMonth: date.toLocaleDateString('en-US', { day: 'numeric' }),
      isToday: stamp === todayStamp,
      isComplete: completedDates.has(stamp),
      isFuture: date.getTime() > today.getTime(),
      isCurrentMonth: date.getMonth() === currentMonth && date.getFullYear() === currentYear,
    };
  });
};

export default function StreakTrail({ streak, completedDates }: StreakTrailProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const days = buildTrailDays(completedDates);
  const streakLabel = `${streak} day streak`;
  const expandedDays = buildTrailDays(
    completedDates,
    new Date(getWeekStart(new Date()).getTime() - 14 * DAY_MS),
    21,
  );
  const expandedWeeks = Array.from({ length: 3 }, (_, index) =>
    expandedDays.slice(index * 7, index * 7 + 7),
  );
  const previousWeeks = expandedWeeks.slice(0, 2);
  const weekdayLabels = days.map((day) => day.label);
  const toggleExpanded = () => setIsExpanded((value) => !value);
  const renderTrailDay = (day: TrailDay, label: string, isCalendarDay = false) => (
    <div
      key={day.stamp}
      className={`min-w-0 text-center ${isCalendarDay && day.isFuture ? 'opacity-60' : ''}`}
    >
      <div
        className={`mx-auto flex aspect-square w-full max-w-10 items-center justify-center rounded-full border transition-colors ${
          day.isToday
            ? 'border-gold bg-gold/18 ring-2 ring-gold/30 dark:bg-dark-300/18'
            : day.isComplete
            ? 'border-gold/70 bg-gold/16 dark:bg-dark-300/14'
            : 'border-jade-100 bg-white/55 dark:border-charcoal-600 dark:bg-charcoal-800/70'
        }`}
      >
        <Sun
          size={day.isToday ? 18 : 16}
          strokeWidth={day.isComplete || day.isToday ? 2.4 : 2}
          className={
            day.isComplete || day.isToday ? 'text-gold' : 'text-jade-200 dark:text-charcoal-500'
          }
          aria-hidden="true"
        />
      </div>
      <div
        className={`mt-1 font-semibold leading-none ${
          isCalendarDay ? 'text-[10px]' : 'text-[11px]'
        } ${
          day.isToday
            ? 'text-jade-800 dark:text-dark-100'
            : !day.isCurrentMonth
            ? 'text-muted dark:text-charcoal-500'
            : 'text-muted dark:text-charcoal-300'
        }`}
      >
        {label}
      </div>
    </div>
  );

  return (
    <div className="card-soft col-span-2 p-4 sm:p-5">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={toggleExpanded}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleExpanded();
          }
        }}
        className="cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-3xl font-semibold leading-none text-jade-700 dark:text-dark-200">
              <Sunrise size={28} strokeWidth={2.2} className="text-gold" aria-hidden="true" />
              <span>{streakLabel}</span>
            </div>
          </div>
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-jade-100 bg-white/55 text-jade-700 transition-colors dark:border-charcoal-600 dark:bg-charcoal-800/70 dark:text-dark-200">
            <ChevronDown
              size={17}
              strokeWidth={2.2}
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <motion.div
        animate={{ height: isExpanded ? EXPANDED_TRAIL_HEIGHT : COLLAPSED_TRAIL_HEIGHT }}
        transition={smoothTransition}
        className="relative mt-4 overflow-hidden"
      >
        <div className="grid grid-cols-7 gap-2 pb-2">
          {weekdayLabels.map((label) => (
            <div
              key={label}
              className="text-center text-[10px] font-bold uppercase leading-none text-muted dark:text-charcoal-300"
            >
              {label.slice(0, 2)}
            </div>
          ))}
        </div>
        <motion.div
          aria-hidden={!isExpanded}
          animate={{ opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-x-0"
          style={{ top: WEEKDAY_HEADER_HEIGHT }}
        >
          <div className="space-y-3">
            {previousWeeks.map((week) => (
              <div key={week[0].stamp}>
                <div className="grid grid-cols-7 gap-2">
                  {week.map((day) => renderTrailDay(day, day.dayOfMonth, true))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          animate={{ y: isExpanded ? REVEAL_OFFSET : 0 }}
          transition={smoothTransition}
          className="absolute inset-x-0"
          style={{ top: WEEKDAY_HEADER_HEIGHT }}
        >
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => renderTrailDay(day, day.dayOfMonth))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
