import { motion } from 'framer-motion';
import { Sun, Sunrise } from 'lucide-react';

interface StreakTrailProps {
  streak: number;
  completedDates: Set<string>;
}

interface TrailDay {
  stamp: string;
  label: string;
  isToday: boolean;
  isComplete: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const dayStamp = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildTrailDays = (completedDates: Set<string>): TrailDay[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getTime() - (6 - index) * DAY_MS);
    const stamp = dayStamp(date);

    return {
      stamp,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: index === 6,
      isComplete: completedDates.has(stamp),
    };
  });
};

export default function StreakTrail({ streak, completedDates }: StreakTrailProps) {
  const days = buildTrailDays(completedDates);
  const todayComplete = days[days.length - 1]?.isComplete ?? false;
  const helperText = todayComplete ? 'Today is locked in' : 'Keep it alive today';
  const streakLabel = `${streak} day streak`;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="card-soft col-span-2 p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-3xl font-semibold leading-none text-jade-700 dark:text-dark-200">
            <Sunrise size={28} strokeWidth={2.2} className="text-gold" aria-hidden="true" />
            <span>{streakLabel}</span>
          </div>
          <p className="mt-2 text-sm font-medium text-muted dark:text-charcoal-200">{helperText}</p>
        </div>
      </div>

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
  );
}
