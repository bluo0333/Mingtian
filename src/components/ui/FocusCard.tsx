import { Play } from 'lucide-react';

interface FocusCardProps {
  eyebrow: string;
  task: string;
  sub?: string;
  onStart?: () => void;
}

export default function FocusCard({ eyebrow, task, sub, onStart }: FocusCardProps) {
  return (
    <div className="bg-jade-600 dark:bg-charcoal-800 border border-jade-300 dark:border-dark-600/30 rounded-xl p-5 relative overflow-hidden">
      {/* Subtle brush stroke for dark mode */}
      <div className="absolute -right-3 -top-3 w-16 h-16 opacity-5 dark:opacity-10">
        <svg viewBox="0 0 55 55" className="w-full h-full text-dark-400">
          <ellipse cx="27" cy="27" rx="25" ry="18" fill="currentColor" transform="rotate(-25 27 27)" />
        </svg>
      </div>
      <div className="text-xs font-medium uppercase tracking-wide text-white dark:text-dark-300 mb-1 relative z-10">
        {eyebrow}
      </div>
      <div className="text-lg font-medium text-white dark:text-dark-50 mb-1 relative z-10">
        {task}
      </div>
      {sub && (
        <div className="text-sm text-white/70 dark:text-dark-300 mb-4 relative z-10">
          {sub}
        </div>
      )}
      {onStart && (
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 bg-white/20 dark:bg-dark-800/50 border border-white/30 dark:border-dark-600 rounded-full px-4 py-2 text-sm text-white dark:text-dark-200 hover:bg-white/30 dark:hover:bg-dark-700/50 transition-colors relative z-10"
        >
          <Play size={14} />
          Start timer
        </button>
      )}
    </div>
  );
}