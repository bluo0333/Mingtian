import { AnimatePresence, motion } from 'framer-motion';
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
  const todayComplete = days.find((day) => day.isToday)?.isComplete ?? false;
  const helperText = todayComplete ? 'Today is locked in' : 'Keep it alive today';
  const streakLabel = `${streak} day streak`;
  const expandedDays = buildTrailDays(
    completedDates,
    new Date(getWeekStart(new Date()).getTime() - 14 * DAY_MS),
    21,
  );
  const expandedWeeks = Array.from({ length: 3 }, (_, index) =>
    expandedDays.slice(index * 7, index * 7 + 7),
  );
  const weekdayLabels = days.map((day) => day.label);
  const toggleExpanded = () => setIsExpanded((value) => !value);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="card-soft col-span-2 p-4 sm:p-5"
    >
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
            <p className="mt-2 text-sm font-medium text-muted dark:text-charcoal-200">{helperText}</p>
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

      <AnimatePresence initial={false}>
        {!isExpanded && (
          <motion.div
            key="current-week-trail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="mt-4 grid grid-cols-7 gap-2">
              {days.map((day) => (
                <div key={day.stamp} className="min-w-0 text-center">
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
                        day.isComplete || day.isToday
                          ? 'text-gold'
                          : 'text-jade-200 dark:text-charcoal-500'
                      }
                      aria-hidden="true"
                    />
                  </div>
                  <div
                    className={`mt-1 text-[11px] font-semibold leading-none ${
                      day.isToday
                        ? 'text-jade-800 dark:text-dark-100'
                        : 'text-muted dark:text-charcoal-300'
                    }`}
                  >
                    {day.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {isExpanded && (
          <motion.div
            key="streak-calendar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="mt-4 border-t border-jade-100 pt-4 dark:border-charcoal-700">
              <div className="grid grid-cols-7 gap-1.5 px-1 pb-2">
                {weekdayLabels.map((label) => (
                  <div
                    key={label}
                    className="text-center text-[10px] font-bold uppercase leading-none text-muted dark:text-charcoal-300"
                  >
                    {label.slice(0, 2)}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {expandedWeeks.map((week, weekIndex) => (
                  <motion.div
                    key={week[0].stamp}
                    initial={{ opacity: 0, y: weekIndex === 2 ? -22 : -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.24,
                      ease: [0.4, 0, 0.2, 1],
                      delay: weekIndex * 0.04,
                    }}
                  >
                    <div className="grid grid-cols-7 gap-2">
                      {week.map((day) => (
                        <div
                          key={day.stamp}
                          className={`min-w-0 text-center ${
                            day.isFuture ? 'opacity-60' : day.isCurrentMonth ? '' : 'opacity-45'
                          }`}
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
                                day.isComplete || day.isToday
                                  ? 'text-gold'
                                  : 'text-jade-200 dark:text-charcoal-500'
                              }
                              aria-hidden="true"
                            />
                          </div>
                          <div
                            className={`mt-1 text-[10px] font-semibold leading-none ${
                              day.isToday
                                ? 'text-jade-800 dark:text-dark-100'
                                : day.isCurrentMonth
                                ? 'text-muted dark:text-charcoal-300'
                                : 'text-muted dark:text-charcoal-500'
                            }`}
                          >
                            {day.dayOfMonth}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
