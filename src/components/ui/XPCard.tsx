import { motion } from 'framer-motion';

const SEGMENTS = 10;

interface XPCardProps {
  label: string;
  current: number;
  total: number;
}

export default function XPCard({ label, current, total }: XPCardProps) {
  const filled = total > 0 ? (current / total) * SEGMENTS : 0;

  return (
    <div className="card-soft p-4 sm:p-5">
      <div className="flex justify-between items-center mb-3.5">
        <div className="text-sm text-muted dark:text-charcoal-200">{label}</div>
        <div className="text-sm font-semibold text-jade-700 dark:text-dark-200">{current} / {total} XP</div>
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
