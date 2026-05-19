import { Check } from 'lucide-react';

interface TaskCardProps {
  name: string;
  steps?: string;
  xp: number;
  isDone?: boolean;
  isInProgress?: boolean;
}

export default function TaskCard({ name, steps, xp, isDone, isInProgress }: TaskCardProps) {
  return (
    <div className={`bg-white dark:bg-charcoal-800 border border-jade-200 dark:border-dark-700/20 rounded-xl p-4 flex items-center gap-3 ${
      isInProgress ? 'border-jade-300 dark:border-dark-600' : ''
    }`}>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        isDone
          ? 'bg-jade-600 dark:bg-dark-500 border-jade-600 dark:border-dark-500'
          : 'border-jade-300 dark:border-dark-600'
      }`}>
        {isDone && <Check size={12} className="text-white dark:text-charcoal-900" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${isDone ? 'text-jade-400 dark:text-charcoal-500 line-through' : 'text-jade-800 dark:text-dark-50'}`}>
          {name}
        </div>
        {steps && (
          <div className="text-xs text-jade-500 dark:text-charcoal-400 mt-1">
            {steps}
          </div>
        )}
      </div>
      <div className={`text-xs font-medium px-2 py-1 rounded-full ${
        isDone ? 'text-jade-600 dark:text-dark-400 bg-jade-50 dark:bg-dark-900/50' : 'text-jade-600 dark:text-dark-400 bg-jade-50 dark:bg-dark-900/50'
      }`}>
        +{xp} XP
      </div>
    </div>
  );
}