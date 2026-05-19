interface XPCardProps {
  label: string;
  current: number;
  total: number;
}

export default function XPCard({ label, current, total }: XPCardProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="bg-white dark:bg-charcoal-800 border border-jade-200 dark:border-dark-700/20 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs text-jade-600 dark:text-charcoal-300">{label}</div>
        <div className="text-xs font-medium text-jade-600 dark:text-dark-400">{current} / {total} XP</div>
      </div>
      <div className="h-2 bg-jade-100 dark:bg-charcoal-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-jade-600 dark:bg-dark-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}