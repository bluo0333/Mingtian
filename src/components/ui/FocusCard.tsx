import { ArrowLeftRight, ChevronUp, Play } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const BUTTON_PHRASES = [
  '明天 starts now',
  'Find your current',
  'Ink the next line',
  'Chase the light',
  'Tend the garden',
];

interface FocusCardProps {
  eyebrow: string;
  task: string;
  sub?: string;
  onStart?: () => void;
  onSwitch?: () => void;
  isExpanded?: boolean;
}

export default function FocusCard({ eyebrow, task, sub, onStart, onSwitch, isExpanded = false }: FocusCardProps) {
  const [phraseIndex, setPhraseIndex] = useState(() => Math.floor(Math.random() * BUTTON_PHRASES.length));

  useEffect(() => {
    if (isExpanded) return;
    const id = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % BUTTON_PHRASES.length);
    }, 3000);
    return () => clearInterval(id);
  }, [isExpanded]);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="rounded-3xl p-6 relative overflow-hidden border border-jade-500/25 dark:border-dark-500/30 shadow-soft bg-gradient-to-br from-jade-700 via-jade-600 to-jade-500 dark:from-[#18201d] dark:via-[#1b2420] dark:to-[#202b25]"
    >
      <div className="absolute -right-8 -top-6 h-24 w-24 rounded-full bg-white/15 dark:bg-dark-400/10 blur-2xl" />
      <div className="flex items-start justify-between mb-2 relative z-10">
        <div className="text-xs font-semibold uppercase tracking-[0.15em] text-cream-100/95 dark:text-dark-300">
          {eyebrow}
        </div>
        {onSwitch && (
          <button
            type="button"
            onClick={onSwitch}
            className="flex items-center justify-center h-6 w-6 rounded-full bg-white/15 dark:bg-charcoal-900/30 hover:bg-white/25 dark:hover:bg-charcoal-900/50 transition-colors text-white/70 dark:text-dark-300 hover:text-white dark:hover:text-dark-100"
            aria-label="Switch focus task"
          >
            <ArrowLeftRight size={12} />
          </button>
        )}
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
          {isExpanded ? (
            <>
              <ChevronUp size={14} className="shrink-0" />
              Hide steps
            </>
          ) : (
            <>
              <Play size={14} className="shrink-0" />
              <span className="relative inline-flex whitespace-nowrap">
                <span className="invisible select-none">
                  {BUTTON_PHRASES.reduce((a, b) => (a.length > b.length ? a : b))}
                </span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={phraseIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                    className="absolute inset-0 flex items-center"
                  >
                    {BUTTON_PHRASES[phraseIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </>
          )}
        </button>
      )}
    </motion.div>
  );
}
