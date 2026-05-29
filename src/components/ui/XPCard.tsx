import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const SEGMENTS = 10;

interface XPCardProps {
  level: number;
  message: string;
  current: number;
  total: number;
  totalXp: number;
}

export default function XPCard({ level, message, current, total, totalXp }: XPCardProps) {
  const filled = total > 0 ? (current / total) * SEGMENTS : 0;

  return (
    <div className="card-soft p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-jade-700 text-white shadow-[0_4px_0_rgba(22,101,52,0.35)] dark:bg-[#b8962a] dark:text-charcoal-900">
            <span className="text-[10px] font-black uppercase leading-none tracking-wide">Level</span>
            <span className="text-2xl font-black leading-none">{level}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-base font-bold jade-text dark:text-dark-100">
              <Star size={15} fill="currentColor" />
              {message}
            </div>
            <div className="mt-0.5 text-xs font-semibold text-muted dark:text-charcoal-200">
              {totalXp} XP earned
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-bold text-jade-700 dark:text-dark-200">{current}/{total}</div>
          <div className="text-[11px] font-semibold text-muted dark:text-charcoal-300">to Level {level + 1}</div>
        </div>
      </div>
      <div className="flex gap-[3px]">
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const segFill = Math.max(0, Math.min(1, filled - i));
          return (
            <div
              key={i}
              className="flex-1 h-[10px] rounded-[3px] overflow-hidden bg-jade-100 dark:bg-charcoal-700/80"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-jade-800 to-jade-500 dark:from-dark-400 dark:to-dark-200"
                initial={{ width: 0 }}
                animate={{ width: `${segFill * 100}%` }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: i * 0.03 }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
