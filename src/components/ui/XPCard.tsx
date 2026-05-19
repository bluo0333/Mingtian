import { motion } from 'framer-motion';

interface XPCardProps {
  label: string;
  current: number;
  total: number;
}

export default function XPCard({ label, current, total }: XPCardProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="card-soft p-4 sm:p-5">
      <div className="flex justify-between items-center mb-3.5">
        <div className="text-sm text-muted dark:text-charcoal-200">{label}</div>
        <div className="text-sm font-semibold text-jade-700 dark:text-dark-200">{current} / {total} XP</div>
      </div>
      <div className="h-2.5 bg-jade-100/80 dark:bg-charcoal-700/70 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-jade-700 via-jade-600 to-jade-400 dark:from-dark-500 dark:to-dark-300"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
