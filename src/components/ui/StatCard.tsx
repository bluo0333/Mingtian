import { motion } from 'framer-motion';

interface StatCardProps {
  value: string;
  label: string;
  isAccent?: boolean;
}

export default function StatCard({ value, label, isAccent }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="card-soft p-4 sm:p-5"
    >
      <div className={`text-3xl font-semibold leading-none ${isAccent ? 'text-jade-700 dark:text-dark-200' : 'jade-text dark:text-dark-100'}`}>
        {value}
      </div>
      <div className="text-sm text-muted dark:text-charcoal-200 mt-2">
        {label}
      </div>
    </motion.div>
  );
}
