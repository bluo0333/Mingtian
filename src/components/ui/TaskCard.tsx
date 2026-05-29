import { Check, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskCardProps {
  name: string;
  steps?: string;
  xp: number;
  isDone?: boolean;
  isInProgress?: boolean;
  isFocus?: boolean;
  onToggleDone?: () => void;
  onDelete?: () => void;
}

export default function TaskCard({
  name,
  steps,
  xp,
  isDone,
  isInProgress,
  isFocus,
  onToggleDone,
  onDelete,
}: TaskCardProps) {
  const circleClasses = isDone
    ? 'bg-success border-success'
    : 'border-jade-300 dark:border-dark-500';

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 23 }}
      className={`card-soft p-4 sm:p-5 flex items-start gap-3 transition-shadow ${
        isFocus
          ? 'ring-2 ring-jade-400/55 dark:ring-dark-400/55 ring-offset-1 ring-offset-[#f5f2eb] dark:ring-offset-charcoal-900'
          : isInProgress
          ? 'border-jade-300 dark:border-dark-600'
          : ''
      }`}>
      {onToggleDone ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleDone();
          }}
          className={`mt-1 w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center ${circleClasses}`}
          aria-label={isDone ? `Task ${name} is done` : `Mark ${name} as done`}
        >
          {isDone && <Check size={12} className="text-white" />}
        </button>
      ) : (
        <div className={`mt-1 w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center ${circleClasses}`}>
          {isDone && <Check size={12} className="text-white" />}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={`text-lg font-semibold leading-snug break-words [overflow-wrap:anywhere] ${isDone ? 'text-jade-400 dark:text-charcoal-400 line-through' : 'jade-text dark:text-dark-100'}`}>
          {name}
        </div>
        {steps && (
          <div className="text-sm text-muted dark:text-charcoal-200 mt-1 break-words [overflow-wrap:anywhere]">
            {steps}
          </div>
        )}
      </div>
      <div className={`mt-1 shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${
        isDone ? 'text-success bg-success/10 dark:text-success dark:bg-success/15' : 'text-jade-700 bg-jade-100/70 dark:text-dark-200 dark:bg-charcoal-700/70'
      }`}>
        +{xp} XP
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="mt-1 shrink-0 text-jade-400 hover:text-red-500 dark:text-charcoal-300 dark:hover:text-red-400 transition-colors"
          aria-label={`Delete ${name}`}
        >
          <Trash2 size={15} />
        </button>
      )}
    </motion.div>
  );
}
