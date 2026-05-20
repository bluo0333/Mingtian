import { motion } from 'framer-motion';

interface StatCardProps {
  value: string;
  label: string;
  isAccent?: boolean;
  isStreakCard?: boolean;
}

const isNumericValue = (value: string): boolean => /^\d+$/.test(value.trim());

function StreakFlameIcon() {
  return (
    <svg viewBox="0 0 22 22" className="h-6 w-6 shrink-0" aria-hidden="true">
      <path
        d="M11 2C11 2 15 6 15 10C15 11.8 14.1 13.4 12.7 14.4C13 13.2 12.6 11.8 11.5 11C11.5 12.5 10.7 13.8 9.5 14.6C9.2 13.5 8.4 12.6 7.5 12C7 13 7 14.2 7.5 15.2C6.6 14.4 6 13.2 6 11.8C6 10.2 6.8 8.8 8 8C7.8 9 8 10 8.8 10.7C9.2 8.2 10.2 5.2 11 2Z"
        className="fill-[#4a7c6f] dark:fill-[#b8962a]"
      />
      <path
        d="M11 15C11 16.6 12.3 18 14 18C12.8 18 11.8 17.2 11.4 16.1C11.1 16.7 11 17.4 11 18C11 19.1 10.1 20 9 20C7.9 20 7 19.1 7 18C7 16.3 8.8 15 11 15Z"
        className="fill-[#4a7c6f] dark:fill-[#b8962a]"
      />
      <circle cx="11" cy="18.1" r="1.15" className="fill-[#c0392b] dark:fill-[#9b2335]" />
    </svg>
  );
}

export default function StatCard({ value, label, isAccent, isStreakCard }: StatCardProps) {
  const shouldUseStreakIcon = Boolean(isStreakCard && isNumericValue(value));

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="card-soft p-4 sm:p-5"
    >
      <div
        className={`text-3xl font-semibold leading-none ${isAccent ? 'text-jade-700 dark:text-dark-200' : 'jade-text dark:text-dark-100'} ${
          shouldUseStreakIcon ? 'flex items-center gap-2' : ''
        }`}
      >
        {shouldUseStreakIcon ? (
          <>
            <StreakFlameIcon />
            <span>{value.trim()}</span>
          </>
        ) : (
          value
        )}
      </div>
      <div className="text-sm text-muted dark:text-charcoal-200 mt-2">
        {label}
      </div>
    </motion.div>
  );
}
