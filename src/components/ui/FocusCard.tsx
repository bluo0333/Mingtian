import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface FocusCardProps {
  eyebrow: string;
  task: string;
  sub?: string;
  onStart?: () => void;
}

export default function FocusCard({ eyebrow, task, sub, onStart }: FocusCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="rounded-3xl p-6 relative overflow-hidden border border-jade-500/25 dark:border-dark-500/30 shadow-soft bg-gradient-to-br from-jade-700 via-jade-600 to-jade-500 dark:from-[#18201d] dark:via-[#1b2420] dark:to-[#202b25]"
    >
      <div className="absolute -right-8 -top-6 h-24 w-24 rounded-full bg-white/15 dark:bg-dark-400/10 blur-2xl" />
      <div className="text-xs font-semibold uppercase tracking-[0.15em] text-cream-100/95 dark:text-dark-300 mb-2 relative z-10">
        {eyebrow}
      </div>
      <div className="text-3xl font-semibold text-white dark:text-dark-100 mb-1 relative z-10">
        {task}
      </div>
      {sub && (
        <div className="text-base text-white/80 dark:text-dark-300 mb-5 relative z-10">
          {sub}
        </div>
      )}
      {onStart && (
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/45 dark:border-dark-400/50 bg-white/18 dark:bg-charcoal-900/40 px-5 py-2.5 text-base font-medium text-white dark:text-dark-100 hover:bg-white/26 dark:hover:bg-charcoal-900/60 transition-colors relative z-10"
        >
          <Play size={14} />
          Start timer
        </button>
      )}
    </motion.div>
  );
}
