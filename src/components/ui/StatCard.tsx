interface StatCardProps {
  value: string;
  label: string;
  isAccent?: boolean;
}

export default function StatCard({ value, label, isAccent }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-charcoal-800 border border-jade-200 dark:border-dark-700/20 rounded-xl p-4">
      <div className={`text-xl font-medium ${isAccent ? 'text-jade-600 dark:text-dark-400' : 'text-jade-800 dark:text-dark-50'}`}>
        {value}
      </div>
      <div className="text-xs text-jade-500 dark:text-charcoal-400 mt-1">
        {label}
      </div>
    </div>
  );
}