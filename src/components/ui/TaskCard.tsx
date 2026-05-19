import { Check, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskCardProps {
  name: string;
  steps?: string;
  xp: number;
  isDone?: boolean;
  isInProgress?: boolean;
  onToggleDone?: () => void;
  onDelete?: () => void;
}

export default function TaskCard({
  name,
  steps,
  xp,
  isDone,
  isInProgress,
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
      className={`card-soft p-4 sm:p-5 flex items-center gap-3 ${
      isInProgress ? 'border-jade-300 dark:border-dark-600' : ''
    }`}>
      {onToggleDone ? (
        <button
          type="button"
          onClick={onToggleDone}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${circleClasses}`}
          aria-label={isDone ? `Task ${name} is done` : `Mark ${name} as done`}
        >
          {isDone && <Check size={12} className="text-white" />}
        </button>
      ) : (
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${circleClasses}`}>
          {isDone && <Check size={12} className="text-white" />}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={`text-lg font-semibold ${isDone ? 'text-jade-400 dark:text-charcoal-400 line-through' : 'jade-text dark:text-dark-100'}`}>
          {name}
        </div>
        {steps && (
          <div className="text-sm text-muted dark:text-charcoal-200 mt-1">
            {steps}
          </div>
        )}
      </div>
      <div className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
        isDone ? 'text-success bg-success/10 dark:text-success dark:bg-success/15' : 'text-jade-700 bg-jade-100/70 dark:text-dark-200 dark:bg-charcoal-700/70'
      }`}>
        +{xp} XP
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="text-jade-400 hover:text-red-500 dark:text-charcoal-300 dark:hover:text-red-400 transition-colors"
          aria-label={`Delete ${name}`}
        >
          <Trash2 size={15} />
        </button>
      )}
    </motion.div>
  );
}
